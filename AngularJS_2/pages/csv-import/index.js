require('./style.scss');

module.exports = (module) => {

    class Controller {
        constructor(PanelHelper, notifier, csvImportSteps, csvService, $state) {
            'ngInject'

            this.notifier = notifier;
            this.csvService = csvService;
            this.csvImportSteps = csvImportSteps;
            this.$state = $state;
            this.CSVImport = this.csvService.CSVImport;

            this.panels = new PanelHelper([
                'tags'
            ]);

            this.step = 1;
        }

        prev() {
            if(--this.step === 1){
                delete this.csvFile;
            }
        }

        applyStep() {
            switch (this.step){
                case 1:
                    if(!this.type || !this.csvFile){
                        this.notifier.error('Type or .csv file does not selected')
                    } else {
                        this.csvService.uploadCsv(this.csvFile)
                            .then(() => this.step++)
                            .catch((err) => this.notifier.error(err.message));
                    }
                    break;
                case 2:
                    this.csvService.assignColumns()
                        .then(() => this.step++)
                        .catch((err) => this.notifier.error(err.message));
                    break;
                case 3: 
                    this.csvService.applyTags()
                        .then(() => this.notifier.success('CSV Import succesfuly launched'))
                        .then(() => this.csvService.launchCsvImport(this.csvService))
                        .then(() => this.$state.go('contacts'))
                        .catch((err) => this.notifier.error(err.message));
                    break;
            }
        }

        mapColumn({data}) {
            this.CSVImport.column_assignments.push(data);
        }

        resolveCsv({file}){
            this.csvFile = file;
        }

        resolveTags({tags}) {
            this.tags = tags;
            this.CSVImport.additional_tags = _.pluck(tags, 'id');
            this.panels.toggle('tags', false);
        }
    }

    module
        .controller('CsvImportController', Controller);
};
