var Utils = (function () {
    "use strict";

    function formatDate (dateString) {
        var date = new Date(dateString);
        return date.toUTCString();
    }

    return {
        formatDate: formatDate
    };
})();