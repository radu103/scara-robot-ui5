sap.ui.define([
  "com/scara/robot/arm/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast"
], function(BaseController, JSONModel, MessageToast) {
	"use strict";

	return BaseController.extend("com.scara.robot.arm.controller.App", {

		busyDialogModel : null,
		robotModel : null,

		onInit: function() {

			// busy Dialog Model
			this.busyDialogModel = new JSONModel();

			var busy = {
				title : "for server",
				text : "waiting"
			}

			this.busyDialogModel.setData(busy);

			this.setModel(this.busyDialogModel, "busyDialog");

			// Robot Model
			this.robotModel = new JSONModel();

			var data = {
				baseSteps : 0,
				baseAngle : 0,
				bodySteps : 0,
				bodyAngle : 0
			};

			this.robotModel.setData(data);

			this.setModel(this.robotModel, "robotModel");

			this.baseCheckIP();
			this.bodyCheckIP();
		},

		onBeforeRendering: function() {

		},

		onAfterRendering: function() {

		},

		onExit: function() {

    	},

		onBaseResetPress : function(){
			
			this.onOpenDialog("Reseting Base...");

			var oController = this;

			var oView = this.getView();
			var baseIP = oView.byId("baseJointIP").getValue();

			$.getJSON("http://" + baseIP + "/reset")
				.error(function(error){
					console.log(error);
				})
				.success(function(data){
					console.log(data);
				});

			setTimeout(function(){
				oController._dialog.close();
			}, 5000);
		},

		onBodyResetPress : function(){
			
			this.onOpenDialog("Reseting Body...");

			var oController = this;

			var oView = this.getView();
			var bodyIP = oView.byId("bodySliderIP").getValue();

			$.getJSON("http://" + bodyIP + "/reset")
				.error(function(error){
					console.log(error);
				})
				.success(function(data){
					console.log(data);
				});

			setTimeout(function(){
				oController._dialog.close();
			}, 5000);
		},

		baseCheckIP : function(oEvent){

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

		bodyCheckIP : function(oEvent){

			var oView = this.getView();
			
			var oSwitch = oView.byId("bodySwitch");
			var ip = oView.byId("bodySliderIP").getValue();
			
			$.getJSON("http://" + ip + "/position")
				.error(function(error){
					console.log(error);
					oSwitch.setState(false);
				})
				.success(function(data){
					oSwitch.setState(true);
				});
		},		

		onMovePress : function (oEvent) {
			
			this.onOpenDialog("Moving XYZ...");

			var oView = this.getView();

			var robotModel = this.getModel("robotModel");
			var oldData = robotModel.getData();

			// base data
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
				baseDistance = Math.abs(oldData.baseSteps - baseSteps);
			}

			if(baseDistance < 0){
				baseDistance = Math.abs(baseDistance);
			}

			// body data
			var bodyIP = oView.byId("bodySliderIP").getValue();
			var bodySteps = oView.byId("bodySliderSteps").getValue();
			var bodyAngle = oView.byId("bodySliderAngle").getValue();

			var bodyDir = '';
			var bodyDistance = 0;

			if (bodySteps > oldData.bodySteps){
				bodyDir = '/right/';
				bodyDistance = bodySteps - oldData.bodySteps;
			}
			else
			{
				bodyDir = '/left/';
				bodyDistance = Math.abs(oldData.bodySteps - bodySteps);
			}

			if(bodyDistance < 0){
				bodyDistance = Math.abs(bodyDistance);
			}			

			var oController = this;

			async.parallel([
					//move base
					function(callback){

						if (baseDistance === 0){
							callback(null, true);
						}

						$.getJSON("http://" + baseIP + baseDir + baseDistance)
							.error(function(error){
								console.log(error);
								callback(null, false);
							})
							.success(function(data){
								
								console.log(data);
								
								if (parseInt(data.message, 10) === baseDistance){
									oldData.baseSteps = baseSteps;
									callback(null, true);
								} else {
									callback(null, false);
								}	
							});
					},
					// move body
					function(callback){

						if (bodyDistance === 0){
							callback(null, true);
						}

						$.getJSON("http://" + bodyIP + bodyDir + bodyDistance)
							.error(function(error){
								console.log(error);
								callback(null, false);
							})
							.success(function(data){
								
								console.log(data);
								
								if (parseInt(data.message, 10) === bodyDistance){
									oldData.bodySteps = bodySteps;
									callback(null, true);
								} else {
									callback(null, false);
								}
							});
					}
				], function(err, results){
					
					if (err) {
						throw err;
					}

					oController._dialog.close();
					
					var ok = true;

					$.each(results, function(index, res){
						if (res !== true){
							ok = false;
						}
					});

					if (ok){
						MessageToast.show("Moved OK !");
					} else {
						MessageToast.show("FAILED!\r\nCheck console...");
					}
				}
			);
		},

		onOpenDialog : function(title, text) {

			if(title){
				this.busyDialogModel.setProperty('/title', title);
			}

			if(text){
				this.busyDialogModel.setProperty('/text', text);
			}

			// instantiate dialog
			if (!this._dialog) {
				this._dialog = sap.ui.xmlfragment("com.scara.robot.arm.view.dialogs.BusyDialog", this);
				this.getView().addDependent(this._dialog);
			}

			// open dialog
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._dialog);
			this._dialog.open();
		}	

	});
});
