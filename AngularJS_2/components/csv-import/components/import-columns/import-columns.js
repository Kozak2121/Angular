require('./import-columns.scss');

class Controller{
    constructor($element, importColumnHelper){
        'ngInject'

        this.$element = $element;
        this.currentStep = 0;
        this.helper = importColumnHelper;
    }

    $onInit() {
        if(this.type === 'users'){
            this.columnSteps = this.helper.usersSteps;
            this.totalSteps = 6;
        } else {
            this.totalSteps = 3;
            this.columnSteps = this.helper.visitorsSteps;
        }
        this.required = true;
        this.extendedColumns = _.map(this.columns, (col, index) => {
            return {
                index: index,
                values: col,
                currentTypeName: this.columnSteps[this.currentStep].type,
                isMapped: false,
                required: true,
                selectedAttribute: {
                    title: this.columnSteps[this.currentStep].title,
                    name: this.columnSteps[this.currentStep].name,
                    type: this.columnSteps[this.currentStep].data_type
                }
            }
        }) 
    }
    nextStep(column){
        if(column.isMapped){
            if(this.currentStep + 1 < this.totalSteps){

                this.currentStep++;

                let selectedAttribute;
                let required;

                if(this.currentStep + 1 == this.totalSteps){
                    required = false;
                } else {
                    selectedAttribute = {
                        title: this.columnSteps[this.currentStep].title,
                        name: this.columnSteps[this.currentStep].name,
                        type: this.columnSteps[this.currentStep].data_type
                    }
                    required = true;
                }
                _.forEach(this.extendedColumns, col => 
                    angular.extend(col, {selectedAttribute}, {required}));
            }
        }
    }
}

module.exports = (module) => 
    module
        .component('importColumns', {
            templateUrl: require('./import-columns.html'),
            controller: Controller,
            controllerAs: '$ctrl',
            transclude: {
                column: 'csvColumn'
            },
            bindings: {
                columns: '<',
                type: '<'
            }
        });
