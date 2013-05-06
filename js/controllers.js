'use strict';

function Main($scope, dropcsskitService) {
    $scope.mainNavigation = [
        {title: 'Import CSS files', icon: 'icon-folder-open'},
        {title: 'Add Selectors', icon: 'icon-plus'},
        {title: 'Generate UI kit (click to refresh from local files)', icon: "icon-wand"},
        {title: 'Import (Function is not working yet)', icon: "icon-upload", disabled: true},
        {title: 'Export (Function is not working yet)', icon: "icon-download", disabled: true}
    ];
    $scope.mainNavigation.active = -1;

    $scope.setIndex = function(index) {
        $scope.mainNavigation.active = index;
        if(index === 2) {
            dropcsskitService.generate();
        }
    }

    $scope.toggleNavigation = function() {
        $scope.mainNavigation.on = !$scope.mainNavigation.on;
        if(!$scope.mainNavigation.on) {
            $scope.mainNavigation.active = -1;
        }       
    }
}
Main.$inject = ['$scope', 'dropcsskitService'];

function Selectors($scope, dropcsskitService) {

    var changeTo = function(type) {
        var types = {
            add: {
                legend: 'Add selector',
                message: 'Add'
            },
            edit: {
                legend: 'Edit selector',
                message: 'Edit'
            }
        };

        angular.extend($scope.submit, types[type]);
        $scope.submit.type = type;
    };

    $scope.selectors = [];  
    $scope.submit = {       
        editIndex: null,        
    };

    changeTo('add');

    $scope.process = function() {
        var values = {name: $scope.fieldSelector, amount: $scope.fieldAmount, content: $scope.fieldContent};

        if($scope.submit.type === 'add') {
            $scope.selectors.push(values);
        } else {
            angular.extend($scope.selectors[$scope.submit.editIndex], values);
        }

        $scope.fieldSelector = '';
        $scope.fieldAmount = '';
        $scope.fieldContent = '';
        $scope.formSubmited = !$scope.formSubmited;

        changeTo('add');

        dropcsskitService.generated.cssCustom = $scope.selectors;
    };

    $scope.edit = function(index) {
        $scope.fieldSelector = $scope.selectors[index].name;
        $scope.fieldAmount = $scope.selectors[index].amount;
        $scope.fieldContent = $scope.selectors[index].content;
        $scope.formSubmited = !$scope.formSubmited;

        changeTo('edit');
        $scope.submit.editIndex = index;
    };      

    $scope.delete = function(index) {
        $scope.selectors.splice(index, 1);

        changeTo('add');
    };  
}
Selectors.$inject = ['$scope', 'dropcsskitService'];