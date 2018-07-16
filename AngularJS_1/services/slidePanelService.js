'use strict';

class SlidePanelService{
    constructor($compile, $rootScope, $animateCss, $log) {
        this.$compile = $compile;
        this.$rootScope = $rootScope;
        this.$log = $log;
        this.$animateCss = $animateCss;

        this.panelElement = angular.element(document.createElement('slide-panel'));
        this.showPanel = false;
    }

    _getChild({selector, bingings}) {
        let child;

        if(selector){
            child = angular.element(document.createElement(selector));
            if(bingings){
                Object.keys(bingings).forEach((key, value) =>
                    child.attr(key, value));
            }
        } else {
            this.$log.warn('component selector required for slide panel');
        }

        return child;
    }

    _getPanel(options){
        if(this.showPanel){
            this.$compiledScope = this.$rootScope.$new();

            if(options.panelOptions.name){
                this.panelElement.attr('name', options.panelOptions.name);
            }
            angular.element('body').append(this.$compile(this.panelElement)(this.$compiledScope));
            this.panelElement = angular.element('slide-panel');
            this.child = _.isUndefined(options) ? void 0 : this._getChild(options);

            this.controls = [];

            if(options.panelOptions.components.length){
                angular.forEach(options.panelOptions.components, component => {
                    let control = angular.element(document.createElement(component));
                    control.addClass('control-item');
                    this.controls.push(control);
                });
            }
        }

        return this.panelElement;
    }

    togglePanel(options){
        this.showPanel = !this.showPanel;
        let panel = this._getPanel(options);

        this.showPanel ? this.open(panel) : this.close(panel);
    }

    includeContent() {
        if (this.child) {
            this.panelElement.find('[ng-init]').append(this.$compile(this.child)(this.$compiledScope));
        }
        if (this.controls.length) {
            angular.forEach(this.controls, control => 
                this.panelElement.find('.header-controls').append(this.$compile(control)(this.$compiledScope)));
        }
    }

    open(element) {
        return this.$animateCss(element, {
            from: {right: '-440px'},
            to: {right: '0px'},
            duration: 0.5
        })
        .start();
    }

    async close(element) {
        await this.$animateCss(element, {
            from: {right: '0px'},
            to: {right: '-440px'},
            duration: 0.5
        }).start();
        this.$compiledScope.$destroy();
        element.remove();
    }
}

angular
    .module('slidePanel')
    .service('SlidePanelService', SlidePanelService);

SlidePanelService.$inject = ['$compile', '$rootScope', '$animateCss', '$log'];
