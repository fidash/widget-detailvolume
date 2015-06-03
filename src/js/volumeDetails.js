/* global JSTACK */

var VolumeDetails = (function (JSTACK) {
	"use strict";

	/*****************************************************************
	*************************CONSTRUCTOR******************************
	*****************************************************************/	

	function VolumeDetails (volumeId, region) {
		this.volumeId = volumeId;
		this.region = region;
	}


	/*****************************************************************
	*****************************PUBLIC*******************************
	*****************************************************************/

	VolumeDetails.prototype = {
		getVolumeDetails: function getVolumeDetails (callback, onError) {
			JSTACK.Nova.Volume.getvolume(this.volumeId, callback, onError, this.region);
		},

		deleteVolume: function deleteVolume (callback, onError) {
			JSTACK.Nova.Volume.deletevolume(this.volumeId, callback, onError, this.region);
		},

		attachVolume: function attachVolume (instanceId, device, callback, onError) {
			JSTACK.Nova.attachvolume(instanceId, this.volumeId, device, callback, onError, this.region);
		},

		detachVolume: function detachVolume (instanceId, callback, error) {
			JSTACK.Nova.detachvolume(instanceId, this.volumeId, callback, error, this.region);
		},

		createSnapshot: function createSnapshot (name, description, callback, error) {
			JSTACK.Nova.Volume.createsnapshot(this.volumeId, name, description, callback, error, this.region);
		},

		deleteSnapshot: function deleteSnapshot (snapshotId, callback, error) {
			JSTACK.Nova.Volume.deletesnapshot(snapshotId, callback, error, this.region);
		},

		getSnapshotList: function getSnapshotList (callback, error) {
			JSTACK.Nova.Volume.getsnapshotlist(false, callback, error, this.region);
		}
	};


	return VolumeDetails;

})(JSTACK);
