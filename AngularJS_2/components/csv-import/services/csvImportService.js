class Service{
    constructor(Import, attributesHelper, Attributes){
        'ngInject'

        this.Import = Import;
        this.Attributes = Attributes;
        this.attributesHelper = attributesHelper;

        this.CSVImport = {};
    }

    uploadCsv(file){
        return this.Import.upload(file)
            .$promise
            .then((CSVImport) => Object.assign(this.CSVImport, CSVImport));
    }

    assignColumns(){
        return this.Import.assignColumns(this.CSVImport)
            .$promise;
    }

    applyTags(){
        return this.Import.setTags(this.CSVImport)
            .$promise;
    }

    launchCsvImport(){
        return this.Import.launch(this.CSVImport)
            .$promise;
    }

    getAttributes(){
        return this.attributesHelper.getAttributesByCategories()
            .then(({customAttributes}) => customAttributes.attributes);
    }

    createAttribute(attribute){
        attribute = new this.Attributes(attribute)
        return attribute.$save()
            .then((attribute) => {
                this.Attributes.clearCache();
                return attribute;
            })
    }
}

module.exports = (module) => 
    module
        .service('csvService', Service);
