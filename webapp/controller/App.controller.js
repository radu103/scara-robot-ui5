sap.ui.define([
  "com/scara/robot/arm/controller/BaseController",
  "sap/m/MessageToast"
], function(BaseController, MessageToast) {
	"use strict";

	return BaseController.extend("com.scara.robot.arm.controller.App", {

		onInit: function() {

		},

		onBeforeRendering: function() {

		},

		onAfterRendering: function() {

		},

		onExit: function() {

    	},

		onMovePress: function (oEvent) {
			
			this.onOpenDialog();

			// TO DO send data

			MessageToast.show("Sent OK");
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

			// simulate end of operation
			var _timeout = jQuery.sap.delayedCall(3000, this, function () {
				this._dialog.close();
			});
		}	

	});
});
