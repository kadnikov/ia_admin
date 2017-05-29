'use strict';

angular.module('app.todo.controllers', [])
    .constant('paginationConfig', {
        pageSize: 200
    })
    
    .config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('todo', {
                    url: '/',
                    abstract: true,
                    template: '<ui-view/>'
                } )
                .state('todo.index', {
                    url: '',
                    controller: 'TodoListController',
                    templateUrl: 'frontend/partials/todo/todo-list.html',
                    resolve: {
                    	searchResults: ['Todos', 'paginationConfig', function(Todos, paginationConfig) {
                            return Todos.query(0, paginationConfig.pageSize);
                        }]
                    }
                })
                .state('todo.tree', {
                    url: 'todo/tree',
                    controller: 'TodoTreeController',
                    templateUrl: 'frontend/partials/todo/todo-tree.html',
                    resolve: {
                    	searchResults: ['CMIS', 'paginationConfig', '$stateParams', function(CMIS, paginationConfig,$stateParams) {
                            return CMIS.query('0',0, paginationConfig.pageSize);
                        }]
                    }
                })
                 .state('todo.page', {
                    url: 'todo/page/:pageNumber/size/:pageSize',
                    controller: 'TodoListController',
                    templateUrl: 'frontend/partials/todo/todo-list.html',
                    resolve: {
                    	searchResults: ['Todos', '$stateParams', function(Todos, $stateParams) {
                            return Todos.query($stateParams.pageNumber - 1, $stateParams.pageSize);
                        }]
                    }
                })
                .state('todo.add', {
                    url: 'todo/add',
                    controller: 'AddTodoController',
                    templateUrl: 'frontend/partials/todo/add-todo.html'
                })
                .state('todo.edit', {
                    url: 'todo/:todoId/edit',
                    controller: 'EditTodoController',
                    templateUrl: 'frontend/partials/todo/edit-todo.html',
                    resolve: {
                        updatedTodo: ['Todos', '$stateParams', function(Todos, $stateParams) {
                            if ($stateParams.todoId) {
                                return Todos.get($stateParams.todoId);
                            }
                            return null;
                        }]
                    }
                })
                .state('todo.editform', {
                    url: 'todo/:todoId/editform',
                    controller: 'EditFormController',
                    templateUrl: 'frontend/partials/todo/edit-form.html',
                    resolve: {
                        updatedTodo: ['Todos', '$stateParams', function(Todos, $stateParams) {
                            if ($stateParams.todoId) {
                                return Todos.get($stateParams.todoId);
                            }
                            return null;
                        }]
                    }
                })
                .state('todo.search', {
                    url: 'todo/search/:searchTerm/page/:pageNumber/size/:pageSize',
                    controller: 'SearchResultController',
                    templateUrl: 'frontend/partials/search/search-results.html',
                    resolve: {
                        searchTerm: ['$stateParams', function($stateParams) {
                            return $stateParams.searchTerm;
                        }],
                        searchResults: ['Search', '$stateParams', function(Search, $stateParams) {
                            if ($stateParams.searchTerm) {
                                return Search.findBySearchTerm($stateParams.searchTerm, $stateParams.pageNumber - 1, $stateParams.pageSize);
                            }

                            return null;
                        }]
                    }
                })
                .state('todo.view', {
                    url: 'todo/:todoId',
                    controller: 'ViewTodoController',
                    templateUrl: 'frontend/partials/todo/view-todo.html',
                    resolve: {
                        viewedTodo: ['Todos', '$stateParams', function(Todos, $stateParams) {
                            if ($stateParams.todoId) {
                                return Todos.get($stateParams.todoId);
                            }
                            return null;
                        }]
                    }
                });
        }
    ])
    .controller('TodoListController', ['$scope', '$state', 'searchResults','paginationConfig',
        function($scope, $state, searchResults, paginationConfig) {
        console.log('Rendering documents.');
        $scope.todos = searchResults.content;
        console.log(searchResults);
        console.log(searchResults.totalElements);
        console.log(paginationConfig.pageSize);
        $scope.pagination = {
            currentPage: searchResults.number + 1,
            itemsPerPage: paginationConfig.pageSize,
            totalItems: searchResults.totalElements
        };
        
        $scope.addTodo = function() {
            $state.go('todo.add');
        };
        
        $scope.openTree = function() {
            $state.go('todo.tree');
        };
        
        $scope.pageChanged = function(newPageNumber) {
            $state.go('todo.page',
                {pageNumber: newPageNumber, pageSize: paginationConfig.pageSize},
                {reload: true, inherit: true, notify: true}
            );
        };
    }])
    .controller('EditTodoController', ['$scope', '$state', 'updatedTodo', 'Todos',
        function($scope, $state, updatedTodo, Todos) {
            console.log(updatedTodo);
            $scope.todo = updatedTodo;
            $scope.todo.data=JSON.stringify($scope.todo.data);
            $scope.saveTodo = function() {
                if ($scope.todoForm.$valid) {
                    var onSuccess = function(updated) {
                        $state.go('todo.view', {todoId: updated.id}, { reload: true, inherit: true, notify: true });
                    };
                    $scope.todo.data=JSON.parse($scope.todo.data);
                    Todos.update($scope.todo, onSuccess);
                }
            };
        }])
    .controller('SearchController', ['$scope', '$state', 'paginationConfig',
        function ($scope, $state, paginationConfig) {

            var userWritingSearchTerm = false;
            var minimumSearchTermLength = 3;

            $scope.missingChars = minimumSearchTermLength;
            $scope.searchTerm = "";

            $scope.searchFieldBlur = function() {
                userWritingSearchTerm = false;
            };

            $scope.searchFieldFocus = function() {
                userWritingSearchTerm = true;
            };

            $scope.showMissingCharacterText = function() {
                if (userWritingSearchTerm) {
                    if ($scope.searchTerm.length < minimumSearchTermLength) {
                        return true;
                    }
                }

                return false;
            };

            $scope.search = function() {
                if ($scope.searchTerm.length < minimumSearchTermLength) {
                    $scope.missingChars = minimumSearchTermLength - $scope.searchTerm.length;
                }
                else {
                    $scope.missingChars = 0;
                    $state.go('todo.search',
                        {searchTerm: $scope.searchTerm, pageNumber: 1, pageSize: paginationConfig.pageSize},
                        {reload: true, inherit: true, notify: true}
                    );
                }
            };

        }])
  .controller('SearchResultController', ['$scope', '$state', 'paginationConfig', 'searchTerm', 'searchResults',
        function($scope, $state, paginationConfig, searchTerm, searchResults) {
            console.log('Rendering search results page.');
            $scope.todos = searchResults.content;

            $scope.pagination = {
                currentPage: searchResults.number + 1,
                itemsPerPage: paginationConfig.pageSize,
                totalItems: searchResults.totalElements
            };

            $scope.pageChanged = function(newPageNumber) {
                $state.go('todo.search',
                    {searchTerm: searchTerm, pageNumber: newPageNumber, pageSize: paginationConfig.pageSize},
                    {reload: true, inherit: true, notify: true}
                );
            };
        }])
        
  .controller('DocumentModalController', ['$scope', '$modalInstance', '$state', 'Todos', 'viewedDoc',
        function($scope, $modalInstance, $state, Todos, viewedDoc) {
            $scope.todo = viewedDoc;

            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };

            $scope.editDocument = function() {
                var onSuccess = function() {
                    $modalInstance.close();
                   
                };
            };
        }])      
  .controller('TodoTreeController', ['$scope', '$state', '$modal', 'Todos', 'searchResults','paginationConfig',
        function($scope, $state, $modal, Todos, searchResults, paginationConfig) {

        console.log('Rendering documents tree.');
        var currentDefFormId='';
        var cmis_root= "/jooq/browser/test/root";
		    $('#treecontainer').jstree({
		    'core' : {
		      'data' : {
		        "url" : function (node) {
					  return node.id === '#' ?
						cmis_root+"?objectId=0&cmisselector=children" :
						cmis_root+"?objectId="+node.id+"&cmisselector=children";
					},
				"dataFilter" : function (data) {
					var nodes = [];
					$.each(JSON.parse(data).objects, function(i,item){
						var node = {};
						node.id= item.object.properties["cmis:objectId"].value;
						node.data = {"type": item.object.properties["cmis:objectTypeId"].value};
						node.text=item.object.properties["cmis:name"].value;
						if (item.object.properties["cmis:objectTypeId"].value=="cmis:folder"){node.children=true}
						nodes.push(node);
					});
						
						
					  return JSON.stringify(nodes);
				   },
		        "data" : function (node) {
					console.log(node );
		          return { "id" : node.id, "text": "1" };
		        }
		      }
		    }
		  });
		  //$("#treecontainer").jstree('create_node', '#', {'id' : '0', 'text' : 'Root folder'}, 'last');
		  $('#treecontainer').on("select_node.jstree", function (e, data) {
			  console.log("node_id: "+ data.node.type + " - " + data.node.id); 
			  if (data.node.data.type=="cmis:folder"){
				$scope.loadGrid(data.node.id);
			  }else{
				var docid = parseInt(data.node.id);
				//$state.go('todo.view', {todoId: docid}, { reload: true, inherit: true, notify: true });
				$scope.openDocument(Todos, docid);
			  }
			  
			});
	$scope.openDocument = function(Todos, docid){
		var viewsUrl = '/api/docs/'+docid;
		$.getJSON(viewsUrl, function(viewdata) {
	        if (viewdata.type=='view'){
				$scope.loadGrid('0',viewdata);
	        }else{
	        	$scope.todo =  viewdata;
				$modal.open({
		            templateUrl: 'frontend/partials/todo/document-view-modal.html',
		            controller: 'DocumentModalController',
		            resolve: {
		                viewedDoc: function () {
	                            return $scope.todo;
	                        }
		            }
				}); 
			}
		});
		
	}
	$scope.loadGrid = function(folderId,viewdata) {
        console.log('Rendering documents grid.');
        
    	$("#jqGrid").jqGrid('GridUnload');
    	var dateOptions= {
    			// dataInit is the client-side event that fires upon initializing the toolbar search field for a column
    			// use it to place a third party control to customize the toolbar
    			dataInit: function (element) {
    				$(element).datepicker({
    					id: 'orderDate_datePicker',
    					dateFormat: 'yy-mm-dd',
    					//minDate: new Date(2010, 0, 1),
    					maxDate: new Date(2020, 0, 1),
    					showOn: 'focus'
    				});
    			},
    			// show search options
    			sopt: ["gt","lt","eq"] // gt = greater , lt = less , eq = equal to							
    		};
    	var editSettings = {
    			recreateForm:true,
    			jqModal:false,
    			reloadAfterSubmit:false,
    			closeOnEscape:true,
    			savekey: [true,13],
    			closeAfterEdit:true,
    			afterShowForm:function(){
    				$("#lui_"+grid[0].id).hide();
    			}
    		};
    	var addSettings = {
    			recreateForm:true,
    			jqModal:false,
    			reloadAfterSubmit:false,
    			savekey: [true,13],
    			closeOnEscape:true,
    			closeAfterAdd:true,
    			afterShowForm:function(){
    				$("#lui_"+grid[0].id).hide();
    			}
    		};
    	var delSettings = {
    			processing:true
    		};
    		
    	var id=folderId;
    	
    	var viewEntriesUrl = cmis_root+'?objectId='+id+'&cmisselector=children';
    	var sys_fields=['id', 'type', 'title', 'description', 'modifier', 'modificationTime','autor','creationTime'];
    	var fields=['id', 'title', 'description', 'modifier', 'modificationTime'];
    	var rowSize=paginationConfig.pageSize;
    	var columns =[
    			{ name: 'id', key: true, width: 75, jsonmap: 'object.properties.cmis:objectId.value'},
    			{ name: 'type', label : "Тип",width: 100, jsonmap: 'object.properties.cmis:objectTypeId.value' },
    			{ name: 'title', label : "Заголовок",width: 150, jsonmap: 'object.properties.cmis:name.value' },
    			{ name: 'description', label : "Описание", width: 150, jsonmap: 'object.properties.cmis:description.value' },
    			{ name: 'author', label : "Создал", width: 150, jsonmap: 'object.properties.cmis:createdBy.value' },
    			{ name: 'creationTime', label : "Дата создания", width: 150, jsonmap: 'object.properties.cmis:creationDate.value' , 
    						formatter:'date', formatoptions: {srcformat: 'U/1000', newformat:'d.m.Y H:i'},
    						sorttype:'date',
                            searchoptions: dateOptions
    			},
    			{ name: 'modifier', label : "Изменил", width: 150, jsonmap: 'object.properties.cmis:lastModifiedBy.value' },
    			{ name: 'modificationTime', label : "Дата изменения", width: 150, jsonmap: 'object.properties.cmis:lastModificationDate.value', 
    						formatter:'date', formatoptions: {srcformat: 'U/1000', newformat:'d.m.Y H:i'},
    						sorttype:'date',
                            searchoptions: dateOptions
    			}
    		];
    	console.log(viewdata);
    	if (viewdata!=null){
    		viewEntriesUrl = viewdata.data.query+'?fields=';
    		fields=[];
    		columns=[];
    		$.each(viewdata.data.columnDescriptions, function(i,item){
    			
    			if (item.visible!=false){
    				var colWidth = 140;
    				if (item.width) colWidth = parseInt(item.width);
    				var fieldOps = {"name": item.field, "label": item.name, "width": colWidth};
    				if (item.sortField) {fieldOps.index = item.sortField}
    				if ($.inArray(item.field, sys_fields)==-1){
    					fieldOps.jsonmap="data."+item.field;
    					fields.push(item.field);
    				}
    				if (item.type=='INTEGER') fieldOps.searchoptions={sopt: ["gt","lt","eq"] };
    				if (item.type=='DATE') {
    					fieldOps.sorttype='date';
    					fieldOps.searchoptions=dateOptions;
    				}
    				columns.push(fieldOps);
    			}
    		});
    		console.log(columns);
    		viewEntriesUrl +=fields.join();
    		viewEntriesUrl +='&size='+rowSize;
    		console.log(viewEntriesUrl);
    	}
    	var fixGridWidth = function (grid) {
    	    var gviewScrollWidth = grid[0].parentNode.parentNode.parentNode.scrollWidth;
    	    var mainWidth = jQuery('#main').width();
    	    var gridScrollWidth = grid[0].scrollWidth;
    	    var htable = jQuery('table.ui-jqgrid-htable', grid[0].parentNode.parentNode.parentNode);
    	    var scrollWidth = gridScrollWidth;
    	    if (htable.length > 0) {
    	        var hdivScrollWidth = htable[0].scrollWidth;
    	        if ((gridScrollWidth < hdivScrollWidth))
    	            scrollWidth = hdivScrollWidth; // max (gridScrollWidth, hdivScrollWidth)
    	    }
    	    if (gviewScrollWidth != scrollWidth || scrollWidth > mainWidth) {
    	        var newGridWidth = (scrollWidth <= mainWidth)? scrollWidth: mainWidth;  // min (scrollWidth, mainWidth)
    	        // if the grid has no data, gridScrollWidth can be less then hdiv[0].scrollWidth
    	        if (newGridWidth != gviewScrollWidth){
    	            grid.jqGrid("setGridWidth", newGridWidth);
    	            console.log("Width fixed.")
    	        }
    	    }
    	};

    	var fixGridHeight = function (grid) {
    	    var gviewNode = grid[0].parentNode.parentNode.parentNode;
    	    //var gview = grid.parent().parent().parent();
    	    //var bdiv = jQuery("#gview_" + grid[0].id + " .ui-jqgrid-bdiv");
    	    var bdiv = jQuery(".ui-jqgrid-bdiv", gviewNode);
    	    if (bdiv.length) {
    	        var delta = bdiv[0].scrollHeight - bdiv[0].clientHeight;
    	        var height = grid.height();
    	        if (delta !== 0 && height && (height-delta>0)) {
    	            grid.setGridHeight(height-delta);
    	            console.log("Height fixed.")
    	        
    	        }
    	    }
    	};

    	var fixGridSize = function (grid) {
    	    fixGridWidth(grid);
    	    fixGridHeight(grid);
    	};
    	
    	$(window).resize(function () {
    		fixGridSize($('#jqGrid'));
    	});

    	
    	$("#jqGrid").jqGrid({
    		url: viewEntriesUrl,
    		mtype: "GET",
    		datatype: "json",
    		page: 1,
    		colModel: columns,
    		autowidth: true,
    		shrinkToFit: true,
    		//height:'100%',
    		maxHeight: 500,
    		rowNum: paginationConfig.pageSize,
    		//guiStyle: "bootstrap",
    		serializeGridData: function(postData) {
    			if (typeof(postData.page) === "number") {
    				postData.page--; // decrease the value of page before sending to the server
    			}
    			if (postData.sidx!=null && postData.sidx!=''){
    				postData.sort=postData.sidx+","+postData.sord;
    			}else{
    				postData.sort="ID,DESC"
    			}
    			return postData;
    		},
    		jsonReader: {
    			repeatitems: false,
    			root: function(data){
    				if (data.content){
    					return data.content;
    				}
    				return data.objects;
    			},
    			total: function(data) {
    				return data.totalPages;
    			},
    			page: function(data){
    				return data.number+1;
    			},
    			records: function(data){
    				if(data.totalElements){
    					return data.totalElements;
    				}
    				return data.numItems;
    			} 
    		},
    		onSelectRow: function(ids) { 
                if(ids == null) {
    				loadGridCMIS("0");
    			}else{
    				var rowData = $("#jqGrid").getRowData(ids);
    				console.log("Type: "+rowData['type'])
    				if (rowData['type']=="cmis:folder"){
    					$scope.loadGrid(ids);
    				}else{
    					console.log("request doc "+ids);
    					var docid = parseInt(ids);
    					$scope.openDocument(Todos, docid);
    				}
    			}
    		},
    		scroll: 1, // set the scroll property to 1 to enable paging with scrollbar - virtual loading of records
    		emptyrecords: 'Scroll to bottom to retrieve new page', // the message will be displayed at the bottom 
    		pager: "#jqGridPager",
    		loadComplete: function() {
    			fixGridSize($('#jqGrid'));
    			$("tr.jqgrow", this).contextMenu('folderMenu', {
    				bindings: {
    					'edit': function(trigger) {
    						// trigger is the DOM element ("tr.jqgrow") which are triggered
    						$('#jqGrid').editGridRow(trigger.id, editSettings);
    					},
    					'add': function(/*trigger*/) {
    						$('#jqGrid').editGridRow("new", addSettings);
    					},
    					'del': function(trigger) {
    						if ($('#del').hasClass('ui-state-disabled') === false) {
    							// disabled item can do be choosed
    							$('#jqGrid').delGridRow(trigger.id, delSettings);
    						}
    					}
    				},
    				onContextMenu: function(event/*, menu*/) {
    					var rowId = $(event.target).closest("tr.jqgrow").attr("id");
    					//grid.setSelection(rowId);
    					// disable menu for rows with even rowids
    					$('#del').attr("disabled",Number(rowId)%2 === 0);
    					if (Number(rowId)%2 === 0) {
    						$('#del').attr("disabled","disabled").addClass('ui-state-disabled');
    					} else {
    						$('#del').removeAttr("disabled").removeClass('ui-state-disabled');
    					}
    					return true;
    				}
    			});
    		}
    	});
    	$('#jqGrid').navGrid("#jqGridPager", {                
    		search: true, // show search button on the toolbar
    		add: false,
    		edit: false,
    		del: false,
    		refresh: true
    		},
    		{}, // edit options
    		{}, // add options
    		{}, // delete options
    		{ multipleSearch: true, uniqueSearchFields : true, multipleGroup : true}
    	);
		  }
		  

		  $scope.loadGrid('0');
    }])
    .controller('AddTodoController', ['$scope', '$state', 'Todos',
        function($scope, $state, Todos) {
            console.log('Rendering add todo entry page.');
            $scope.todo = {};

            $scope.saveTodo = function() {
                if ($scope.todoForm.$valid) {
                    var onSuccess = function(added) {
                        $state.go('todo.view', {todoId: added.id}, { reload: true, inherit: true, notify: true });
                    };
                    $scope.todo.data=JSON.parse($scope.todo.data);
                    Todos.save($scope.todo, onSuccess);
                }
            };
        }])
    .controller('DeleteTodoController', ['$scope', '$modalInstance', '$state', 'Todos', 'deletedTodo',
        function($scope, $modalInstance, $state, Todos, deletedTodo) {
            $scope.todo = deletedTodo;

            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };

            $scope.delete = function() {
                var onSuccess = function() {
                    $modalInstance.close();
                    $state.go('todo.index', {}, { reload: true, inherit: true, notify: true });
                };
                Todos.delete($scope.todo, onSuccess);
            };
        }])        
    .controller('EditFormController', ['$scope', '$state', 'updatedTodo', 'Todos',
        function($scope, $state, updatedTodo, Todos) {
            console.log(updatedTodo);
            $scope.todo = updatedTodo;
            var typeUrl="/api/system/s/"+$scope.todo.type;
            
            $.ajax
            ({
                type: "GET",
                url: typeUrl,
                dataType: 'json',
                async: false,
                success: function (res) {
                	$scope.schema = res.data.schema;
                }
            })
            
            $scope.form = [
	    	    "*"
	    	  ];
	
            $scope.model = $scope.todo.data;
            $scope.saveTodo = function() {
                if ($scope.todoForm.$valid) {
                    var onSuccess = function(updated) {
                        $state.go('todo.view', {todoId: updated.id}, { reload: true, inherit: true, notify: true });
                    };
                    $scope.todo.data=$scope.model;
                    Todos.update($scope.todo, onSuccess);
                }
            };
        }])
    .controller('ViewTodoController', ['$scope', '$state', '$modal', 'viewedTodo',
        function($scope, $state, $modal, viewedTodo) {
            console.log('Rendering view todo entry page.');
            $scope.todo = viewedTodo;

            $scope.showEditPage = function() {
                $state.go("todo.edit", {todoId: $scope.todo.id}, { reload: true, inherit: true, notify: true });
            };
            
            $scope.showEditFormPage = function() {
                $state.go("todo.editform", {todoId: $scope.todo.id}, { reload: true, inherit: true, notify: true });
            };

            $scope.showDeleteDialog = function() {
                $modal.open({
                    templateUrl: 'frontend/partials/todo/delete-todo-modal.html',
                    controller: 'DeleteTodoController',
                    resolve: {
                        deletedTodo: function () {
                            return $scope.todo;
                        }
                    }
                });
            };
        }]);
