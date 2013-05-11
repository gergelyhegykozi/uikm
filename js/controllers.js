'use strict';

/**********************
Navigation and page behavior
**********************/
function Main($scope, dropcsskitService) {
    $scope.cssfiles = [];

    $scope.mainNavigation = [
        {title: 'Import CSS files', icon: 'icon-folder-open'},
        {title: 'Add Selectors', icon: 'icon-plus'},
        {title: 'Generate UI kit (click to refresh from local files)', icon: "icon-wand"},
        {title: 'Import', icon: "icon-upload"},
        {title: 'Export', icon: "icon-download"}
    ];
    $scope.mainNavigation.active = -1;

    $scope.setIndex = function(index) {
        $scope.mainNavigation.active = index;
        if(index === 2) {
            //Call generator behavior
            $scope.$broadcast('generate');
        }
        if(index === 4) {
            //Go to Export controller
            $scope.$broadcast('export');
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

/**********************
Config behavior
**********************/
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

    //Imported uikit config
    $scope.$on('syncconfig', function() {
        changeTo('add');
        $scope.selectors = dropcsskitService.generated.cssCustom;
    });
}
Selectors.$inject = ['$scope', 'dropcsskitService'];

/**********************
Export behavior
**********************/
function Export($scope, dropcsskitService) {
    
    $scope.$on('export', function() {                  

        var content = {
                cssBase: dropcsskitService.generated.cssBase,
                cssMain: dropcsskitService.generated.cssMain,
                cssCustom: dropcsskitService.generated.cssCustom
            },
            blob = new Blob([angular.toJson(content)], {type : 'text/json'});

        $scope.downloadUrl = window.URL.createObjectURL(blob);

    });   

}
Export.$inject = ['$scope', 'dropcsskitService'];