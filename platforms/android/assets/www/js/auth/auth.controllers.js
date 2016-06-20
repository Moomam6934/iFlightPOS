angular.module('iFlightPOS.auth.controllers', [])

.controller('AuthCtrl', function($scope) {

})

.controller('WelcomeCtrl', function($scope, $ionicModal, show_hidden_actions, $state, $ionicHistory, $ionicLoading, $timeout) {

    $scope.show_hidden_actions = show_hidden_actions;

    $ionicHistory.nextViewOptions({
        disableAnimate: true
    });

    $scope.hideLoginTrue = false;

    $scope.toggleHiddenActions = function() {
        $scope.show_hidden_actions = !$scope.show_hidden_actions;
    };

    $scope.facebookSignIn = function() {
        console.log("doing facebbok sign in");
        $state.go('auth.user');
    };

    $scope.googleSignIn = function() {
        $scope.hideLoginTrue = true;
        $timeout(function() {
            console.log("doing google sign in");
            $state.go('auth.user');
        }, 1500);

    };

    $scope.twitterSignIn = function() {
        console.log("doing twitter sign in");
        $state.go('auth.user');
    };

})

.controller('UserCtrl', function($scope, $state) {

    $scope.chkPosotion = true;
    $scope.chk = function(p) {
        if (p != '') {
            $scope.chkPosotion = false;
        } else {
            $scope.chkPosotion = true;
        };
    }

    $scope.checkedSignIn = function(name, position) {
        console.log(name + ', ' + position);
        if (position != undefined && position != 'P12') {
            $state.go('select-cart');
        } else {
            $state.go('check-stock');
        };

    }
})

.controller('LogInCtrl', function($scope, $state) {
    $scope.doLogIn = function() {
        console.log("doing log in");
        $state.go('app.shop');
    };
})

.controller('SignUpCtrl', function($scope, $state) {
    $scope.doSignUp = function() {
        console.log("doing sign up");
        $state.go('app.shop');
    };
})

.controller('ForgotPasswordCtrl', function($scope, $state) {
    $scope.requestNewPassword = function() {
        console.log("requesting new password");
        $state.go('app.shop');
    };
})

;
