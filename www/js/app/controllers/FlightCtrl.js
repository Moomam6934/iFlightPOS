iFlight.controller('FlightCtrl', function($scope, $state, $timeout, $ionicLoading) {


    $scope.downloadOne = false;
    $scope.downloadTwo = false;
    $scope.successOne = false;
    $scope.successTwo = false;
    $scope.downloadding = false;

    $scope.loadCart = function() {
        $scope.cart = [{
            id: 1,
            flight: 'AK 6302',
            desc: 'Bangkok - Tokyo',
            type: 'out',
            cart: [{
                id: 1,
                name: 'Food'
            }, {
                id: 2,
                name: 'Food'
            }, {
                id: 3,
                name: 'Duty Free'
            }, {
                id: 4,
                name: 'Duty Free'
            }]
        }, {
            id: 2,
            flight: 'AK 6304',
            desc: 'Tokyo - Bangkok',
            type: 'in',
            cart: [{
                id: 1,
                name: 'Food-2'
            }, {
                id: 2,
                name: 'Food-2'
            }, {
                id: 3,
                name: 'Duty Free-2'
            }, {
                id: 4,
                name: 'Duty Free-2'
            }]
        }]

        $scope.pic = '';
        for (var i = 0; i < $scope.cart.length; i++) {
            if ($scope.cart[i].type == 'out') {
                $scope.cart[i].pic = 'img/takeoff.png';
            } else {
                $scope.cart[i].pic = 'img/landing.png';
            };
        };
        $ionicLoading.hide();
    }


    $scope.gotoSelectCart = function() {
        $scope.downloadding = true;
        $scope.downloadOne = true;
        $scope.downloadTwo = true;
        $timeout(function() {
            $scope.successOne = true;
            $scope.downloadOne = false;
        }, 1000)
        $timeout(function() {
            $scope.successTwo = true;
            $scope.downloadTwo = false;
            $ionicLoading.show({
                noBackdrop: false,
                template: '<ion-spinner icon="ios" class="spinner-back"></ion-spinner>',

            });
        }, 2000)
        $timeout(function() {
            $state.go('select-cart');
            $scope.download = false;
            $timeout(function() {
                $scope.downloadding = false;
            }, 1000)
        }, 3000)
    }

    $scope.var = 1;
    $scope.click = function(num) {
        $scope.var = num;
    }

    $scope.startShop = function() {
        $ionicLoading.show({
            noBackdrop: false,
            template: '<ion-spinner icon="ios" class="spinner-back"></ion-spinner>',

        });

        $state.go('app.shop');
    }

})
