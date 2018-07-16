const mod = angular.module('riika.modules.import.scvImport', []);

require('./components/csv-column/csv-column')(mod);
require('./components/import-columns/import-columns')(mod);
require('./components/csv-uploader/csv-uploader')(mod);
require('./animations/animationHelper')(mod);
require('./services/csvImportService')(mod);

module.exports = mod;
