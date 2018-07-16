var m = angular.module('devices');

m.controller('DevicesListController', function($scope, devicesDao, tablePaginationHelper, $q, path, columnsHelper) {
    var devicesListWidgetUUID = '7565fd3d-4483-4755-9406-3f5f37ea9cab';
    $scope.devicesListPanel = {
        uuid: devicesListWidgetUUID,
        wrapper: {
            title: 'Devices',
            'class': 'light white-body white-header'
        }
    };
    
    function filterSelectedRows(authorized) {
        var selected = $scope.tableHelper.getSelected();
        return _(selected).filter(function(row) {
            var authorizedIdx = columnsHelper.getIdxById($scope.options.columns, 'authorized');
            return row[authorizedIdx].originalText == authorized;
        });
    }
    
    function isActionActive(operation) {
        return function() {
            var targetAuthorized = (operation == 'unblock');
            var selected = filterSelectedRows(!targetAuthorized);
            return selected.length > 0;
        };
    }
    
    function doOperation(operation) {
        var targetAuthorized = (operation == 'unblock');
        return $q.all(_(filterSelectedRows(!targetAuthorized)).map(function(row) {
            var idx = columnsHelper.getIdxById($scope.options.columns, 'id');
            return devicesDao.operation(row[idx].originalText, operation);
        })).then(function() {
            $scope.tableHelper.clearSelection();
            $scope.tableHelper.reload();
        });
    }
    
    $scope.tableOptions = {
        pagesAround: 2,
        pageSize: Number.MAX_VALUE,
        pagination: false,
        saveState: true,
        disableTop: true,
        actions: [{
            label: 'Block device',
            active: isActionActive('block'),
            execute: function() {
                doOperation('block');
            }
        }, {
            label: 'Unblock device',
            active: isActionActive('unblock'),
            execute: function() {
                doOperation('unblock');
            }
        }]
    };
    
    $q.all([
        path('devices').ctrl('devices-list').json('list-conf').retrieve()
    ]).then(function(responses) {
        $scope.options = responses[0].data;
        
        $scope.tableHelper = tablePaginationHelper($scope, $scope.tableOptions, $scope.options, function(args) {
            return devicesDao.list($scope.options.columns);
        }, function(tableModel) {
            $scope.tableModel = tableModel;
        });
    });
});