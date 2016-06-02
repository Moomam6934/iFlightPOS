angular.module('iFlightPOS.auth.controllers', [])

.controller('AuthCtrl', function($scope) {

})

.controller('WelcomeCtrl', function($scope, $ionicModal, show_hidden_actions, $state) {

    $scope.show_hidden_actions = show_hidden_actions;

    $scope.toggleHiddenActions = function() {
        $scope.show_hidden_actions = !$scope.show_hidden_actions;
    };

    $scope.facebookSignIn = function() {
        console.log("doing facebbok sign in");
        $state.go('app.main.all');
    };

    $scope.googleSignIn = function() {
        console.log("doing google sign in");
        $state.go('app.menushop');
    };

    $scope.twitterSignIn = function() {
        console.log("doing twitter sign in");
        $state.go('app.main.all');
    };
    
})

.controller('LogInCtrl', function($scope, $state) {
    $scope.doLogIn = function() {
        console.log("doing log in");
        $state.go('app.main.all');
    };
})

.controller('SignUpCtrl', function($scope, $state) {
    $scope.doSignUp = function() {
        console.log("doing sign up");
        $state.go('app.main.all');
    };
})

.controller('ForgotPasswordCtrl', function($scope, $state) {
    $scope.requestNewPassword = function() {
        console.log("requesting new password");
        $state.go('app.main.all');
    };
})

;
