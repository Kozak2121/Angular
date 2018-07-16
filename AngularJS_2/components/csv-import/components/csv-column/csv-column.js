require('./csv-column.scss');
const popoverAttributeTemlate = require('./popoverAttributeTemlate.html')

class Controller{
    constructor($element, ColumnAnimation, columnHelper, csvService, notifier, $filter) {
        'ngInject'
    
        this.$element = $element;
        this.ColumnAnimation = ColumnAnimation;
        this.csvService = csvService;
        this.notifier = notifier;
        this.$filter = $filter;
        this.popoverAttributeTemlate = popoverAttributeTemlate;
        this.isCollapsed = true;
        this.dataTypes = columnHelper.dataTypes
    }

    $onInit() {
         this.$animatedElement = this.$element.find('.animated-column');
         this.$parentElement = this.importColumn.$element.find('.columns');
         this.animationHelper = this.ColumnAnimation.getHelper(this.$animatedElement, this.$parentElement);
         angular.extend(this, this.column);
    }

    submit($event, success) {
        this.submitted = true;
        this.column.isMapped = success;
        
        if(success) {
            if(!this.selectedAttribute){
                $event.stopPropagation();
                this.notifier.info('Please select arttibute or create new');
                this.column.isMapped = false;
                this.submitted = false;
            } else {
                let data = {
                    column_name: this.selectedAttribute.name,
                    column_index: this.index,
                    data_type: this.selectedAttribute.type === 'integer' ? 'Number' : this.$filter('capitalize')(this.selectedAttribute.type)
                }
                this.done({data});

                if(this.isNewAttribute){
                    this.resetAttribute();
                }
            }
        }
    }

    toggleCollapse($event) {
        if(this.isCollapsed && !this.column.isMapped) {
            angular.extend(this, this.column)
            this.submitted = false;
            if(!this.required){
                this.csvService.getAttributes()
                    .then((attributes) => 
                        this.attributes = attributes);
            }
            this.animationHelper.open()
                .then(() => this.isCollapsed = false)
               
        } else if(this.submitted && !this.isCollapsed){
            this.isCollapsed = true;
            this.animationHelper.close()
        } else {
            $event.stopPropagation();
        }
    }

    selectAttribute(attribute){
        this.selectedAttribute = attribute;
    }

    startNewAttribute($event){
        $event.stopPropagation();
        this.isNewAttribute = true;
    }

    createNewAttribute(){
        this.isNewAttrPopoverOpen = false;
        this.selectedAttribute = this.newAttribute;
    }

    proccessNewAttribute(){
        let invalid = _.isUndefined(this.selectedAttribute.name) || _.isUndefined(this.selectedAttribute.type);

        if(invalid){
            this.notifier.error('Type and name are required for new arrtibute');
        } else {
            this.csvService.createAttribute(this.selectedAttribute)
                .then((newAttribute) => this.selectedAttribute = newAttribute)
                .then(() => this.isNewAttribute = false)
                .then(this.csvService.getAttributes.bind(this.csvService))
                .then((attributes) => this.attributes = attributes);
        }
    }

    resetAttribute(){
        this.isNewAttribute = false;
        delete this.newAttribute;
        delete this.selectedAttribute;
    }
}

module.exports = (module) => 
    module
        .component('csvColumn', {
            templateUrl: require('./csv-column.html'),
            require: {
                importColumn: '^importColumns'
            },
            controller: Controller,
            controllerAs: '$ctrl',
            bindings: {
                column: '=',
                done: '&'
            }
        });
