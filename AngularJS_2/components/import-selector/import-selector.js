require('./import-selector.scss');

class Controller{
    constructor($state){
        'ngInject'

        this.importTypes = [
            {
                icon: 'fa fa-cloud-upload',
                name: 'CSV',
                description: 'Import a CSV file of your users or leads into MNH.',
                action: () => {
                     $state.go('import.csv-import');
                }
            },
            {
                icon: 'fa fa-cloud-upload',
                name: 'MailChimp',
                description: 'Import users from your MailChimp mailing lists.',
                action: () => {
                     $state.go();
                }
            }
        ];
    }
}

module.exports = (module) =>
    module
        .component('importSelector', {
            templateUrl: require('./import-selector.html'),
            controller: Controller,
            controllerAs: '$ctrl'
        });
