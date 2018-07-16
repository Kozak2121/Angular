require('./csv-uploader.scss');

class Controller{
    constructor(notifier, csvUploaderHelper) {
        'ngInject'

        this.notifier = notifier;
        this.types = csvUploaderHelper.csvUploaderTypes;
        this.tooltip = csvUploaderHelper.csvUploaderTooltip
    }
    onUpload({file}){
        let splitedString = file.name.split('.')
        if(splitedString[splitedString.length - 1] != 'csv'){
            this.notifier.error('You must put the file with .csv filename extension')
        } else {
            this.uploadSuccess = true;
            this.csvFile = file;
            this.done({file: this.csvFile});
        }
    }

    removeFile(){
        this.uploadSuccess = false;
        delete this.csvFile;
    }
}

module.exports = function (module) {
    module
        .component('csvUploader', {
            templateUrl: require('./csv-uploader.html'),
            controller: Controller,
            controllerAs: '$ctrl',
            bindings: {
                done: '&',
                selectedType: '='
            }
        });
};