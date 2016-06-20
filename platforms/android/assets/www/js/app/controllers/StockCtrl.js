iFlight.controller('StockCtrl', function($scope, $state, $timeout, $ionicLoading, $stateParams, ShopService) {

    var data_to_stock = $stateParams.data;

    $scope.loadCart = function() {
        $scope.cart = [{
            id: 1,
            flight: 'AK 6302',
            desc: 'Bangkok - Tokyo',
            type: 'out',
            cart: [{
                id: 1,
                name: 'Food 6302'
            }, {
                id: 2,
                name: 'Food 6302'
            }, {
                id: 3,
                name: 'Duty Free 6302'
            }, {
                id: 4,
                name: 'Duty Free 6302'
            }]
        }, {
            id: 2,
            flight: 'AK 6304',
            desc: 'Tokyo - Bangkok',
            type: 'in',
            cart: [{
                id: 1,
                name: 'Food 6304'
            }, {
                id: 2,
                name: 'Food 6304'
            }, {
                id: 3,
                name: 'Duty Free 6304'
            }, {
                id: 4,
                name: 'Duty Free 6304'
            }]
        }, {
            id: 3,
            flight: 'AK 6401',
            desc: 'Narita - Bangkok',
            type: 'in',
            cart: [{
                id: 1,
                name: 'Food 6401'
            }, {
                id: 2,
                name: 'Food 6401'
            }, {
                id: 3,
                name: 'Duty Free 6401'
            }, {
                id: 4,
                name: 'Duty Free 6401'
            }]
        }, {
            id: 4,
            flight: 'AK 6405',
            desc: 'Bangkok - Narita',
            type: 'out',
            cart: [{
                id: 1,
                name: 'Food 6405'
            }, {
                id: 2,
                name: 'Food 6405'
            }, {
                id: 3,
                name: 'Duty Free 6405'
            }, {
                id: 4,
                name: 'Duty Free 6405'
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

    $scope.loadCartByFlight = function() {
        $scope.cartByFlight = [{
            id: 1,
            flight: 'AK 6302',
            desc: 'Bangkok - Tokyo',
            type: 'out',
            cart: [{
                id: 1,
                name: 'Food 6302'
            }, {
                id: 2,
                name: 'Food 6302'
            }, {
                id: 3,
                name: 'Duty Free 6302'
            }, {
                id: 4,
                name: 'Duty Free 6302'
            }]
        }]
    }

    $scope.checkStock = function(flight, name) {

        var data = {
            flight: flight,
            name: name
        }

        $state.go('stock-report', { data: data })

    }

    $scope.checkStockByflight = function(flight, name) {

        var data = {
            flight: flight,
            name: name
        }

        $state.go('stock-report-by-flight', { data: data })

    }

    $scope.getStock = function() {
        $scope.data = data_to_stock;
        $scope.products = [];
        var products = ShopService.getProducts();
        // $scope.products = $scope.res.data[0].products;

        for (var i = products.length - 1; i >= 0; i--) {
            for (var ii = products[i].products.length - 1; ii >= 0; ii--) {
                $scope.products.push(products[i].products[ii]);

            };

        };
    }

})
