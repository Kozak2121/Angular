var m = angular.module('dao');

m.service('securityEventsDao', function(http, securityEventTypes, securityEventStates) {
    return {
        list: function() {
            return http.get('/api/v1/security_event')
                .params(securityEventTypes.defaultDaoParams())
                .params(securityEventStates.defaultDaoParams());
        },
        action: function (eventId, actionId) {
            return http.post('/api/v1/security_event/' + eventId + '/action').body({actions: [actionId]}).run();
        },
        update: function (eventId, data) {
            return http.put('/api/v1/security_event/' + eventId).body(data).run();
        },
        addException: function (data) {
            return http.post('/api/v1/exception').body(data).run();
        },
        listExceptions: function () {
            return http.get('/api/v1/exception');
        },
        deleteException: function (exceptionId) {
            return http.delete('/api/v1/exception/' + exceptionId).run();
        },
        exceptionTypes: function () {
            return http.get('/api/v1/exception/types');
        },
        shadowItApps: function () {
            return http.get('/api/v1/shadow_it_apps');
        },
        stats: function (period, loadShadowIt) {
            return http.get('/api/v1/security_events_stats').params({
                period: period,
                shadow_it_data: loadShadowIt
            }).params(securityEventTypes.defaultDaoParams())
                .params(securityEventStates.defaultDaoParams());
        }
    };
});