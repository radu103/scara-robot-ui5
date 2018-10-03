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
				baseDistance = oldData.baseSteps - baseSteps;
			}

			var oController = this;

			async.parallel([
					function(callback){
						$.getJSON("http://" + baseIP + baseDir + baseDistance)
							.error(function(error){
								console.log(error);
								callback();
							})
							.success(function(data){
								console.log(data);
								oldData.baseSteps = baseSteps;
								callback();
							});
					}
				], function(res){
					oController._dialog.close();
					robotModel.setData(oldData);

					MessageToast.show("Moved OK !");
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
