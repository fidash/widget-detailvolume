#Detail Volume Widget

[![GitHub license](https://img.shields.io/badge/license-Apache%202-blue.svg)](https://raw.githubusercontent.com/fidash/widget-detailvolume/master/LICENSE)
[![Support badge](https://img.shields.io/badge/support-askbot-yellowgreen.svg)](http://ask.fiware.org)
[![Build Status](https://build.conwet.fi.upm.es/jenkins/view/FI-Dash/job/Widget%20Detail%20Volume/badge/icon)](https://build.conwet.fi.upm.es/jenkins/view/FI-Dash/job/Widget%20Detail%20Volume)

This project is part of [FIWARE](https://www.fiware.org/). This widget is part of FI-Dash component included in FIWARE.

The widget displays all the attributes of an OpenStack Volume available to the user in FIWARE's Cloud. The widget also allows the user to attach, detach,edit and delete the displayed volume.


## Wiring endpoints

The Detail Volume widget has the following wiring endpoints:

|Label|Name|Friendcode|Type|Description|
|:--:|:--:|:--:|:--:|:--:|
|Authentication|authentication|openstack-auth|text|Receive the authentication data via wiring.|
|Volume ID|volume_id|volume_id|text|Receives volume ID and OpenStack service token.|
