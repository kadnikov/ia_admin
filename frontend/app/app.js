'use strict';

var App = angular.module('app', [
    'ngLocale',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'pascalprecht.translate',
    'ui.bootstrap',
    'ui.router',
    'ui.utils',
    'angular-growl',
    'angularMoment',
    'angularUtils.directives.dirPagination',
    
    'angular-jqgrid',

    //Partials
    'app.partials',

    //Common
    'app.common.config', 'app.common.directives', 'app.common.services',

    //Search
    'app.search.services',

    //Todo
    'app.todo.controllers', 'app.todo.services',
    
    'app.cmis.services'

]);

