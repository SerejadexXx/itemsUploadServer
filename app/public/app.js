var module = angular.module('indexApp', ['ui.router', 'ngFileUpload']);

module.config(function($urlRouterProvider) {
    $urlRouterProvider.otherwise("/home");
});
