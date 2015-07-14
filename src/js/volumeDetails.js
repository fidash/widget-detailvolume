/* global JSTACK,UI */

var VolumeDetails = (function (JSTACK) {
	"use strict";

	/*****************************************************************
    *                     C O N S T R U C T O R                      *
    *****************************************************************/

	function VolumeDetails () {

		this.delay = 4000;
		this.firstRefresh = true;
		this.error = false;
		this.instanceById = {};

	}


	/*****************************************************************
    *                          P R I V A T E                         *
    *****************************************************************/

    function hasReceivedVolume () {
    	return this.volumeId && this.region;
    }

	function drawDetails (autoRefresh, volumeData) {

		// Adjust refresh delay
		this.delay = (volumeData.volume.status !== null && volumeData.volume.status !== 'available' && volumeData.volume.status !== 'in-use') ? 1000 : 4000;

		UI.buildDetailView(this.instanceById, this.detachVolume, volumeData.volume);
		
		// Keep refreshing if no errors
		if (!this.error && autoRefresh) {
			
			setTimeout(function () {
				this.getVolumeDetails(drawDetails.bind(this, true), onError.bind(this));
			}.bind(this), this.delay);
		}

	}

	function onError (errorResponse) {

		// Build default view if flag deleting is true and error is 404
		if (errorResponse.message === '404 Error') {
			UI.buildDefaultView();
		}
		else {
			this.error = true;
			UI.buildErrorView(errorResponse);
			MashupPlatform.widget.log('Error: ' + JSON.stringify(errorResponse));
		}
		
	}

	function resetInterface () {
        this.error = true;
        UI.buildDefaultView();
    }

	function saveInstanceList (response) {

		var serverList = response.servers;
		var instance;
		$('#id_instance').empty();

		serverList.forEach(function (instance) {

			this.instanceById[instance.id] = instance.name;
			$('#id_instance').append('<option value="' + instance.id + '">' + instance.name + '</option>');

		}.bind(this));

	}

	function receiveVolumeId (wiringData) {

		wiringData = JSON.parse(wiringData);

		JSTACK.Keystone.params.access = wiringData.access;
		JSTACK.Keystone.params.token = wiringData.token;
		JSTACK.Keystone.params.currentstate = 2;

		this.region = wiringData.region;
		this.volumeId = wiringData.id;
		this.error = false;
		this.getVolumeDetails();
		this.firstRefresh = false;

		// Get instances list
		JSTACK.Nova.getserverlist(true, null, saveInstanceList.bind(this), onError.bind(this), this.region);

	}


	/*****************************************************************
    *                          P U B L I C                           *
    *****************************************************************/

	VolumeDetails.prototype = {

		init: function () {

			var callbacks = {
				refresh: this.getVolumeDetails.bind(this),
				delete: this.deleteVolume.bind(this),
				attach: this.attachVolume.bind(this)
			};

			MashupPlatform.wiring.registerCallback('volume_id', receiveVolumeId.bind(this));

			UI.init(callbacks);

		},

		getVolumeDetails: function () {

			if (!hasReceivedVolume.call(this)) {
				onError.call(this, "No volume received yet.");
				return;
			}

			JSTACK.Cinder.getvolume(this.volumeId, drawDetails.bind(this, this.firstRefresh), onError.bind(this), this.region);
		},

		deleteVolume: function () {

			if (!hasReceivedVolume.call(this)) {
				onError.call(this, "No volume received yet.");
				return;
			}

			JSTACK.Cinder.deletevolume(this.volumeId, resetInterface.bind(this), onError.bind(this), this.region);
		},

		attachVolume: function (instanceId, device) {

			if (!hasReceivedVolume.call(this)) {
				onError.call(this, "No volume received yet.");
				return;
			}

			JSTACK.Nova.attachvolume(instanceId, this.volumeId, device, this.getVolumeDetails.bind(this), onError.bind(this), this.region);
		},

		detachVolume: function (instanceId) {

			if (!hasReceivedVolume.call(this)) {
				onError.call(this, "No volume received yet.");
				return;
			}

			JSTACK.Nova.detachvolume(instanceId, this.volumeId, this.getVolumeDetails.bind(this), onError.bind(this), this.region);
		}

		/*createSnapshot: function () {
			JSTACK.Nova.Volume.createsnapshot(this.volumeId, name, description, callback, error, this.region);
		},

		deleteSnapshot: function () {
			JSTACK.Nova.Volume.deletesnapshot(snapshotId, callback, error, this.region);
		},

		getSnapshotList: function () {
			JSTACK.Nova.Volume.getsnapshotlist(false, callback, error, this.region);
		}*/
	};


	return VolumeDetails;

})(JSTACK);
