function pageTemplate(folder, file = 'index') {
    return require(`./pages/${folder}/${file}.html`);
}

const templates = {
    csv: pageTemplate('csv-import')
};

module.exports = (module) => 
    module.config(($stateProvider) => {
        'ngInject';
        const baseState = 'import';

        $stateProvider
            .state(baseState, {
                data: {
                    permissions: {
                        only: 'isAuthorized',
                        redirectTo: 'login'
                    }
                },
                template: '<div class="app-body-inner csv-import" ui-view></div>',
                url: '/import',
                redirectTo: `${baseState}.csv-import`
            })
            .state(`${baseState}.csv-import`, {
                controller: 'CsvImportController as $ctrl',
                templateUrl: templates.csv
            });
    });
