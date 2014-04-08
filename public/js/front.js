
var app = angular.module('app', ['ngResource', 'ui.bootstrap']);
app.config(['$routeProvider', '$locationProvider', '$httpProvider',
    function($routeProvider, $locationProvider, $httpProvider){
        $routeProvider
            .when('/',{
                templateUrl: '/partial/authed.html',
                controller: 'authedCtrl'
            })
            .when('/401',
            {
//                templateUrl:'/partial/login.html',
                controller: 'signOnCtrl'
            })
            .otherwise({
                templateUrl:'/partial/404.html'
            });
        $locationProvider.html5Mode(true);
        var interceptor = ['$location', '$rootScope', '$q', function($location, $rootScope, $q) {
            function success(response) {
                $rootScope.signOn = false;
                return response;
            }

            function error(response) {
                var status = response.status;
                if (status === 401  && $location.path()!='/401') {
                    $rootScope.savePath = $location.path();   //save current path for reloading after logged in
                    $rootScope.signOn = true;
//                    $location.path('/401');
//                    document.getElementById('signOnModal').modal('show');
//                    return;
                }
                else if (status === 500) {
                    $rootScope.signOn = true;
                    $location.path("/");
//                    return;
                }
                else if (status === 404) {
                    $location.path("/404");
//                    return;
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
    $rootScope.signOn = false;
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        console.log('===================== route change ==============');
        console.log(event);
        console.log(next);
        console.log(current);
        console.log('===================== end ==============');
    });

}]);

app.controller('authedCtrl', function($scope, $resource){
    $scope.user = $resource('/userInfo').get();
    $scope.comments = $resource('/listComments').query(function() {
        $scope.sort("date");
    });
    $scope.submit = function(){
        $scope.result = {};
        if($scope.comment.nick && $scope.comment.content){
            $scope.result = $resource('/saveComment').save($scope.comment, function(){
                $scope.comments = $resource('/listComments').query(function() {

                });
            });
        }
        else{
            $scope.result = {status: 'Error: Incomplete Comment.'};
        }
    };
});

