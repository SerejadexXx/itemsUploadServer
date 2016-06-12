var module = angular.module('indexApp');

module.config(function($stateProvider) {
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'home/home.html',
                controller: 'homeCtrl'
            })
    })
    .controller('homeCtrl', function($scope, Upload, $window, $interval) {
        $scope.accessCode = {
            text: '4'
        };
        $scope.files = {
            zipArchive: null,
            jsonData: null
        };

        $scope.Upload = function(file, param) {
            if (file) {
                Upload.upload({
                    url: '/upload/' + param,
                    params: {accessCode: $scope.accessCode.text},
                    data: {file: file}
                }).then(function (resp) {
                    console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
                }, function (resp) {
                    console.log('Error status: ' + resp.status);
                }, function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                });
            }
        }
    });