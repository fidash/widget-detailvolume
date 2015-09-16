/* global UI,VolumeDetails */

describe("User Interface", function () {
	"use strict";

	var respServices = null;
	var defaultVolume = null;
	var deletingVolume = null;
	var availableVolume = null;
	var attachedVolume = null;
	var volumeDetails;

	beforeEach(function () {

		jasmine.getFixtures().fixturesPath = 'base/src/test/fixtures/html';
		loadFixtures('defaultTemplate.html');

		jasmine.getJSONFixtures().fixturesPath = 'base/src/test/fixtures/json';
		respServices = getJSONFixture('respServices.json');
		defaultVolume = getJSONFixture('defaultVolume.json');
		deletingVolume = getJSONFixture('deletingVolume.json');
		attachedVolume = getJSONFixture('attachedVolume.json');
		availableVolume = getJSONFixture('availableVolume.json');

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
    *                               I N T E R F A C E   T E S T S                                *
    *********************************************************************************************/

    it('should correctly build the detail view', function () {

		var volumeData = defaultVolume.volume;
		var fields = {
            'id': volumeData.id,
            'availability-zone': volumeData.availability_zone,
            'size': volumeData.size +' GiB',
            'created': volumeData.created_at,
            'description': volumeData.display_description
        };
        var volumeName = volumeData.display_name;
        var statusTitle = 'Status: ' + volumeData.status;

        UI.buildDetailView(['id1','id2'], volumeDetails.detachVolume, volumeData);

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
		var buildErrorViewSpy = spyOn(UI, 'buildErrorView').and.callThrough();
		var message = {
			'message': '500 Error',
			'body': 'Stack trace'
		};
		
		receiveWiringEvent(volumeId);
		errorCallback = JSTACK.Cinder.getvolume.calls.mostRecent().args[2];
		errorCallback(message);

		expect(buildErrorViewSpy).toHaveBeenCalled();
		expect($('#error-view')).toContainText('500 Error');
	});

	it('should call JSTACK.Cinder.getvolume when a click event is triggered on the refresh button', function () {

		var volumeId = 'id';
		var eventSpy = spyOnEvent('#refresh-button', 'click');
		var setTimeoutSpy = spyOn(window, 'setTimeout');
		var expectedCountTimeout, expectedCountImageDetails;

		receiveWiringEvent(volumeId);
		getVolumeDetailsSuccess(defaultVolume);

		expectedCountTimeout = setTimeoutSpy.calls.count();
		expectedCountImageDetails = JSTACK.Cinder.getvolume.calls.count() + 1;
		$('#refresh-button').trigger('click');

		expect('click').toHaveBeenTriggeredOn('#refresh-button');
		expect(JSTACK.Cinder.getvolume.calls.count()).toEqual(expectedCountImageDetails);
		expect(setTimeoutSpy.calls.count()).toEqual(expectedCountTimeout);

	});

	it('should call JSTACK.Cinder.deletevolume when a click event is triggered on the terminate button', function () {
		
		var volumeId = 'id';
		var eventSpy = spyOnEvent('#volume-terminate', 'click');
		var expectedCountDeleteVolume;

		receiveWiringEvent(volumeId);
		getVolumeDetailsSuccess(defaultVolume);

		expectedCountDeleteVolume = JSTACK.Cinder.deletevolume.calls.count() + 1;
		$('#volume-terminate').trigger('click');

		expect('click').toHaveBeenTriggeredOn('#volume-terminate');
		expect(JSTACK.Cinder.deletevolume.calls.count()).toEqual(expectedCountDeleteVolume);
	});

	it('should disable the attach button when volume status is different than available', function () {

		UI.buildDetailView(['id1'], volumeDetails.detachVolume, defaultVolume.volume);

		expect('#attach-button').toHaveClass('disabled');

	});

	it('should enable the attach button when volume status is available', function () {

		UI.buildDetailView(['id1'], volumeDetails.detachVolume, availableVolume.volume);

		expect('#attach-button').not.toHaveClass('disabled');

	});

	it('should create the detach button when volume has an instance attached', function () {

		UI.buildDetailView(['id1'], volumeDetails.detachVolume, attachedVolume.volume);

		expect('#detach-button').toExist();
	});

	it('should call the detach function when the detach button is clicked', function () {

		var eventSpy;
		var detachSpy = jasmine.createSpy('detach');

		UI.buildDetailView(['id1'], detachSpy, attachedVolume.volume);
		eventSpy = spyOnEvent('#detach-button', 'click');

		$('#detach-button').trigger('click');

		expect('click').toHaveBeenTriggeredOn('#detach-button');
		expect(detachSpy).toHaveBeenCalled();
	});

	it('should call attach function when the attach button is clicked', function () {

		var eventSpy = spyOnEvent('#attach-volume', 'click');
		var callbacks = jasmine.createSpyObj('callbacks', ['refresh', 'delete', 'attach']);

		UI.init(callbacks);
		UI.buildDetailView(['id1'], volumeDetails.detachVolume, availableVolume.volume);

		$('#attach-volume').trigger('click');

		expect('click').toHaveBeenTriggeredOn('#attach-volume');
		expect(callbacks.attach).toHaveBeenCalled();
	});

	it('should display a spinner if the attached instance is not available yet', function () {

		UI.buildDetailView(['id1'], volumeDetails.detachVolume, attachedVolume.volume);

		expect('#volume-attachment span').toContainHtml('<i class="fa fa-spinner fa-pulse"></i>');
	});

	it('should display the attached instance id', function () {

		UI.buildDetailView({'8dcc8045-a133-4f1b-b0da-f657de9ada06': 'Hi'}, volumeDetails.detachVolume, attachedVolume.volume);

		expect('#volume-attachment span').toContainText('Hi');
	});

	it('should call buildDefaultView in UI.init', function () {
        var buildDefaultViewSpy = spyOn(UI, 'buildDefaultView');

        UI.init();

        expect(buildDefaultViewSpy).toHaveBeenCalled();
    });

});