/* global VolumeDetails UI receiveVolumeId */

describe('Test volume details', function () {
	"use strict";

	var respServices = null;
	var defaultVolume = null;
	var deletingVolume = null;
	var ui;


	beforeEach(function () {

		JSTACK.Keystone = jasmine.createSpyObj("Keystone", ["init", "authenticate", "gettenants", "params"]);
		JSTACK.Nova = jasmine.createSpyObj("Nova", ["attachvolume", "detachvolume"]);
		JSTACK.Nova.Volume = jasmine.createSpyObj("Volume", ["getvolume", "deletevolume", "createsnapshot", "deletesnapshot", "getsnapshot"]);

		jasmine.getFixtures().fixturesPath = 'src/test/fixtures/html';
		loadFixtures('defaultTemplate.html');

		jasmine.getJSONFixtures().fixturesPath = 'src/test/fixtures/json';
		respServices = getJSONFixture('respServices.json');
		defaultVolume = getJSONFixture('defaultVolume.json');
		deletingVolume = getJSONFixture('deletingVolume.json');

		ui = new UI();
	});

	function receiveWiringEvent (volumeId) {
		
		var access = respServices.access;
		var wiringData = {
			'id': volumeId,
			'access': access
		};

		wiringData = JSON.stringify(wiringData);
		var receiveVolumeId = MashupPlatform.wiring.registerCallback.calls.mostRecent().args[1];		

		receiveVolumeId.call(ui, wiringData);
	}

	function getVolumeDetailsSuccess (response) {

		var callback;

		callback = JSTACK.Nova.Volume.getvolume.calls.mostRecent().args[1];
		callback(response);
	}

	/*********************************************************************************************
	********************************************Tests*********************************************
	*********************************************************************************************/

	it('should call JSTACK.Nova.Volume.getvolume when receives a wiring input event', function () {

		var volumeId = 'id';
		
		receiveWiringEvent(volumeId);

		expect(JSTACK.Nova.Volume.getvolume).toHaveBeenCalled();
		expect(ui.volumeDetails).toExist();
	});



	it('should call JSTACK.Nova.Volume.deletevolume', function () {

		var volumeId = 'id';

		receiveWiringEvent(volumeId);
		ui.deleteVolume();

		expect(JSTACK.Nova.Volume.deletevolume).toHaveBeenCalled();
		expect(ui.volumeDetails).toExist();
	});

	it('should build the default view after receiving a 404 error with the deleting flag active', function () {

		var buildDefaultViewSpy = spyOn(ui, 'buildDefaultView').and.callThrough();
		var volumeId = 'id';
		var errorCallback;

		receiveWiringEvent(volumeId);
		getVolumeDetailsSuccess(deletingVolume);
		errorCallback = JSTACK.Nova.Volume.getvolume.calls.mostRecent().args[2];
		errorCallback({message: '404 Error', body: 'Not found.'});

		expect(buildDefaultViewSpy).toHaveBeenCalled();
	});

	it('should call buildDetailView after successfully getting an volume\'s details', function () {

		var buildDetailViewSpy = spyOn(ui, 'buildDetailView');
		var volumeId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
		var successCallback;

		receiveWiringEvent(volumeId);
		successCallback = JSTACK.Nova.Volume.getvolume.calls.mostRecent().args[1];
		successCallback(defaultVolume);

		expect(buildDetailViewSpy).toHaveBeenCalled();
	});

	it('should call the error function when refresh is called without a volume', function () {

		var expectedCount = MashupPlatform.widget.log.calls.count() + 1;

		ui.refresh();

		expect(MashupPlatform.widget.log.calls.count()).toBe(expectedCount);
		expect(MashupPlatform.widget.log.calls.mostRecent().args).toEqual(['Error: No volume received yet.']);
	});

	it('should call the error function when deleteVolume is called without a volume', function () {

		var expectedCount = MashupPlatform.widget.log.calls.count() + 1;

		ui.deleteVolume();

		expect(MashupPlatform.widget.log.calls.count()).toBe(expectedCount);
		expect(MashupPlatform.widget.log.calls.mostRecent().args).toEqual(['Error: No volume received yet.']);
	});

	it('should call JSTACK.Nova.Volume.getvolume when refreshing', function () {
		
		var volumeId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
		var expectedCount;

		receiveWiringEvent(volumeId);
		expectedCount = JSTACK.Nova.Volume.getvolume.calls.count() + 1;
		ui.refresh();

		expect(JSTACK.Nova.Volume.getvolume.calls.count()).toBe(expectedCount);
	});

	it('should call the error function when the getVolumeDetails call fails', function () {

		var volumeId = 'f3c6536a-4604-47d7-96b7-daf7ff1455ca';
		var errorCallback;

		receiveWiringEvent(volumeId);
		errorCallback = JSTACK.Nova.Volume.getvolume.calls.mostRecent().args[2];
		errorCallback('Call error function');

		expect(MashupPlatform.widget.log).toHaveBeenCalledWith('Error: "Call error function"');
	});

	it('should correctly build the detail view', function () {


		var volumeData = defaultVolume.volume;
		var fields = {
            'id': volumeData.id,
            'availability-zone': volumeData.availability_zone,
            'size': volumeData.size +' GB',
            'created': volumeData.created_at,
            'description': volumeData.display_description
        };
        var volumeName = volumeData.display_name;
        var statusTitle = 'Status: ' + volumeData.status;

        ui.buildDetailView(volumeData);

        for (var field in fields) {
        	// toContainText() only checks if the given string is a substring of the node's text
        	expect($('#volume-' + field + ' > span').text()).toEqual(fields[field]);
        }

        expect($('#volume-name')).toContainText(volumeName);
        expect($('#volume-status').attr('data-original-title')).toEqual(statusTitle);
	});

	it('should change the height value after been given a new height', function () {

		var callback = MashupPlatform.widget.context.registerCallback.calls.mostRecent().args[0];
		var newValues = {
			'heightInPixels': 400
		};

		callback(newValues);
		
		expect($('body').attr('height')).toBe(newValues.heightInPixels.toString());
	});

	it('should change the width value after been given a new width', function () {

		var callback = MashupPlatform.widget.context.registerCallback.calls.mostRecent().args[0];
		var newValues = {
			'widthInPixels': 800
		};

		callback(newValues);
		
		expect($('body').attr('width')).toBe(newValues.widthInPixels.toString());
	});

	it('should not change size after been given an empty new values set', function () {

		var callback = MashupPlatform.widget.context.registerCallback.calls.mostRecent().args[0];
		var newValues = {};
		var bodyExpectedWidth = $('body').attr('width');
		var bodyExpectedHeight = $('body').attr('height');


		callback(newValues);
		
		expect($('body').attr('width')).toBe(bodyExpectedWidth);
		expect($('body').attr('height')).toBe(bodyExpectedHeight);
	});

	it('should build the error view with the correct message', function () {

		var errorCallback;
		var volumeId = 'id';
		var buildErrorViewSpy = spyOn(ui, 'buildErrorView').and.callThrough();
		var message = {
			'message': '500 Error',
			'body': 'Stack trace'
		};
		
		receiveWiringEvent(volumeId);
		errorCallback = JSTACK.Nova.Volume.getvolume.calls.mostRecent().args[2];
		errorCallback(message);

		expect(buildErrorViewSpy).toHaveBeenCalled();
		expect($('#error-view')).toContainText('500 Error');
	});

	it('should set the automatic refreshing delay to 2 seconds while status is diffeerent from available or in-use', function () {

		var setTimeoutSpy = spyOn(window, 'setTimeout');
		var volumeId = 'id';

		receiveWiringEvent(volumeId);
		getVolumeDetailsSuccess(deletingVolume);
		
		expect(setTimeoutSpy).toHaveBeenCalledWith(jasmine.any(Function), 2000);

	});

	it('should call JSTACK.Nova.Volume.getvolume when a click event is triggered on the refresh button', function () {

		var volumeId = 'id';
		var eventSpy = spyOnEvent('#refresh-button', 'click');
		var setTimeoutSpy = spyOn(window, 'setTimeout');
		var expectedCountTimeout, expectedCountImageDetails;

		receiveWiringEvent(volumeId);
		getVolumeDetailsSuccess(defaultVolume);

		expectedCountTimeout = setTimeoutSpy.calls.count();
		expectedCountImageDetails = JSTACK.Nova.Volume.getvolume.calls.count() + 1;
		$('#refresh-button').trigger('click');

		expect(eventSpy).toHaveBeenTriggered();
		expect(JSTACK.Nova.Volume.getvolume.calls.count()).toEqual(expectedCountImageDetails);
		expect(setTimeoutSpy.calls.count()).toEqual(expectedCountTimeout);

	});

	it('should call JSTACK.Nova.Volume.deletevolume when a click event is triggered on the terminate button', function () {
		
		var volumeId = 'id';
		var eventSpy = spyOnEvent('#volume-terminate', 'click');
		var expectedCountDeleteVolume;

		receiveWiringEvent(volumeId);
		getVolumeDetailsSuccess(defaultVolume);

		expectedCountDeleteVolume = JSTACK.Nova.Volume.deletevolume.calls.count() + 1;
		$('#volume-terminate').trigger('click');

		expect(eventSpy).toHaveBeenTriggered();
		expect(JSTACK.Nova.Volume.deletevolume.calls.count()).toEqual(expectedCountDeleteVolume);
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

	it('should call Volume.getvolume 10 seconds after receiving the last update', function () {

        var expectedCount, callback;
        var volumeId = 'id';
        var setTimeoutSpy = spyOn(window, 'setTimeout');

        receiveWiringEvent(volumeId);
        expectedCount = JSTACK.Nova.Volume.getvolume.calls.count() + 1;
		getVolumeDetailsSuccess(defaultVolume);
        callback = setTimeoutSpy.calls.mostRecent().args[0];
        callback();

        expect(JSTACK.Nova.Volume.getvolume.calls.count()).toEqual(expectedCount);
        expect(setTimeoutSpy).toHaveBeenCalledWith(jasmine.any(Function), 10000);
            
    });

    it('should not call setTimeout after an error has occurred', function () {

    	var setTimeoutSpy = spyOn(window, 'setTimeout');
    	var volumeId = 'id';
    	var expectedCount = setTimeoutSpy.calls.count();
    	var errorCallback;

    	receiveWiringEvent(volumeId);
    	errorCallback = JSTACK.Nova.Volume.getvolume.calls.mostRecent().args[2];
    	errorCallback('Error');
    	getVolumeDetailsSuccess(defaultVolume);

    	expect(setTimeoutSpy.calls.count()).toEqual(expectedCount);
    });
});
