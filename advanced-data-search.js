var m = angular.module('advanced-data-search');

m.controller('AdvancedDataSearchController', function($scope, $q, $timeout, tablePaginationHelper, globalSearchDao, path, modulesManager, base64, $location, defaultListConverter, modals, workingIndicatorHelper, materializedViewsReindexHelper, configDao, driveQueryHelper, mimeIcons, sideMenuManager, $route, $routeParams) {
    workingIndicatorHelper.init($scope);
    $scope.displayMode = $location.search().displayMode || 2;
    $scope.filterModel = {
        filter: ''
    };

    $scope.model = {
        excluded: {}
    };

    var savedFilters = $location.search().filters;
    if(_(savedFilters).isString()) {
        try {
            $scope.model = $.extend($scope.model, JSON.parse(base64.decode(savedFilters)));
        } catch (e) {

        }
    }

    $scope.queryParams = {
        params: {}
    };

    $scope.buildParams = function (ignoreFacet)  {
        function filter(data, value) {
            return _(data).chain().map(function (v, k) {
                return [k, v];
            }).filter(function (v) {
                return v[1] === value;
            }).map(function (v) {
                return v[0];
            }).value().join(',');
        }

        function buildExcluded(type) {
            var result = _($scope.model.excluded).chain().filter(function (data) {
                return data.entityType == type;
            }).map(function (data) {
                return data.entityId;
            }).value().join(',');
            if (!result.length) {
                result = undefined;
            }
            return result;
        }

        var result = {
            params: {}
        };

        _($scope.model).each(function (value, key) {
            if (key === 'excluded' || key === ignoreFacet) {
                return;
            }
            var include = filter(value.values, true);
            var exclude = filter(value.values, false);

            if (include.length) {
                result.params['include_' + key] = include;
                result.params['operator_' + key] = value.operator;
            }
            if (exclude.length) {
                result.params['exclude_' + key] = exclude;
            }
        });

        result.params.exclude_folders_ids = buildExcluded('folder');
        result.params.exclude_files_ids = buildExcluded('file');

        if ($scope.resultsPanel.filter.value !== '') {
            result.filter = $scope.resultsPanel.filter.value;
        }
        return result;
    };

    $scope.tableOptions = {
        pagesAround: 2,
        pageSize: 20,
        pagination: {
            page: 1,
            ordering: {}
        },
        saveState: true,
        disableTop: true,
        showWorkingIndicator: true,
        isColumnVisible: function(column, isExport) {
            return $scope.displayMode != 3 || column.alwaysVisible || isExport;
        }
    };

    $scope.excludedTableOptions = {
        pagesAround: 2,
        pageSize: 100000,
        pagination: {
            page: 1,
            ordering: {}
        },
        saveState: false,
        disableTop: true
    };

    function emptyModelElement(id, block) {
        if (!block) {
            block = _($scope.options.facetBlocks).find(function (facet) {
                return facet.id === id;
            });
        }
        return {values: {}, operator: block && block.defaultOperator || 'AND'};
    }

    function clearAllFilters() {
        $scope.resultsPanel.filter.value = '';
        _($scope.model).each(function (value, key) {
            if (key != 'excluded') {
                $scope.model[key] = emptyModelElement(key);
            }
        });
    }

    $scope.resultsPanel = {
        title: 'Loading...',
        'class': 'avanan white-body bigger-custom-buttons',
        filter: {
            placeholder: 'File/Owner name',
            value: ''
        },
        buttons: [{
            'class': 'btn-icon',
            iconClass: 'fa fa-trash',
            tooltip: 'Clear all filters',
            execute: function() {
                clearAllFilters();
            }
        }, {
            'class': 'btn-icon',
            iconClass: 'fa fa-download',
            tooltip: 'Export data...',
            options: [{
                label: 'Export as csv to e-mail',
                onclick:  function () {
                    exportToEmail('csv');
                }
            }, {
                label: 'Export as xls to e-mail',
                onclick:  function () {
                    exportToEmail('xls');
                }
            }]
        }, {
            'class': 'btn-icon',
            iconClass: 'fa fa-columns',
            tooltip: 'Toggle View Layout',
            execute: function() {
                $scope.displayMode--;
                if($scope.displayMode === 0) {
                    $scope.displayMode = 3;
                }
                $location.search('displayMode', $scope.displayMode);
            }
        }]
    };

    var saveFiltersHelper = driveQueryHelper({
        getFilter: function () {
            return {
                search: $scope.resultsPanel.filter.value,
                filters: $.extend(true, {}, $scope.model)
            };
        },
        loadFilter: function (filter) {
            $scope.resultsPanel.filter.value = filter.search;
            $scope.model = $.extend(true, {}, filter.filters);
        }
    });

    $scope.resultsPanel.buttons.splice(1, 0, saveFiltersHelper.button);

    $scope.excludedPanel = {
        title: 'Exluded items',
        'class': 'avanan white-body',
        bodyStyle: {
            height: '200px'
        },
        buttons: [{
            'class': 'btn-icon',
            iconClass: 'fa fa-trash',
            execute: function() {
                $scope.model.excluded = {};
            }
        }, {
            'class': {
                'btn-icon': true
            },
            iconClass: 'fa fa-check-square-o',
            tooltip: 'Filters selected',
            showWhenMinimized: true,
            hidden: true
        }],
        icons : {
        minimize: 'fa-chevron-up',
            expand: 'fa-chevron-down'
        },
        minimize: true,
        minimized: _($scope.model.excluded).isEmpty()
    };

    $scope.excludedIsEmpty = function () {
        return _($scope.model.excluded).isEmpty();
    };

    function updateExcludedIndicator () {
        $scope.excludedPanel.buttons[1].hidden = _($scope.model.excluded).isEmpty() || !$scope.excludedPanel.minimized;
    }

    function exportToEmail(format) {
        var p;
        if (format === 'xls') {
            p = configDao.param('drive_analytics_report_max_lines');
        } else {
            p = $q.when();
        }


        return p.then(function (maxXlsLines) {
            maxXlsLines = (maxXlsLines || 0) - 1;

            if (format === 'xls' && $scope.tableHelper.getTotal() > maxXlsLines) {
                return modals.alert('Amount of data in report exceeds maximum amount of rows allowed for ' + format + ' file. Please use csv format instead.', {
                    title: 'Report is too big'
                });
            }

            return modals.confirm({
                message: 'Your export is about to start. An email will be sent to you once completed.',
                title: 'Export report',
                okText: 'Start Export'
            }).then(function () {
                return globalSearchDao.advancedDataSearchEmailExport($scope.queryParams.params, format)
                    .filter($scope.queryParams.filter);
            });
        });

    }

    var savedSearch = $location.search().search;
    if(_(savedSearch).isString()) {
        $scope.resultsPanel.filter.value = base64.decode(savedSearch);
    }

    $scope.getSearchColumnClass = function() {
        return 'search-column-' + $scope.displayMode;
    };

    $scope.getLeftColumnClass = function() {
        return 'left-column-' + $scope.displayMode;
    };


    $scope.$on('add-to-exclude', function(event, data) {
        var attrs = data.attributes;
        $scope.model.excluded[attrs.entityType + ':' + attrs.entityId] = attrs;
    });

    $scope.$on('remove-from-exclude', function(event, data) {
        var attrs = data.attributes;
        delete $scope.model.excluded[attrs.entityType + ':' + attrs.entityId];
    });

    $scope.$watch('excludedPanel.minimized', function () {
        updateExcludedIndicator();
    });

    $q.all([
        path('advanced-data-search').ctrl('advanced-data-search').json(modulesManager.currentModule()).retrieve(),
        path('advanced-data-search').ctrl('advanced-data-search').json('excluded_table').retrieve(),
        mimeIcons()
    ]).then(function(responses) {
        $scope.excludedOptions = responses[1].data;
        $scope.excludedOptions.mimeIcons = responses[2];
        $scope.excludedTableHelper = tablePaginationHelper($scope, $scope.excludedTableOptions, $scope.excludedOptions, function(args) {
            return defaultListConverter({
                data: {
                    rows: _($scope.model.excluded).chain().sortBy('title').sortBy(function (row) {
                        return row.entityType === 'folder' ? 0 : 1;
                    }).value()
                }
            }, $scope.excludedOptions);
        }, function(tableModel) {
            $scope.excludedTableModel = tableModel;
        });

        $scope.options = responses[0].data;

        $scope.fromBlocks = _($scope.options.facetBlocks).filter(function (block) {
            return block.side === 'from';
        });

        $scope.toBlocks = _($scope.options.facetBlocks).filter(function (block) {
            return block.side === 'to';
        });

        _($scope.options.facetBlocks).each(function (block) {
            $scope.model[block.id] = $scope.model[block.id] || emptyModelElement(block.id, block);
        });
        $scope.queryParams = $scope.buildParams();

        if ($scope.options.options.viewName) {
            $scope.viewRefreshHelper = materializedViewsReindexHelper($scope, $scope.options.options.viewName);
            $scope.resultsPanel.buttons.splice(3, 0, $scope.viewRefreshHelper.iconButton());
            delete $scope.options.options.autoUpdate;
            $scope.$watch('viewRefreshHelper.lastRefreshed', function (newVal, oldVal) {
                if (!oldVal || !newVal || newVal == oldVal) {
                    return;
                }
                $scope.tableHelper.reload(true, true);
            });
        }


        $scope.tableHelper = tablePaginationHelper($scope, $scope.tableOptions, $scope.options, function(args) {
            var filterBy = $scope.queryParams.filter;
            $location.search('search', base64.encode(filterBy || ''));
            $location.search('filters', base64.encode(JSON.stringify($scope.model)));
            return globalSearchDao.advancedDataSearch($scope.options.columns, $scope.queryParams.params)
                .pagination(args.offset, args.limit)
                .filter(filterBy)
                .order(args.ordering.columnName, args.ordering.order)
                .after(function() {
                    $scope.excludedTableHelper.reload();
                });
        }, function(tableModel) {
            $scope.tableModel = tableModel;
            $scope.resultsPanel.title = $scope.tableHelper.getTotal() + ' results';
        });

        var reloadTimeout = null;
        function watchHandler(newVal, oldVal) {
            updateExcludedIndicator();
            if(newVal == oldVal) {
                return;
            }
            if(!_(reloadTimeout).isNull()) {
                $timeout.cancel(reloadTimeout);
            }
            reloadTimeout = $timeout(function() {
                var newParams = $scope.buildParams();
                if (!_(newParams).isEqual($scope.queryParams)) {
                    $scope.queryParams = newParams;
                }
            }, 500);
        }

        $scope.$watch('resultsPanel.filter.value', watchHandler);
        $scope.$watch('model', watchHandler, true);
        $scope.$watch('queryParams', function (newVal, oldVal) {
            if (newVal === oldVal) {
                return;
            }
            $scope.tableOptions.pagination.page = 1;
            $scope.tableHelper.reload();
        });
    });
    
    sideMenuManager.treeNavigationPath(['analytics', $route.current.name + '/' + $routeParams.module]);
});