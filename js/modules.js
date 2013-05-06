'use strict';
// Dropzone
var uikitModule = angular.module('uikit-maker', ['LocalStorageModule']);

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
CSS Upload service and directives
**********************/

//Service for communation
uikitModule.factory('dropcsskitService', function($rootScope) {

	var selectorPackage = [],
		fullSelectorPackage = [],
		extend = function(selectorObj, newSelectorObj) {
			var canMerge = selectorObj.coreProto.root.name === newSelectorObj.coreProto.root.name,
				unitMerger = function(selectorObj, newSelectorObj) {										
					//Add childrens
					if(!selectorObj.childSelectors[0]) {
						selectorObj.childSelectors = unitConcat(selectorObj, newSelectorObj.childSelectors);
						return false;
					}

					//Extend childrens										
					angular.forEach(selectorObj.childSelectors, function(childSelectorObj) {
						angular.forEach(newSelectorObj.childSelectors, function(newChildSelectorObj) {
							if(childSelectorObj.name === newChildSelectorObj.name) {
								unitMerger(childSelectorObj, newChildSelectorObj);																										
							} else {					
								var canAdd = true,
									concatedSelector = unitConcat(childSelectorObj, [newChildSelectorObj])[0];
								//Check current cycle
								angular.forEach(selectorObj.childSelectors, function(selector) {
									if(selector.name === concatedSelector.name) {
										canAdd = false;
									}
								});
								if(canAdd) {
									selectorObj.childSelectors.push(concatedSelector);
								}
							}	
						});
					});
				},							
				unitConcat = function(selectorObj, childSelectors) {																		
					angular.forEach(childSelectors, function(childSelectorObj, i) {
						childSelectors[i].coreProto = selectorObj.coreProto;

						childSelectors[i].childSelectors = unitConcat(selectorObj, childSelectorObj.childSelectors);
					});

					return childSelectors;
				};

			//Check package
			if(canMerge) {
				unitMerger(selectorObj.coreProto.root, newSelectorObj.coreProto.root);
			}

			return canMerge;								
		},
		translateHelper = {
	    	/**
	    	 * Definitions
	    	 * http://www.w3.org/TR/css3-selectors/#selectors
	    	 */

	    	//Pattern E
	    	getTag: function(selector) {
				var tagMatch = selector.match(/^([a-z0-9_\-]+)/i);
				if(tagMatch) {
					return tagMatch[1];
				} else {
					return 'div';
				}
			},
			
			//Pattern: E[foo]
			//Pattern: E[foo="bar"]
			//Pattern: E[foo~="bar"]
			//Pattern: E[foo^="bar"]
			//Pattern: E[foo$="bar"]
			//Pattern: E[foo*="bar"]
			//Pattern: E[foo|="en"]					
			getAttributes: function(selector) {																			
				var attributesMatch = selector.match(/\[([a-z0-9_\-]+)([\~|\^|\$|\*|\|]?="(.*?)")*\]/gi),
					attibuteMatch,
					attributes = [],
					classNameMatch = selector.match(/\.([a-z0-9_\-])+/gi),
					className = '',
					idMatch = selector.match(/\#([a-z0-9_\-]+)/),
					imgMatch = selector.match(/^img/);

				
				if(attributesMatch) {
					angular.forEach(attributesMatch, function(attributeSelector) {
						attibuteMatch = attributeSelector.match(/\[([a-z0-9_\-]+)([\~|\^|\$|\*|\|]?="(.*?)")*\]/i);
						attributes.push({
							name: attibuteMatch[1],
							value: !!attibuteMatch[3] ? attibuteMatch[3] : 'Lorem'
						});
					});
				}

				//Pattern: E#myid
				if(idMatch) {
					attributes.push({
						name: 'id',
						value: idMatch[1]
					});
				}

				//Pattern: E.warning
				if(classNameMatch) {
					angular.forEach(classNameMatch, function(classSelector) {
						className += classSelector.substr(1) + ' ';
					});						
					attributes.push({
						name: 'class',
						value: className.trim()
					});
				}

				//Default src pattern for imgs
				if(imgMatch) {
					attributes.push({
						name: 'src',
						value: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjOWU5ZTllIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiM4ODgiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4='
					});
				}

				return attributes;
			}
		};

    return {
    	generate: function() {
    		$rootScope.$broadcast('generate');
    	},
    	generated: {
    		cssObj: {},
    		cssBase: '',
    		cssMain: '',
    		cssCustom: ''
		},					
		//Merge to center section
		add: function(newSelectorObj, isImport) {
			var merged = false;

			angular.forEach(fullSelectorPackage, function(selectorObj, i) {									
				if(extend(selectorObj, newSelectorObj)) {
					fullSelectorPackage[i] = selectorObj;
					if(isImport) {
						selectorPackage[i] = selectorObj;
					}

					merged = true;
					return false;
				}
			});

			if(!merged) {
				fullSelectorPackage.push(newSelectorObj);
				if(isImport) {
					selectorPackage.push(newSelectorObj);
				}				
			}

			//Upload generated css to Service
			this.generated.cssObj = fullSelectorPackage;
		},
		syncCssToObj: function(source, isImport) {
			var self = this;

			//Seperate imported and config css  
			if(!isImport) {				
				fullSelectorPackage = selectorPackage.map(function(selectorObj) {
					return angular.extend({}, selectorObj);
				});
			}

			//Upload service var
			this.generated.cssMain += source;

			//Split css definitions
			//.replace(/(\/\*.*?\*\/)/g,'')
			angular.forEach(source.replace(/(\r\n|\n|\r)/gm,'').match(/[^\}\/]*?\{.*?\}/g), function(value, key) {
				var fullrule = value.match(/(.*?)\{(.*?)\}/),
					fullraw = fullrule[1],
					rules = fullrule[2],
					uikitAmount = rules.match(/uikit-amount:(.*?);/),
					uikitContent = rules.match(/uikit-content:(.*?);/),
					uikitCfg = {
						amount: uikitAmount ? uikitAmount[1].trim() : 1,
						content: uikitContent ? uikitContent[1].trim() : ''
					};


				//Split multiple css selectors
				angular.forEach(fullraw.split(/[\s]*[,][\s]*/), function(raw) {
					raw = raw.trim();
					var	selectors = raw.split(/\s/),
						selectorObj = null,
						rootSelectorObj = null,
						core,
						setCoreProto = function() {
							core.coreProto = {
								root: rootSelectorObj
							};										
						};

					//Empty || Default tags (Pattern *) || pseudo || @media @keyframes etc...
					if(raw === '' || /^(\*|html|body)/.test(selectors[0]) || /:[a-z0-9_\-]+$/.test(raw) || /^@$/.test(raw)) {
						return true;
					}								

					//Selector mapping
					angular.forEach(selectors, function(selector, i) {

						//Handle combinators
						if(!!i) {
							if(selectors[i-1] === '>') {
								return true;
							}
							if(selectors[i-1] === '+' || selectors[i-1] === '~') {
								//Jump back to parent
								selectorObj = selectorObj.parentSelector;
								return true;
							}
						}
						
						selectorObj = {
							name: selector,
							tag: translateHelper.getTag(selector),
							attributes: translateHelper.getAttributes(selector),
							parentSelector: selectorObj,
							childSelectors: [],
							coreProto: {}
						};									

						//Last selector in the rule
						if(selectors.length-1 === i) {
							selectorObj.uikitCfg = uikitCfg;
						//Any other selector get defaults
						} else {
							selectorObj.uikitCfg = {
								amount: 1,
								content: ''
							};										
						}

						//Set as child
						if(selectorObj.parentSelector) {																				
							selectorObj.parentSelector.childSelectors.push(selectorObj);
						}
					
					});

					//Get root
					rootSelectorObj = selectorObj;
					while(rootSelectorObj.parentSelector && (rootSelectorObj = rootSelectorObj.parentSelector));

					//Set coreProto for all level
					core = selectorObj;								
					setCoreProto();
					while(core.childSelectors && (core = core.parentSelector)) {
						setCoreProto();
					}	

					self.add(selectorObj.coreProto.root, !!isImport);

				});

			});

		}
    };
});


