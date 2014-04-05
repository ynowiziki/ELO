
var app = angular.module('app', ['ngResource', 'ui.bootstrap']);
console.log('front now take control');
app.config(['$routeProvider', '$locationProvider', '$httpProvider',
    function($routeProvider, $locationProvider, $httpProvider){
        $routeProvider
            .when('/',{
                templateUrl: '/partial/authed.html',
                controller: 'authedCtrl'
            })
            .when('/login',{
                templateUrl: '/partial/login.html',
                controller: 'LoginCtrl'
            })
            .when('/401',
            {
                templateUrl:'/partial/login.html'
            })
            .otherwise({
                redirectTo: function(routerParams, path){
                    console.log('redirecting to ...' + path);
                    console.log(routerParams);
                    console.log(path);
                    return path ;
                }
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
                    console.log('>>>>>>>>>>>>>>>>>>>>');
                    console.log($rootScope.savePath);
                    $location.path('/401');
                    return;
                }
                else if (status === 403) {
                    $location.path("/forbidden");
                    return;
                }
                else if (status === 404) {
                    $location.path("/404");
                    return;
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
        console.log('===================== route change ==============');
        console.log(event);
        console.log(next);
        console.log(current);
        console.log('===================== end ==============');
    });

}]);

app.controller('authedCtrl', function($scope, $resource){
    console.log('authed ctroller');
    $scope.test = $resource('/test').get();
}) ;

