/**
 * @attribute slidePanelInvoker as slidePanelOptions;
 * 
 * @panelOptions 
 *    @name: String - name of your slide panel
 *    @components: Array<Sting> - html slelectors of components wich nested to header slide panel
 * @selector: String - html slelector of component for nested into slide panel
 * @bingings: Array<Attributes> - binding attributes for nested components
 * 
 * 
 * @example 
 * in html:
 * 
 *      <div slide-panel-invoker="options"</div> 
 * in controller:
 * 
 *      $scope.options: {
 *          panelOptions: {
 *              name: Reminders,
 *              comonents: [notification-sound]
 *          },
 *          selector: 'reminder-calendar',
 *          bindings: [{
 *                  ng-disabled: false
 *              }]
 *      }
 */

'use strict';

class SlidePanelInvoker{
    constructor(SlidePanelService) {
        this.service = SlidePanelService;
        this.scope = {
            slidePanelOptions: '<slidePanelInvoker'
        };
    }
    link($scope, $element) {
        $element.on('click', () => 
            this.service.togglePanel($scope.slidePanelOptions));
    }
}

angular
    .module('slidePanel')
    .directive('slidePanelInvoker',(SlidePanelService) => new SlidePanelInvoker(SlidePanelService));
