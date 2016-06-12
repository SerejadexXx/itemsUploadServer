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
        $scope.files = {
            zipArchive: null
        };

        $scope.Upload = function(file) {
            if (file) {
                Upload.upload({
                    url: '/upload',
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