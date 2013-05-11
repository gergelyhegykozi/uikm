'use strict';

/**********************
Focus behavior after upload
**********************/
uikitModule.directive('focus', function() {
    return function(scope, element, attrs) {
       scope.$watch(attrs.focus,
         function (newValue) {
            element[0].focus();
         },true);
      };    
});

/**********************
Dropzone style behavior
**********************/
uikitModule.directive("dropzone", function() {
    return {
        restrict : "A",
        link: function (scope, elem, attrs) {
            elem.bind('dragover', function(e) {
                e.stopPropagation();
                e.preventDefault();
                elem.addClass('dragover');
            });
            elem.bind('dragleave', function(e) {
                e.stopPropagation();
                e.preventDefault();
                elem.removeClass('dragover');       
            });
            elem.bind('drop', function(e) {
                e.stopPropagation();
                e.preventDefault();

                elem.removeClass('dragover');   
                elem.addClass('drop');          
            });
        }
    }
});

/**********************
CSS Upload directives
**********************/

//Parsing css files
uikitModule.directive("dropcss", function(dropcsskitService) {
    return {
        restrict : "A",
        link: function (scope, elem, attrs) {      

            elem.bind('drop', function(e) {             
                var files = e.dataTransfer.files,
                    loadingCounter = 0;

                //Files             
                for (var i = 0, f; f = files[i]; i++) {
                    //Only css
                    if (f.type !== 'text/css') {
                        continue;
                    }

                    var reader = new FileReader();

                    // Closure to capture the file information.
                    reader.onload = (function(file, i) {
                        return function(e) {                            

                            //Upload service var
                            dropcsskitService.syncFile(attrs.dropcss, file.name, e.target.result);                            

                            if(loadingCounter === i) {
                                scope.$apply(function() {
                                    scope.cssfiles[attrs.dropcss] = dropcsskitService.generated[attrs.dropcss];
                                });
                            }

                            loadingCounter++;

                        }
                    })(f, i);
                    // Read in the image file as a data URL.
                    reader.readAsText(f, 'UTF-8');                  
                }              

            });

            scope.$on('syncdropcss', function() {
                scope.$apply(function() {
                    scope.cssfiles[attrs.dropcss] = dropcsskitService.generated[attrs.dropcss];
                });
            });

        }
    };
});

//Generate contents and init special generating tags
uikitModule.directive("generatekit", function($compile, dropcsskitService, localStorageService) {
    
    //Selectors map
    var processCss = function(currentSelectors, firstInit) {
            var content = '';

            angular.forEach(currentSelectors, function(selectorObj) {
                var currentElement,
                    currentContent = '';                    

                currentElement = '<' + selectorObj.tag;                                     

                //Attributes map
                angular.forEach(selectorObj.attributes, function(attr) {
                    currentElement += ' ' + attr.name + '="' + attr.value + '"';
                });    

                currentElement += '>';

                currentElement += processCss(selectorObj.childSelectors);

                //Selectors amount
                if(['img', 'input', 'br', 'hr'].indexOf(selectorObj.tag) === -1) {
                    currentElement += selectorObj.uikitCfg.content + '</' + selectorObj.tag + '>';                  
                }

                for(var i = 0; i < selectorObj.uikitCfg.amount; i++) {
                    currentContent += currentElement;
                }

                if(firstInit) {
                    content += '<div style="position: relative; margin: 5px 0;">' + currentContent + '</div>';  
                } else {
                    content += currentContent;  
                }
                
            });

            return content;
        },
        convertConfigToCss = function() {
            //Trasform config to css
            var customCss = '';
            angular.forEach(dropcsskitService.generated.cssCustom, function(selectorCfg) {
                customCss += selectorCfg.name +
                    '{ ' +
                        '/* uikit-amount: ' + selectorCfg.amount  + '; */ ' +
                        '/* uikit-content: ' + selectorCfg.content  + '; */ ' +
                    '} ';
            });

            dropcsskitService.syncCssToObj(customCss);
        },
        getCssFromObj = function(type) {
            var content = '';
            angular.forEach(dropcsskitService.generated[type], function(fileObj) {
                content += fileObj.content;
            });
            return content;
        },
        syncFilesToService = function() {            
            dropcsskitService.reset();
            angular.forEach(dropcsskitService.generated.cssMain, function(fileObj) {
                dropcsskitService.syncCssToObj(fileObj.content, true);
            });
        };

    return {
        restrict : "A",
        link: function (scope, element, attrs) {

            scope.$on('generate', function() {                  

                syncFilesToService();

                //Sync custom config to service
                convertConfigToCss();

                //Add content to localstorage
                localStorageService.add('uikit-content', '<style>' + getCssFromObj('cssBase') + getCssFromObj('cssMain') + '</style>' + processCss(dropcsskitService.generated.cssObj, true));

                //Render iframe
                element.html('<iframe src="uikit.html"></iframe>');
                $compile(element.contents())(scope);                                            

            });         

        }
    }
});

/**********************
CSS import
**********************/

uikitModule.directive("importkit", function(dropcsskitService) {
    return {
        restrict : "A",
        link: function (scope, elem, attrs) {                               
            elem.bind('drop', function(e) {             
                var files = e.dataTransfer.files,
                    uikitfiles = [],
                    //Only the first file
                    f = files[0];

                //Only css      
                uikitfiles.push({name: f.name});
                var reader = new FileReader();

                // Closure to capture the file information.
                reader.onload = function(e) {

                    //Try to load file to service
                    var uikitObj = angular.fromJson(e.target.result);
                    dropcsskitService.fullReset();
                    angular.extend(dropcsskitService.generated, angular.fromJson(uikitObj));
                    //Sync to dropzone
                    scope.$broadcast('syncdropcss');
                    //Sync to config menu
                    scope.$broadcast('syncconfig');               
                                        
                };                  
                // Read in the image file as a data URL.
                reader.readAsText(f, 'UTF-8');  

                scope.$apply(function() {
                    scope.uikitfiles = uikitfiles;
                });

            });
        }
    }
});