sap.ui.define([
  "com/scara/robot/arm/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast"
], function(BaseController, JSONModel, MessageToast) {
	"use strict";

	return BaseController.extend("com.scara.robot.arm.controller.App", {

		onInit: function() {
			
			var robotModel = new JSONModel();

			var data = {
				baseSteps : 0,
				baseAngle : 0
			};

			robotModel.setData(data);

			this.setModel(robotModel, "robotModel");

			this.baseCheckIP();
		},

		onBeforeRendering: function() {

		},

		onAfterRendering: function() {

		},

		onExit: function() {

    	},

		baseCheckIP: function(oEvent){

			var oView = this.getView();
			
			var oSwitch = oView.byId("baseSwitch");
			var ip = oView.byId("baseJointIP").getValue();
			
			$.getJSON("http://" + ip + "/position")
				.error(function(error){
					console.log(error);
					oSwitch.setState(false);
				})
				.success(function(data){
					oSwitch.setState(true);
				});
		},

		onMovePress: function (oEvent) {
			
			this.onOpenDialog();

			var oView = this.getView();

			var robotModel = this.getModel("robotModel");
			var oldData = robotModel.getData();

			// TO DO send data
			var baseIP = oView.byId("baseJointIP").getValue();
			var baseSteps = oView.byId("baseJointSteps").getValue();
			var baseAngle = oView.byId("baseJointAngle").getValue();

			var baseDir = '';
			var baseDistance = 0;

			if (baseSteps > oldData.baseSteps){
				baseDir = '/right/';
				baseDistance = baseSteps - oldData.baseSteps;
			}
			else
			{
				baseDir = '/left/';
				baseDistance = oldData.baseSteps - Math.abs(baseSteps);
			}

			if(baseDistance < 0){
				baseDistance = Math.abs(baseDistance);
			}

			var oController = this;

			async.parallel([
					function(callback){
						$.getJSON("http://" + baseIP + baseDir + baseDistance)
							.error(function(error){
								console.log(error);
								callback(null, false);
							})
							.success(function(data){
								
								console.log(data);
								
								if(parseInt(data.message) === baseDistance){
									oldData.baseSteps = baseSteps;
									callback(null, true);
								}

								callback(null, false);
							});
					}
				], function(err, results){
					
					if (err) {
						throw err;
					}

					oController._dialog.close();
					
					if (results[0] === true){
						MessageToast.show("Moved OK !");
					}else{
						MessageToast.show("Failed...\r\nCheck console");
					}
				}
			);
		},

		onOpenDialog: function (oEvent) {

			// instantiate dialog
			if (!this._dialog) {
				this._dialog = sap.ui.xmlfragment("com.scara.robot.arm.view.fragments.BusyDialog", this);
				this.getView().addDependent(this._dialog);
			}

			// open dialog
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._dialog);
			this._dialog.open();
		}	

	});
});
