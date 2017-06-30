'use strict';

angular.module('app.system.controllers', [])
    .constant('paginationConfig', {
        pageSize: 200
    })
    
    .config(['$stateProvider',
        function ($stateProvider) {
            $stateProvider
                .state('system', {
                    url: '/',
                    abstract: true,
                    template: '<ui-view/>'
                } )
                .state('system.index', {
                    url: '',
                    controller: 'SystemListController',
                    templateUrl: 'frontend/partials/todo/todo-list.html',
                    resolve: {
                    	searchResults: ['System', 'paginationConfig', function(System, paginationConfig) {
                            return System.query(0, paginationConfig.pageSize);
                        }]
                    }
                })
                .state('system.add', {
                    url: 'system/add',
                    controller: 'AddSystemController',
                    templateUrl: 'frontend/partials/todo/add-todo.html'
                })
                .state('system.edit', {
                    url: 'system/:systemId/edit',
                    controller: 'EditSystemController',
                    templateUrl: 'frontend/partials/todo/edit-todo.html',
                    resolve: {
                        updatedTodo: ['System', '$stateParams', function(System, $stateParams) {
                            if ($stateParams.systemId) {
                                return System.get($stateParams.systemId);
                            }
                            return null;
                        }]
                    }
                })
                .state('system.searchform', {
                    url: 'system/searchform/:systemId',
                    controller: 'SearchFormController',
                    templateUrl: 'frontend/partials/todo/search-form.html',
                    resolve: {
                        updatedTodo: ['System', '$stateParams', function(System, $stateParams) {
                            if ($stateParams.systemId) {
                                return System.get($stateParams.systemId);
                            }
                            return null;
                        }]
                    }
                })
                .state('system.editform', {
                    url: 'system/:systemId/editform',
                    controller: 'EditFormController',
                    templateUrl: 'frontend/partials/todo/edit-form.html',
                    resolve: {
                        updatedTodo: ['System', '$stateParams', function(System, $stateParams) {
                            if ($stateParams.systemId) {
                                return System.get($stateParams.systemId);
                            }
                            return null;
                        }]
                    }
                })
                .state('system.view', {
                    url: 'system/:systemId',
                    controller: 'ViewSystemController',
                    templateUrl: 'frontend/partials/todo/view-todo.html',
                    resolve: {
                        viewedTodo: ['System', '$stateParams', function(System, $stateParams) {
                            if ($stateParams.systemId) {
                                return System.get($stateParams.systemId);
                            }
                            return null;
                        }]
                    }
                });
        }
    ])
    .controller('SystemListController', ['$scope', '$state', 'searchResults','paginationConfig',
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
            $state.go('system.add');
        };

    }])
    .controller('AddSystemController', ['$scope', '$state', 'System',
        function($scope, $state, System) {
            console.log('Rendering add todo entry page.');
            $scope.todo = {};

            $scope.saveTodo = function() {
                if ($scope.todoForm.$valid) {
                    var onSuccess = function(added) {
                        $state.go('system.view', {systemId: added.id}, { reload: true, inherit: true, notify: true });
                    };
                    $scope.todo.data=JSON.parse($scope.todo.data);
                    System.save($scope.todo, onSuccess);
                }
            };
        }])
    .controller('DeleteSystemController', ['$scope', '$modalInstance', '$state', 'System', 'deletedTodo',
        function($scope, $modalInstance, $state, System, deletedTodo) {
            $scope.todo = deletedTodo;

            $scope.cancel = function() {
                $modalInstance.dismiss('cancel');
            };

            $scope.delete = function() {
                var onSuccess = function() {
                    $modalInstance.close();
                    $state.go('system.index', {}, { reload: true, inherit: true, notify: true });
                };
                System.delete($scope.todo, onSuccess);
            };
        }])        
    .controller('EditFormController', ['$scope', '$state', 'updatedTodo', 'System',
        function($scope, $state, updatedTodo, System) {
            console.log(updatedTodo);
            $scope.todo = updatedTodo;
           	$scope.schema = {
           		  "type": "object",
           		  "title": "schema",
           		  "properties": {
           			"symbolicName":{
           				"type":"string",
           				"title":"Символьный идентификатор типа"
           			},
           			"storage_policy":{
           				"type":"string",
           				"title":"Политика хранения"
           			},
           		    "properties": {
           		      "type": "array",
           		      "items": {
           		        "type": "object",
           		        "properties": {
           		          "name": {
           		            "title": "Идентификатор атрибута",
           		            "type": "string"
           		          },
           		          "title": {
           		            "title": "Заголовок атрибута",
           		            "type": "string"
           		          },
           		          "type": {
           		            "title": "Тип атрибута",
           		            "type": "string"
           		          }
           		        },
           		        "required": [
           		          "name",
           		          "title",
           		          "type"
           		        ]
           		      }
           		    }
           		  }
           		};
            
            $scope.form = [
            	{"key":"symbolicName"},
            	{"key":"storage_policy"},
            	{"type": "tabs",
         		        "tabs": [
         		          {
         		            "title": "Атрибуты",
         		            "items": [
         		            	{
		            		    "key": "properties",
		            		    "type": "tabarray",
		            		    "add": "Добавить",
		            		    "remove": "Удалить",
		            		    "style": {
		            		      "remove": "btn-danger"
		            		    },
		            		    "title": "{{ value.name || 'Tab '+$index }}",
		            		    "items": [
		            		      "properties[].name",
		            		      "properties[].title",
		            		      "properties[].type"
		            		    ]
		            		  }
         		            ]
         		          },
         		          {
         		        	"title": "Права доступа",
           		            "items": [ ] 
         		          }
         		        ]
            		}
            		];
            var props = $scope.todo.data.schema.properties;
            var model = $scope.todo.data;
            model.symbolicName=$scope.todo.symbolicName;
            model.properties=[];
            for (var prop in props){
            	var mprop = {"name":prop,"title":props[prop].title,"type":props[prop].type}
            	model.properties.push(mprop);
            }
            console.log(model);
            $scope.model = model;
            $scope.saveTodo = function() {
                if ($scope.todoForm.$valid) {
                    var onSuccess = function(updated) {
                        $state.go('system.view', {systemId: updated.id}, { reload: true, inherit: true, notify: true });
                    };
                    var resprops = $scope.model.properties;
                    var resprop = {}
                    for (var i = 0; i < resprops.length; i++) {
                    	resprop[resprops[i].name]={};
                    	resprop[resprops[i].name].title=resprops[i].title;
                    	resprop[resprops[i].name].type=resprops[i].type;
                    }
                    $scope.todo.data.schema.properties=resprop;
                    $scope.todo.symbolicName=$scope.model.symbolicName;
                    console.log($scope.todo);
                    System.update($scope.todo, onSuccess);
                }
            };
        }])
        
    .controller('SearchFormController', ['$scope', '$state', 'updatedTodo', 'System',
        function($scope, $state, updatedTodo, System) {
            console.log(updatedTodo);
            $scope.todo = updatedTodo;
           	$scope.schema = $scope.todo.data.schema;
            
            $scope.form = $scope.todo.data.form;
            var model = {};

            $scope.model = model;
            $scope.saveTodo = function() {
                if ($scope.todoForm.$valid) {
                    var onSuccess = function(updated) {
                        $state.go('system.view', {systemId: updated.id}, { reload: true, inherit: true, notify: true });
                    };
                    console.log($scope.todo);
                    //System.update($scope.todo, onSuccess);
                }
            };
        }])
    .controller('EditSystemController', ['$scope', '$state', 'updatedTodo', 'System',
        function($scope, $state, updatedTodo, System) {
            console.log(updatedTodo);
            $scope.todo = updatedTodo;
            $scope.todo.data=JSON.stringify($scope.todo.data);
            $scope.saveTodo = function() {
                if ($scope.todoForm.$valid) {
                    var onSuccess = function(updated) {
                        $state.go('system.view', {systemId: updated.id}, { reload: true, inherit: true, notify: true });
                    };
                    $scope.todo.data=JSON.parse($scope.todo.data);
                    System.update($scope.todo, onSuccess);
                }
            };
        }])
    .controller('ViewSystemController', ['$scope', '$state', 'viewedTodo',
        function($scope, $state, viewedTodo) {
            console.log('Rendering view todo entry page.');
            $scope.todo = viewedTodo;

            $scope.showEditPage = function() {
                $state.go("system.edit", {systemId: $scope.todo.id}, { reload: true, inherit: true, notify: true });
            };

        }]);