//Parsing Base files
uikitModule.directive("dropcssbase", function(dropcsskitService) {
    return {
        restrict : "A",
        link: function (scope, elem, attrs) {        	      				
            elem.bind('drop', function(e) {            	
			    var files = e.dataTransfer.files,
			    	cssfiles = [];

				//Reset service var
				dropcsskitService.generated.cssBase = '';

				//Files				
			    for (var i = 0, f; f = files[i]; i++) {
			    	//Only css
					if (f.type !== 'text/css') {
						continue;
					}			    	
					cssfiles.push({name: files[i].name});
					var reader = new FileReader();

					// Closure to capture the file information.
					reader.onload = function(e) {

						//Upload service var
						dropcsskitService.generated.cssBase += e.target.result;

					};					
					// Read in the image file as a data URL.
					reader.readAsText(f, 'UTF-8');			    	
			    }			   

	            scope.$apply(function() {
		        	scope.cssbasefiles = cssfiles;
		        });

			});
		}
	};
});

//Parsing Main files
uikitModule.directive("dropcssmain", function(dropcsskitService) {
    return {
        restrict : "A",
        link: function (scope, elem, attrs) {        	      				
            elem.bind('drop', function(e) {            	
			    var files = e.dataTransfer.files,
			    	cssfiles = [];

				//Reset service var
				dropcsskitService.generated.cssMain = '';

				//Files				
			    for (var i = 0, f; f = files[i]; i++) {
			    	//Only css
					if (f.type !== 'text/css') {
						continue;
					}			    	
			    	cssfiles.push({name: files[i].name});
					var reader = new FileReader();

					// Closure to capture the file information.
					reader.onload = function(e) {
						
						dropcsskitService.syncCssToObj(e.target.result, true);
											
					};					
					// Read in the image file as a data URL.
					reader.readAsText(f, 'UTF-8');			    	
			    }	

	            scope.$apply(function() {
		        	scope.cssmainfiles = cssfiles;
		        });
            });
        }
    }
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
		syncConfig = function() {
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
		};

    return {
        restrict : "A",
        link: function (scope, element, attrs) {

			scope.$on('generate', function() {					

				//Sync custom config to service
				syncConfig();

	        	//Add content to localstorage
	        	localStorageService.add('uikit-content', '<style>' + dropcsskitService.generated.cssBase + dropcsskitService.generated.cssMain + '</style>' + processCss(dropcsskitService.generated.cssObj, true));

				//Render iframe
	        	element.html('<iframe src="uikit.html"></iframe>');
	        	$compile(element.contents())(scope);	        		        	        	

			});	        

        }
    }
});