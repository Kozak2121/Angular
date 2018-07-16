var m = angular.module('app');

m.service('autologinHelper', function($location) {
    var autologinKey = null;
    var status = false;
    return {
        init: function () {
            if ($location.search().autologin) {
                autologinKey = $location.search().autologin;
                status = true;
                $location.replace();
                $location.search(_($location.search()).omit('autologin'));
            }
        },
        key: function () {
            return autologinKey;
        },
        enabled: function (newState) {
            if (!_(newState).isUndefined()) {
                status = newState;
            }
            return status;
        }
    };
});
