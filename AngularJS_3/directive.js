'use strict';

class OpenRequest {
    constructor(EditRequestServices, RequestServices){
        this.restrict = 'A';
        this.RequestServices = RequestServices;
        this.EditRequestServices = EditRequestServices;
    }
    link($scope, $element, $attrs) {
        $element.on('click',(event) => 
            this.openRequest($scope.$eval($attrs.openRequest)));
    }

    async openRequest(node_id){
        let data = await this.RequestServices.getSuperRequest(node_id);
        this.EditRequestServices.openModal(data.request, data.requests_day, data);
    }
}

angular
    .module('requests')
    .directive('openRequest', (EditRequestServices, RequestServices) => new OpenRequest(EditRequestServices, RequestServices));
