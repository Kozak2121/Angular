var m = angular.module('common');

m.controller('InlineUserSelectorModalController', function($scope, $modalInstance, options, users, commonDao, tablePaginationHelper, $rootScope, defaultListConverter, $q, modals) {
    $scope.options = options;
    $scope.users = users && angular.copy(users) || [];
    $scope.usersInfo = {};
    $scope.loadedUsers = {};

    $scope.maxUsers = options.maxUsers;

    var locationChangeUnsubscribe = $rootScope.$on('$locationChangeSuccess', function () {
        $modalInstance.dismiss();
    });
    $scope.$on('$destroy', function () {
        locationChangeUnsubscribe();
    });


    $scope.ok = function() {
        $modalInstance.close($scope.users);
    };

    $scope.close = function() {
        $modalInstance.dismiss();
    };


    $scope.leftPanel = {
        title: 'Unprotected users',
        titlePrefix: 'Unprotected users',
        'class': 'avanan white-body single-widget'
    };

    $scope.rightPanel = {
        title: 'Protected users',
        titlePrefix: 'Protected users',
        'class': 'avanan white-body single-widget'
    };

    $scope.leftOptions = {
        columns: [{
            "id": "id",
            "primary": true,
            "hidden": true
        }, {
            "id": "label",
            "text": "User"
        }],
        options: {
            checkboxes: true,
            lineSelection: true
        }
    };

    $scope.leftTableOptions = {
        pagesAround: 2,
        pageSize: 10,
        pagination: {
            page: 1,
            ordering: {},
            filter: ''
        },
        disableTop: true,
        disablePerPageSelector: true
    };

    $scope.rightOptions = {
        columns: [{
            "id": "id",
            "primary": true,
            "hidden": true
        }, {
            "id": "label",
            "text": "User"
        }],
        options: {
            checkboxes: true,
            lineSelection: true
        }
    };

    $scope.rightTableOptions = {
        pagesAround: 2,
        pageSize: 10,
        pagination: {
            page: 1,
            ordering: {},
            filter: ''
        },
        disableTop: true,
        disablePerPageSelector: true
    };

    $scope.leftTableHelper = tablePaginationHelper($scope, $scope.leftTableOptions, $scope.leftOptions, function (args) {
        if ($scope.leftTableHelper) {
            $scope.leftTableHelper.clearSelection();
        }
        var selectParams = {
            exclude_ids: $scope.users.join(',')
        };
        if (options.excludeEmails) {
            selectParams.exclude_emails = options.excludeEmails().join(',');
        }
        if (options.showOnlyUserIds) {
            selectParams.only_ids = _(options.showOnlyUserIds).difference($scope.users).join(',');
            selectParams.exclude_ids = '';
        }
        var query = commonDao.genericLookup(options.lookupEndpoint).pagination(args.offset, args.limit)
            .params(selectParams)
            .params({
                q: args.filter
            }).order(args.ordering.columnName, args.ordering.order);
        if (args.filter) {
            query.preFetch(commonDao.genericLookup(options.lookupEndpoint).params(selectParams).count(true), 'totalCount')
                .converter(function (input, args) {
                    try {
                        var amount = args.totalCount.data.rows[0].count;
                        $scope.leftPanel.title = $scope.leftPanel.titlePrefix + ' (' + amount + ' ' + pluralise('user', amount) + ')';
                    } catch (e) {}
                    return $q.when(input);
                }, _.identity);
        } else {
            query.converter(function (input) {
                var amount = input.data.total_rows || 0;
                $scope.leftPanel.title = $scope.leftPanel.titlePrefix + ' (' + amount + ' ' + pluralise('user', amount) + ')';
                return $q.when(input);
            });
        }


        return query.after(function (input) {
            $scope.loadedUsers = {};
            _(input.data.rows).each(function (row) {
                $scope.loadedUsers[row.id] = row;
            });
        }).converter(defaultListConverter, {
            columns: $scope.leftOptions.columns
        });
    }, function (tableModel) {
        $scope.leftTableModel = tableModel;
    });

    $scope.rightTableHelper = tablePaginationHelper($scope, $scope.rightTableOptions, $scope.rightOptions, function (args) {
        $scope.rightPanel.title = $scope.rightPanel.titlePrefix + ' (' + $scope.users.length + ' ' + pluralise('user', $scope.users.length) + ')';
        var deferred = $q.defer();
        var needResolve = [];
        _($scope.users).each(function (userId) {
            if (!$scope.usersInfo[userId]) {
                needResolve.push(userId);
            }
        });
        if (needResolve.length) {
            commonDao.genericLookup(options.lookupEndpoint, {ids: needResolve.join(',')}).then(function (response) {
                _(response.data.rows).each(function (row) {
                    $scope.usersInfo[row.id] = row;
                });
                deferred.resolve();
            });
        } else {
            deferred.resolve();
        }
        return deferred.promise.then(function () {
            var rows = _($scope.users).chain().map(function (userId) {
                return $scope.usersInfo[userId];
            }).filter(function (row) {
                return !args.filter || row.label.toLowerCase().indexOf(args.filter.toLowerCase()) !== -1;
            }).value();
            return defaultListConverter({
                data: {
                    rows: _(rows).chain().drop(args.offset).first(args.limit).value(),
                    total_rows: rows.length,
                    page: args.offset / args.limit + 1
                }
            }, {
                columns: $scope.leftOptions.columns
            });
        });

    }, function (tableModel) {
        $scope.rightTableModel = tableModel;
    });

    function pluralise(word, amount) {
        if (amount === 1) {
            return word;
        }
        return word + 's';
    }

    $scope.canAdd = function () {
        return $scope.leftTableHelper.getSelectedIds().length > 0;
    };

    $scope.canRemove = function () {
        return $scope.rightTableHelper.getSelectedIds().length > 0;
    };

    function clearAndReload() {
        $scope.leftTableHelper.clearSelection();
        $scope.rightTableHelper.clearSelection();
        $scope.leftTableHelper.reload();
        $scope.rightTableHelper.reload();
    }

    $scope.addUsers = function () {
        var selected = $scope.leftTableHelper.getSelectedIds();
        if ($scope.maxUsers && $scope.users.length + selected.length > $scope.maxUsers) {
            return modals.alert(['Dear user,',
                'You\'re running a trial version of Avanan.',
                'Trial version allows protection of ' + $scope.maxUsers + ' users or less.'], {
                title: 'Trial version',
                windowClass: 'inline-user-limit-dialog'
            }, 'sm');
        }
        _(selected).each(function (userId) {
            $scope.users.push(userId);
            $scope.usersInfo[userId] = $scope.loadedUsers[userId];
        });
        $scope.users = _($scope.users).unique();
        clearAndReload();

    };

    $scope.removeUsers = function () {
        var selected = $scope.rightTableHelper.getSelectedIds();
        $scope.users = _($scope.users).filter(function (userId) {
            return !_(selected).contains(userId);
        });
        clearAndReload();
    };

});

m.factory('inlineUserSelectorModal', function($modal, path) {
    return {
        show: function(users, options) {
            var modalInstance = $modal.open({
                templateUrl: path('app-store').ctrl('inline-user-selector-modal').template(),
                controller: 'InlineUserSelectorModalController',
                size: 'lg',
                backdrop: _(options).isObject() && !_(options.backdrop).isUndefined() ? options.backdrop : true,
                keyboard: _(options).isObject() && !_(options.keyboard).isUndefined() ? options.keyboard : true,
                resolve: {
                    users: _.constant(users),
                    options: _.constant(options)
                }
            });
            return modalInstance.result;
        }
    };
});