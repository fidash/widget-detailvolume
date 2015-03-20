/* global JSTACK */

var VolumeDetails = (function (JSTACK) {
	"use strict";

	/*****************************************************************
	*************************CONSTRUCTOR******************************
	*****************************************************************/	

	function VolumeDetails (volumeId) {
		this.volumeId = volumeId;
	}


	/*****************************************************************
	*****************************PUBLIC*******************************
	*****************************************************************/

	VolumeDetails.prototype = {
		getVolumeDetails: function getVolumeDetails (callback, onError) {
			JSTACK.Nova.Volume.getvolume(this.volumeId, callback, onError);
		},

		deleteVolume: function deleteVolume (callback, onError) {
			JSTACK.Nova.Volume.deletevolume(this.volumeId, callback, onError);
		},

		attachVolume: function attachVolume (instanceId, callback, onError) {
			JSTACK.Nova.attachvolume(instanceId, this.volumeId, callback, onError);
		},

		detachVolume: function detachVolume (instanceId, callback, error) {
			JSTACK.Nova.detachvolume(instanceId, this.volumeId, callback, error);
		},

		createSnapshot: function createSnapshot (name, description, callback, error) {
			JSTACK.Nova.Volume.createsnapshot(this.volumeId, name, description, callback, error);
		},

		deleteSnapshot: function deleteSnapshot (snapshotId, callback, error) {
			JSTACK.Nova.Volume.deletesnapshot(snapshotId, callback, error);
		},

		getSnapshotList: function getSnapshotList (callback, error) {
			JSTACK.Nova.Volume.getsnapshotlist(false, callback, error);
		}
	};


	return VolumeDetails;

})(JSTACK);
