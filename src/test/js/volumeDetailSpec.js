/* global VolumeDetails */

describe('Volume Details', function () {
	"use strict";

	var respServices = null;
	var defaultVolume = null;
	var deletingVolume = null;
	var volumeDetails;


	beforeEach(function () {

		jasmine.getFixtures().fixturesPath = 'base/src/test/fixtures/html';
		loadFixtures('defaultTemplate.html');

		jasmine.getJSONFixtures().fixturesPath = 'base/src/test/fixtures/json';
		respServices = getJSONFixture('respServices.json');
		defaultVolume = getJSONFixture('defaultVolume.json');
		deletingVolume = getJSONFixture('deletingVolume.json');

		volumeDetails = new VolumeDetails();
		volumeDetails.init();

	});

	afterEach(function () {

		MashupPlatform.reset();
		jasmine.resetAll(JSTACK.Keystone);
		jasmine.resetAll(JSTACK.Nova);
		jasmine.resetAll(JSTACK.Cinder);

	});

	function receiveWiringEvent (volumeId) {
		
		var access = respServices.access;
		var wiringData = {
			'id': volumeId,
			'access': access,
			'region': 'Spain2'
		};

		wiringData = JSON.stringify(wiringData);
		var receiveVolumeId = MashupPlatform.wiring.registerCallback.calls.mostRecent().args[1];		

		receiveVolumeId.call(volumeDetails, wiringData);
	}

	function getVolumeDetailsSuccess (response) {

		var callback = JSTACK.Cinder.getvolume.calls.mostRecent().args[1];
		
		callback(response);
	}

	/*********************************************************************************************
	********************************************Tests*********************************************
	*********************************************************************************************/

	it('should call JSTACK.Cinder.getvolume when receives a wiring input event', function () {

		var volumeId = 'id';
		
		receiveWiringEvent(volumeId);

		expect(JSTACK.Cinder.getvolume).toHaveBeenCalled();
	});



	it('should call JSTACK.Cinder.deletevolume', function () {

		var volumeId = 'id';

		receiveWiringEvent(volumeId);
		volumeDetails.deleteVolume();

		expect(JSTACK.Cinder.deletevolume).toHaveBeenCalled();
	});

	it('should build the default view after deleting the volume', function () {
		var buildDefaultViewSpy = spyOn(UI, 'buildDefaultView');
		var deleteCallback;
		var volumeId = 'id';

		receiveWiringEvent(volumeId);
		volumeDetails.deleteVolume();
		deleteCallback = JSTACK.Cinder.deletevolume.calls.mostRecent().args[1];
		deleteCallback();

		expect(buildDefaultViewSpy).toHaveBeenCalled();
		expect(volumeDetails.error).toBe(true);
	});

	it('should build the default view after receiving a 404 error with the deleting flag active', function () {

		var buildDefaultViewSpy = spyOn(UI, 'buildDefaultView').and.callThrough();
		var volumeId = 'id';
		var errorCallback;

		receiveWiringEvent(volumeId);
		getVolumeDetailsSuccess(deletingVolume);
		errorCallback = JSTACK.Cinder.getvolume.calls.mostRecent().args[2];
		errorCallback({message: '404 Error', body: 'Not found.'});

		expect(buildDefaultViewSpy).toHaveBeenCalled();
	});

	it('should call buildDetailView after successfully getting an volume\'s details', function () {

		var buildDetailViewSpy = spyOn(UI, 'buildDetailView');
		var volumeId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
		var successCallback;

		receiveWiringEvent(volumeId);
		successCallback = JSTACK.Cinder.getvolume.calls.mostRecent().args[1];
		successCallback(defaultVolume);

		expect(buildDetailViewSpy).toHaveBeenCalled();
	});

	it('should call the error function when refresh is called without a volume', function () {

		volumeDetails.getVolumeDetails();

		expect(MashupPlatform.widget.log).toHaveBeenCalledWith('Error: "No volume received yet."');
	});

	it('should call the error function when deleteVolume is called without a volume', function () {

		volumeDetails.deleteVolume();

		expect(MashupPlatform.widget.log).toHaveBeenCalledWith('Error: "No volume received yet."');

	});

	it('should call JSTACK.Cinder.getvolume when refreshing', function () {
		
		var volumeId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';

		receiveWiringEvent(volumeId);
		volumeDetails.getVolumeDetails();

		expect(JSTACK.Cinder.getvolume).toHaveBeenCalled();
	});

	it('should call the error function when the getVolumeDetails call fails', function () {

		var volumeId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
		var errorCallback;

		receiveWiringEvent(volumeId);
		errorCallback = JSTACK.Cinder.getvolume.calls.mostRecent().args[2];
		errorCallback('Call error function');

		expect(MashupPlatform.widget.log).toHaveBeenCalledWith('Error: "Call error function"');
	});

	it('should set the automatic refreshing delay to 1 seconds when status is different from available or in-use', function () {

		var setTimeoutSpy = spyOn(window, 'setTimeout');
		var volumeId = 'id';

		receiveWiringEvent(volumeId);
		getVolumeDetailsSuccess(deletingVolume);
		
		expect(setTimeoutSpy).toHaveBeenCalledWith(jasmine.any(Function), 1000);

	});

	it('should not call setTimeout the second time a wiring event is received', function () {

		var volumeId = 'id';
		var setTimeoutSpy = spyOn(window, 'setTimeout');
		var expectedCountTimeout = setTimeoutSpy.calls.count() + 1;

		receiveWiringEvent(volumeId);
		getVolumeDetailsSuccess(defaultVolume);
		receiveWiringEvent(volumeId);
		getVolumeDetailsSuccess(defaultVolume);

		expect(setTimeoutSpy.calls.count()).toEqual(expectedCountTimeout);
	});

	it('should call Volume.getvolume 4 seconds after receiving the last update', function () {

        var expectedCount, callback;
        var volumeId = 'id';
        var setTimeoutSpy = spyOn(window, 'setTimeout');

        receiveWiringEvent(volumeId);
        expectedCount = JSTACK.Cinder.getvolume.calls.count() + 1;
		getVolumeDetailsSuccess(defaultVolume);
        callback = setTimeoutSpy.calls.mostRecent().args[0];
        callback();

        expect(JSTACK.Cinder.getvolume.calls.count()).toEqual(expectedCount);
        expect(setTimeoutSpy).toHaveBeenCalledWith(jasmine.any(Function), 4000);
            
    });

    it('should not call setTimeout after an error has occurred', function () {

    	var setTimeoutSpy = spyOn(window, 'setTimeout');
    	var volumeId = 'id';
    	var expectedCount = setTimeoutSpy.calls.count();
    	var errorCallback;

    	receiveWiringEvent(volumeId);
    	errorCallback = JSTACK.Cinder.getvolume.calls.mostRecent().args[2];
    	errorCallback('Error');
    	getVolumeDetailsSuccess(defaultVolume);

    	expect(setTimeoutSpy.calls.count()).toEqual(expectedCount);
    });

    it('should call JSTACK.Nova.attachvolume', function () {
    	var volumeId = 'id';

		receiveWiringEvent(volumeId);
		volumeDetails.attachVolume('instanceId', 'device');

		expect(JSTACK.Nova.attachvolume).toHaveBeenCalled();
    });

    it('should call the error function when attach is called without volume', function () {
    	volumeDetails.attachVolume();

		expect(MashupPlatform.widget.log).toHaveBeenCalledWith('Error: "No volume received yet."');
    });

    it('should call JSTACK.Nova.detachvolume', function () {
    	var volumeId = 'id';

		receiveWiringEvent(volumeId);
		volumeDetails.detachVolume('instanceId');

		expect(JSTACK.Nova.detachvolume).toHaveBeenCalled();
    });

    it('should the error function when detach is called without a volume', function () {
    	volumeDetails.detachVolume();

		expect(MashupPlatform.widget.log).toHaveBeenCalledWith('Error: "No volume received yet."');
    });

    it('should save the instance list with each one asociated with its ID', function () {
    	var volumeId = 'id';
    	var saveList;

		receiveWiringEvent(volumeId);
		saveList = JSTACK.Nova.getserverlist.calls.mostRecent().args[2];
		saveList({servers: [{'id':'id1', 'name':'name1'}]});

		expect(volumeDetails.instanceById).toEqual({'id1':'name1'});
    });

});
