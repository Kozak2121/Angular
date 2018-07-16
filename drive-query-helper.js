var m = angular.module('advanced-data-search');

m.factory('driveQueryHelper', function($timeout, $q, globalSearchDao, modals) {
    return function(args) {

        var filtersMap = {};

        var lastLoadedFilter = null;

        function addFilters(filters) {
            _(filters).each(function (filter) {
                filtersMap[filter.id] = filter;
                if (lastLoadedFilter && lastLoadedFilter.id == filter.id) {
                    lastLoadedFilter = filter;
                }
            });
            buildLoadOptions();
        }

        var saveAsOption = {
            label: 'Save filters as...',
            'class': 'saved-filter-static-option',
            onclick: function () {
                var pages = [{
                    lastPage: true,
                    okButton: 'Save',
                    params: [{
                        type: 'message',
                        message: '#' + JSON.stringify({
                            display: 'text',
                            text: 'Please enter a name for filters set'
                        }),
                        paramClass: 'full-width-param'
                    }, {
                        id: 'name',
                        type: 'string',
                        label: 'Name',
                        validation: {
                            required: {
                                value: true,
                                message: 'Filter name is required'
                            },
                            minLength: {
                                value: 1,
                                message: 'Filter name is required'
                            }
                        }
                    }]
                }];
                modals.params(pages, 'Save filters')
                    .then(function (params) {
                        var filter = args.getFilter();
                        globalSearchDao.createFilter(params.name, filter).then(function (response) {
                            addFilters(response.data);
                        });
                    });
            }
        };

        function updateOption () {
            if (!lastLoadedFilter) {
                return;
            }
            return {
                label: 'Update ' + lastLoadedFilter.queryName,
                'class': 'saved-filter-static-option',
                onclick: function () {
                    var pages = [{
                        lastPage: true,
                        okButton: 'Update',
                        params: [{
                            type: 'message',
                            message: '#' + JSON.stringify({
                                display: 'text',
                                text: 'Update ' + lastLoadedFilter.queryName
                            }),
                            paramClass: 'full-width-param'
                        }, {
                            id: 'name',
                            type: 'string',
                            label: 'Name',
                            data: lastLoadedFilter.queryName,
                            validation: {
                                required: {
                                    value: true,
                                    message: 'Filter name is required'
                                },
                                minLength: {
                                    value: 1,
                                    message: 'Filter name is required'
                                }
                            }
                        }]
                    }];
                    modals.params(pages, 'Save filters')
                        .then(function (params) {
                            var filter = args.getFilter();
                            globalSearchDao.saveFilter(lastLoadedFilter.id, params.name, filter).then(function (response) {
                                addFilters(response.data);
                            });
                        });
                }
            };
        }

        function removeSavedFilter(filter) {
            modals.confirm({
                message: 'Are you sure you want to remove saved filter "' + filter.queryName + '"?',
                title: 'Confirm',
                okText: 'Remove'
            }).then(function () {
                globalSearchDao.removeSavedFilter(filter.id).then(function () {
                    delete filtersMap[filter.id];
                    if (lastLoadedFilter && lastLoadedFilter.id === filter.id) {
                        lastLoadedFilter = null;
                    }
                    buildLoadOptions();
                });
            });
        }


        function buildLoadOptions () {
            var loadOptions = _(filtersMap).chain().values().sortBy('queryName').map(function (filter) {
                return {
                    label: filter.queryName,
                    class: 'saved-filter-load-option',
                    onclick: function () {
                        args.loadFilter(filter.queryData);
                        $timeout(function () {
                            lastLoadedFilter = filter;
                            buildLoadOptions();
                        }, 200);
                    },
                    secondary: {
                        class: 'saved-filter-remove fa fa-times',
                        onclick: function () {
                            removeSavedFilter(filter);
                        }
                    }
                };
            }).value();
            var options = [saveAsOption];
            var update = updateOption();
            if (update) {
                options = options.concat([update]);
            }
            saveButton.options = options.concat(loadOptions);
        }

        var saveButton = {
            'class': 'btn-icon save-filter-button',
            iconClass: 'fa fa-bookmark',
            tooltip: 'Save/Load filters...'
        };
        buildLoadOptions();


        globalSearchDao.getSavedFilters().then(function (response) {
            addFilters(response.data);
        });



        return {
            button: saveButton
        };
    };
});