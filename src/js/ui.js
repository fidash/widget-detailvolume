/* global VolumeDetails, MashupPlatform, JSTACK  */

var UI = (function () {
	'use strict';


	/*****************************************************************
    *                        C O N S T A N T S                       *
    *****************************************************************/

	var NONUSABLEWIDTH = 158;

	// Colors
	var RED = 'rgb(217, 83, 79)';
	var GREEN = 'green';
	var AMBAR = 'rgb(239, 163, 0)';
	var GRAY = 'gray';


	var STATES = {

		// GREEN
		'available': {
			'class': 'glyphicon glyphicon-ok  fa-inverse',
			'color': GREEN
		},
		'in-use': {
			'class': 'fa fa-link fa-inverse',
			'color': GREEN
		},
		'attaching': {
			'class': 'fa fa-repeat fa-spin  fa-inverse',
			'color': GREEN
		},

		// AMBAR
		'creating': {
			'class': 'fa fa-spinner fa-pulse  fa-inverse',
			'color': AMBAR
		},
		'detaching': {
			'class': 'fa fa-repeat fa-spin  fa-inverse',
			'color': AMBAR
		},

		// RED
		'error': {
			'class': 'fa fa-trash  fa-inverse',
			'color': RED
		},
		'deleting': {
			'class': 'fa fa-trash fa-inverse',
			'color': RED,
			'animation': 'working-animation'
		},
		'error_deleting': {
			'class': 'fa fa-arrows-alt  fa-inverse',
			'color': RED
		}
	};


	/*****************************************************************
    *                          P R I V A T E                         *
    *****************************************************************/

	function setNameMaxWidth (nonUsableWidth) {

		var bodyWidth = $('body').attr('width') > 360 ? $('body').attr('width') : 360;

		$('#volume-name').css('max-width', bodyWidth - nonUsableWidth);

	}

	function showView (viewId) {

		// Hide all views
		$('#error-view').addClass('hide');
		$('#default-view').addClass('hide');
		$('#detail-view').addClass('hide');
		$('body').removeClass('stripes angled-135');

		if (viewId === 'default-view' || viewId === 'error-view') {
			$('body').addClass('stripes angled-135');			
		}

		$('#' + viewId).removeClass('hide');

	}


	/*****************************************************************
    *                          P U B L I C                           *
    *****************************************************************/

    function init (callbacks) {

		// Register resize callback
		MashupPlatform.widget.context.registerCallback(function (newValues) {
			if ('heightInPixels' in newValues || 'widthInPixels' in newValues) {

				// Set body size
				$('body').attr('height', newValues.heightInPixels);
				$('body').attr('width', newValues.widthInPixels);

				// Set name max-width
				setNameMaxWidth(NONUSABLEWIDTH);

			}
		});

		// Init click events
		$('#refresh-button').click(function () {
			callbacks.refresh();
		});

		$('#attach-volume').click(function (e) {
			var instanceId = $('#id_instance').val();
			var device = $('#id_device').val();
			callbacks.attach(instanceId, device);

			e.preventDefault();
		});

		$('#volume-terminate').click(function () {
			callbacks.delete();
		});

		UI.buildDefaultView();

	}

	function buildDetailView (instanceById, detach, volumeData) {

		var statusTooltip = 'Status: ' + volumeData.status;
		var displayableSize = volumeData.size + ' GiB';
		var attachment, instanceId;

		// Remove previous attachments
		$('#volume-attachment span').empty().removeClass();


		// Fields
		$('#volume-name').text(volumeData.display_name);
		$('#volume-name').attr('title', volumeData.display_name);
		$('#volume-id > span').text(volumeData.id);
		$('#volume-availability-zone > span').text(volumeData.availability_zone);
		$('#volume-size > span').text(displayableSize);
		$('#volume-created > span').text(volumeData.created_at);
		$('#volume-description > span').text(volumeData.display_description);
		
		// Status
		$('#volume-status').removeClass('working-animation');
		$('#volume-status > div > i').removeClass();

		$('#volume-status > div > i').addClass(STATES[volumeData.status].class);
		$('#volume-status').css('background-color', STATES[volumeData.status].color);

		if (volumeData.status === 'deleting') {
			$('#volume-status > div > i').addClass(STATES.deleting.class);
			$('#volume-status').css('background-color', STATES.deleting.color);
			$('#volume-status').addClass(STATES.deleting.animation);
		}
		else {
			$('#volume-status > div > i').addClass(STATES[volumeData.status].class);
			$('#volume-status').css('background-color', STATES[volumeData.status].color);
		}

		if (volumeData.status !== 'available') {
			$('#attach-button')
				.addClass('disabled')
				.attr('data-toggle', '');
		}
		else {
			$('#attach-button')
				.removeClass('disabled')
				.attr('data-toggle', 'modal');
		}

		// Set name max-width
		setNameMaxWidth(NONUSABLEWIDTH);

		if (volumeData.attachments.length > 0) {

			instanceId = volumeData.attachments[0].server_id;
			attachment = instanceById[instanceId] ? instanceById[instanceId] : '<i class="fa fa-spinner fa-pulse"></i>';

			$('#volume-attachment span')
				.attr('id', instanceId)
				.addClass('list-group-item')
				.html(attachment);

			// Detach button
			$('<button>')
				.html('<i class="fa fa-chain-broken"></i>')
				.addClass('btn btn-warning pull-right')
				.attr('id', 'detach-button')
				.attr('data-toggle', 'tooltip')
				.attr('data-placement', 'bottom')
				.appendTo('#volume-attachment span');

			// Fix tooltip
			$('#detach-button').attr('data-original-title', 'Detach Volume');

			// Detach click event
			$('#detach-button').click(function () {

				var instanceId = $('#detach-button').parent().attr('id');
				detach(instanceId);
			}.bind(this));
		}
		else {
			$('#volume-attachment span').text('None');
		}

		// Fix tooltips
		$('#volume-status').attr('title', statusTooltip);
		$('#volume-status').attr('data-original-title', $('#volume-status').attr('title'));
		$('#volume-status').attr('title', '');

		$('#volume-name').attr('data-original-title', $('#volume-name').attr('title'));
		$('#volume-name').attr('title', '');

		// Initialize tooltips
		$('[data-toggle="tooltip"]').tooltip();

		showView('detail-view');
	}

	function buildDefaultView () {

		showView('default-view');

	}

	function buildErrorView (errorResponse) {

		// Build
		if (errorResponse.message) {
			$('#error-view').text(errorResponse.message);
		}
		else {
			$('#error-view').text(errorResponse);
		}
		
		showView('error-view');
	}


	return {
		buildDetailView: buildDetailView,
		buildDefaultView: buildDefaultView,
		buildErrorView: buildErrorView,
		init:init
	};

})();