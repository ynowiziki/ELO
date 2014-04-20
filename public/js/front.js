var app = angular.module('app', ['ngResource', 'ui.bootstrap']);
app.config(['$routeProvider', '$locationProvider', '$httpProvider',
    function($routeProvider, $locationProvider, $httpProvider){
        $routeProvider
            .when('/',{
                templateUrl: '/partial/comment.html',      //root path
                controller: 'commentCtrl'
            })
            .when('/editUser',{                            //user profile
                templateUrl:'/partial/editUser.html'
            })
            .when('/p2p', {
                templateUrl: '/partial/peer.html',
                controller: 'peerCtrl'
            })
            .when('/login', {
                templateUrl: '/partial/login.html',
                controller: 'loginCtrl'
            })
            .when('/reset/:id',{
                templateUrl: 'partial/reset.html',
                controller: 'resetCtrl'
            })
            .otherwise({
                templateUrl:'/partial/404.html'            //other path
            });
        $locationProvider.html5Mode(true);
        var interceptor = ['$location', '$rootScope', '$q', function($location, $rootScope, $q) {
            function success(response) {
                    return response;
            }

            function error(response) {
                var status = response.status;
                if (status === 401){
                    if($location.path()!='/login') {     //not logged in
                        $rootScope.savePath = $location.path();   //save current path for reloading after logged in
                    }
                    $location.path("/login");
                    return response;
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
//  TODO: prompt progress of long processes
    });

}]);


app.controller('loginCtrl',function($scope, $resource, $location, $rootScope) {
    $scope.user = {};
    $scope.info = {};
    $scope.showLogin = true;
    $scope.login = function(){
        $scope.info = {};
        if($scope.user.email && $scope.user.password){
            $scope.loading = "fa fa-spinner fa-spin fa-3x";
            $resource('/login').save($scope.user, function(result){
                if(result && result.success){
                    $rootScope.user = result.user;
                    if($rootScope.savePath != '/login'){
                        var savePath = $rootScope.savePath;
                        $rootScope.savePath = '';
                        $location.path(savePath);
                    }
                    else{
                        $location.path('/');
                    }
                }
                else{
                    $scope.info = {status: 'Incorrect email or password.'};
                }
                $scope.loading = "";
            });
        }
        else{
            $scope.info = {status: 'Invalid email or password.'};
        }
    };
    $scope.reset = function(){
        $scope.info = {};
        if($scope.user.email){
            $scope.loading = "fa fa-spinner fa-spin fa-3x";
            $resource('/forget/'+$scope.user.email).get(function(result){
                $scope.info = result;
                $scope.loading = "";
            });
        }
        else{
            $scope.info = {status: 'Email address can not be blank.'};
            $scope.loading = "";
        }
    };
    $scope.signOn = function(){
        $scope.info = {};
        if($scope.user.email){
            $scope.loading = "fa fa-spinner fa-spin fa-3x";
            $resource('/signOn').save($scope.user, function(result){
                if(result.status == 'exist'){
                    $scope.toggleLogin();
                    result.status = 'User ' + $scope.user.email + ' already exists.'
                }
                $scope.info = result;
                $scope.loading = "";
            });
        }
        else{
            $scope.info = {status: 'email address can not be blank.'};
        }
    };
    $scope.toggleLogin = function() {
        $scope.info = {};
        $scope.showLogin = !$scope.showLogin;
        $scope.effect = 'flipInY animated';
        if($scope.showLogin) {
            document.getElementById("userEmail").required = true;
            document.getElementById("userPassword").required = true;
            document.getElementById("newUserNick").required = false;
            document.getElementById("newUserEmail").required = false;
            document.getElementById("newUserPassword").required = false;
        }
        else{
            document.getElementById("userEmail").required = false;
            document.getElementById("userPassword").required = false;
            document.getElementById("newUserNick").required = true;
            document.getElementById("newUserEmail").required = true;
            document.getElementById("newUserPassword").required = true;
        }
    };
});
app.controller('resetCtrl',function($scope, $resource, $routeParams) {
    $scope.submit = function(){
        if($scope.password){
            $scope.info = $resource('/reset/'+$routeParams.id).save($scope.password);
        }
    };
});
//I wrote this manual control of collapse nav-bar in a kind of hack way, because I really don't want to import jQuery
app.controller('menuCtrl',function($scope) {
    $scope.in = ''                       //this is the class for the collapsed menu items
    $scope.toggleCollapsed = function(){
        if($scope.in == ''){
            $scope.in = 'in'             //switch open/close
        }
        else {
            $scope.in = ''
        }
    }
});
app.controller('userCtrl', function($scope, $resource, $location, imageResizeService, $rootScope){
    var userProfile = {};
    $rootScope.spin = "fa-spin";
    $scope.selectFile = function(element) {    //select image files within the photos directory
        var file = element.files[0];
        imageResizeService.resize(file, function(canvas){
            $scope.user.img = canvas.toDataURL("image/jpeg");        //display user avatar stored in database
            userProfile.img =  $scope.user.img;
            $scope.$apply();
        });
    };
    $scope.saveUserInfo = function(){
        $scope.result = {};
        if($scope.user.nick){
            userProfile.nick = $scope.user.nick;
            userProfile.gender = $scope.user.gender;
            userProfile.intro = $scope.user.intro;
            $scope.result = $resource('/saveUser').save(userProfile, function(){
                $resource('/userInfo').get(function(user){           //reload user profile when it's updated
                    $rootScope.user = user;
                });
            });
            $rootScope.spin = "";
        }
        else{
            $scope.result = {status : 'no nick name'};
        }
    };
});
app.controller('commentCtrl', function($scope, $resource, $location, $rootScope){
    $scope.cmt = {};

    if(document.getElementById("speak").webkitSpeech === undefined) {          //information about browser
        $scope.source = "ERROR: Speech input is not supported in your browser, please use Chrome.";
        $scope.messageType = "danger";                                         //speech recognition not supported
        $scope.webkitSpeech = false;
    }
    else {
        $scope.source ="be who you are and say what you feel";
        $scope.messageType = "success";                                        //speech recognition supported
        $scope.webkitSpeech = true;
    }

    $scope.$watch('speak', function () {           //catch any change to the speech recognition input
        if($scope.speak == $scope.source){
            $scope.equal =  'right!';              //matched
        }
        else {
            $scope.equal =  'try again!';
        }
    });
    if(! $rootScope.user) {
        $resource('/userInfo').get(function(user){ //load user profile when user refreshes the home page
            $rootScope.user = user;
        });
    }
    $scope.loading = "fa fa-spinner fa-spin fa-3x";
    $scope.comments = $resource('/listComments').query(function() {
        $scope.loading = "";                                           //load all the comments
    });

    $scope.submit = function(){
        if($scope.cmt.nick && $scope.cmt.content){
            $scope.loading = "fa fa-spinner fa-spin fa-3x";
            $scope.result = $resource('/saveComment').save($scope.cmt, function(){
                $scope.comments = $resource('/listComments').query(function() {
                    $scope.loading = "";                              //list all the comments after comment being saved
                });
            });
        }
        else{
            $scope.result = {status: 'Error: Incomplete Comment.'};
        }
    };
});
//use simpleWebRTC (https://github.com/henrikjoreteg/SimpleWebRTC ) to provide P2P video chat
app.controller('peerCtrl', function($scope, $location){
    $scope.join = function(){
        if($scope.topic){
            if(! $scope.webrtc) {
                $scope.webrtc = new SimpleWebRTC({
                    // the id/element dom element that will hold "our" video
                    localVideoEl: 'localVideo',
                    // the id/element dom element that will hold remote videos
                    remoteVideosEl: 'remoteVideos',
                    // immediately ask for camera access
                    autoRequestMedia: true
                });
            }
            $scope.webrtc.on('readyToCall', function () {
                // you can name it anything
                $scope.webrtc.joinRoom($scope.topic);
            });
        }
    }

    $scope.quit = function(){
        $scope.webrtc.stopLocalVideo();
        $scope.webrtc.leaveRoom();
        $location.path("/");
    }
});
