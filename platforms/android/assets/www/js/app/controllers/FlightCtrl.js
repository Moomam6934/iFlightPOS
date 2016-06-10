iFlight.controller('FlightCtrl', function($scope, $state, $timeout) {


    $scope.downloadOne = false;
    $scope.downloadTwo = false;
    $scope.successOne = false;
    $scope.successTwo = false;

    $scope.cart = [{
        id: 1,
        flight: 'AK 6302',
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

    $scope.gotoSelectCart = function() {
        $scope.downloadOne = true;
        $scope.downloadTwo = true;
        $timeout(function() {
            $scope.successOne = true;
            $scope.downloadOne = false;
        }, 1000)
        $timeout(function() {
            $scope.successTwo = true;
            $scope.downloadTwo = false;
        }, 2000)
        $timeout(function() {
            $state.go('cart');
            $scope.download = false;
        }, 3000)
    }

    $scope.var = 1;
    $scope.click = function(num) {
        $scope.var = num;
    }

})
