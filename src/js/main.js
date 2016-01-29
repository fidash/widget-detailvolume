/* global VolumeDetails */

window.addEventListener('DOMContentLoaded', function () {
    "use strict";

    var volumeDetails = new VolumeDetails();
    volumeDetails.init();
    volumeDetails.authenticate();

}, false);
