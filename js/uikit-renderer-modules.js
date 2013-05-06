'use strict';

var uikitRendererModule = angular.module('uikit-renderer', ['LocalStorageModule']);

uikitRendererModule.directive("uikitcontent", function($compile, localStorageService) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.html(localStorageService.get('uikit-content'));
            $compile(element.contents())(scope);
        }
    };
});