var app = angular.module('app', ['ngResource', 'ui.bootstrap']);
app.config(['$routeProvider', '$locationProvider', '$httpProvider',
    function($routeProvider, $locationProvider, $httpProvider){
        $routeProvider
            .when('/',{
                templateUrl: '/partial/comment.html',
                controller: 'commentCtrl'
            })
            .when('/editUser',{
                templateUrl:'/partial/editUser.html'
            })
            .otherwise({
                templateUrl:'/partial/404.html'
            });
        $locationProvider.html5Mode(true);
        var interceptor = ['$location', '$rootScope', '$q', function($location, $rootScope, $q) {
            function success(response) {
                return response;
            }

            function error(response) {
                var status = response.status;
                if (status === 401  && $location.path()!='/401') {
                    $rootScope.savePath = $location.path();   //save current path for reloading after logged in
                    $rootScope.signOn = true;
                }
                else if (status === 500) {
                    $rootScope.signOn = true;
                    $location.path("/");
                }
                else if (status === 404) {
                    $location.path("/404");
                }
                // otherwise

                return $q.reject(response);
            }

            return function (promise) {
                return promise.then(success, error);
            }
        }];
        $httpProvider.responseInterceptors.push(interceptor);
    }]
)
//
.run(['$rootScope', '$location',  function ($rootScope, $location) {
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
//        console.log('===================== route change ==============');
//        console.log(event);
//        console.log(next);
//        console.log(current);
//        console.log('===================== end ==============');
    });

}]);

//I wrote this manual control of collapse nav-bar in a kind of hack way, because I really don't want to import jQuery
app.controller('menuCtrl',function($scope) {
    $scope.in = ''
    $scope.toggleCollapsed = function(){
        if($scope.in == ''){
            $scope.in = 'in'
        }
        else {
            $scope.in = ''
        }
    }
});
app.controller('userCtrl', function($scope, $resource, $location, imageResizeService, $rootScope){
    $scope.selectFile = function(element) {    //select image files within the photos directory
        var file = element.files[0];
        imageResizeService.resize(file, function(canvas){
            $scope.user.img = canvas.toDataURL("image/jpeg");
            $scope.$apply();
        });
    };
    $scope.saveUserInfo = function(){
        $scope.result = {};
        if($scope.user.nick){
            $scope.result = $resource('/saveUser').save($scope.user, function(){
                $resource('/userInfo').get(function(user){
                    $rootScope.user = user;
                });
            });
        }
        else{
            $scope.result = {status : 'no nick name'};
        }
    };
});
app.controller('commentCtrl', function($scope, $resource, $location, $rootScope){
    $scope.cmt = {};
    $scope.source ="be who you are and say what you feel";

    $scope.$watch('speak', function () {           //catch any change to total pages available
        if($scope.speak == $scope.source){
            $scope.equal =  'right!';
        }
        else {
            $scope.equal =  'try again!';
        }
    });
    if(! $rootScope.user) {
        $resource('/userInfo').get(function(user){
            $rootScope.user = user;

        });
    }
    $scope.comments = $resource('/listComments').query(function() {

    });

    $scope.submit = function(){
        if($scope.cmt.nick && $scope.cmt.content){
            $scope.result = $resource('/saveComment').save($scope.cmt, function(){
                $scope.comments = $resource('/listComments').query(function() {

                });
            });
        }
        else{
            $scope.result = {status: 'Error: Incomplete Comment.'};
        }
    };
})