'use strict';

class SlidePanel{
    constructor(SlidePanelService){
        this.service = SlidePanelService;
    }
}

angular
    .module('slidePanel')
    .component('slidePanel', {
        templateUrl: 'app/slidePanel/components/slidePanel/slidePanel.html',
        controller: SlidePanel,
        controllerAs: '$ctrl',
        bindings: {
            name: '@',
            actions: '<'
        }
    });

SlidePanel.$inject = ['SlidePanelService'];
