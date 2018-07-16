'use strict';

angular
    .module('events')
    .filter('upcomingInDay', ($filter) => 
            (days, params) => _.filter(days, (day) =>  $filter('upcoming')(day.events, params).length > 0));
