'use strict';

angular.module('app.cmis.services', ['ngResource'])
    .factory('CMIS', ['$resource', 'NotificationService', function($resource, NotificationService) {
        var api = $resource('/jooq/browser/test/root?cmisselector=children&objectId=:id', {"id": "@id"}, {
            query:  {method: 'GET', params: {}, isArray: false}
        });

        return {
            query: function(folderId, pageNumber, pageSize) {
                return api.query({id: folderId, page: pageNumber, size: pageSize, sort: 'ID,DESC'}).$promise;
            }
        };
    }]);