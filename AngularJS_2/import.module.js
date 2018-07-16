const mod = angular.module('riika.modules.import', [
    require('./components/csv-import/csv-import.module').name
]);

require('./import.route')(mod);
require('./import.constants')(mod);
require('./components/import-selector/import-selector')(mod);
require('./pages/csv-import/index')(mod);

module.exports = mod;