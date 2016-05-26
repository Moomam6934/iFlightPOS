angular.module('your_app_name.app.controllers', [])


.controller('AppCtrl', function($scope, AuthService) {

    //this will represent our logged user
    var user = {
        about: "Design Lead of Project Fi. Love adventures, green tea, and the color pink.",
        name: "Brynn Evans",
        picture: "https://s3.amazonaws.com/uifaces/faces/twitter/brynn/128.jpg",
        _id: 0,
        followers: 345,
        following: 58
    };

    //save our logged user on the localStorage
    AuthService.saveUser(user);
    $scope.loggedUser = user;
})


.controller('ProductCtrl', function($scope, $stateParams, ShopService, $ionicPopup, $ionicLoading, $state, $filter) {

    $scope.product = $stateParams.data;
    $scope.order = $stateParams.orders;
    $scope.products_all = $stateParams.product_data.data;
    $scope.qty = $scope.product.qty;
    $scope.isSelected = $stateParams.isSelected;
    var quantity;
    $scope.ranges = function(count) {

        var ratings = [];

        for (var i = 0; i < count; i++) {
            ratings.push(i + 1)
        }
        quantity = ratings.length;
        return ratings;
    }
    $scope.editProductQty = function(range) {
        $scope.qty = range;
    }
    $scope.gotoShop = function() {
        $scope.qty;

        for (var i = $scope.order.length - 1; i >= 0; i--) {
            if ($scope.order[i].products_id == $scope.product.products_id) {
                $scope.order[i].qty = $scope.qty;
                break;
            }
        }
        for (var i = $scope.products_all.length - 1; i >= 0; i--) {
            if ($scope.products_all[i]) {
                for (var ii = $scope.products_all[i].products.length - 1; ii >= 0; ii--) {
                    if ($scope.products_all[i].products[ii].products_id === $scope.product.products_id) {
                        $scope.products_all[i].products[ii].total_qty = quantity - $scope.qty;
                        break;
                    }
                }
            }
        };
        $scope.isSelected.push($scope.product.products_id);
        $state.go('app.shop', {
            product_by_qty: $scope.order,
            isSelected: $scope.isSelected,
            products_all: $scope.products_all
        });
    }
    $scope.showAddToCartPopup = function(product) {
        $scope.data = {};
        $scope.data.product = product;
        $scope.data.productOption = 1;
        $scope.data.productQuantity = 1;

        var myPopup = $ionicPopup.show({
            cssClass: 'add-to-cart-popup',
            templateUrl: 'views/app/shop/partials/add-to-cart-popup.html',
            title: 'Add to Cart',
            scope: $scope,
            buttons: [
                { text: '', type: 'close-popup ion-ios-close-outline' }, {
                    text: 'Add to cart',
                    onTap: function(e) {
                        return $scope.data;
                    }
                }
            ]
        });
        myPopup.then(function(res) {
            if (res) {
                $ionicLoading.show({ template: '<ion-spinner icon="ios"></ion-spinner><p style="margin: 5px 0 0 0;">Adding to cart</p>', duration: 1000 });
                ShopService.addProductToCart(res.product);
                console.log('Item added to cart!', res);
            } else {
                console.log('Popup closed');
            }
        });
    };
})

.controller('ShopCtrl', function($scope, ShopService, $ionicActionSheet, $timeout, $ionicPopover, $filter, $state, $filter, $stateParams) {


    $scope.iFlightData = {
        id: null,
        receipt_number: null,
        date: new Date(),
        products: [],
        total_gross_amount: 0,
        total_discount: 0,
        total_net_amount: 0,
        payments: [],
        payment_date: new Date(),
        seller_user: "Nuttakrittra Phumsawai",
        status: "keep"
    }

    $scope.products = [];
    $scope.popular_products = [];
    $scope.orders = [];
    $scope.ordersQty = $stateParams.product_by_qty;
    $scope.productsByCart;

    $scope.isSelected = [];
    // $scope.$watch('orders', function(o, n) {

    //     var amt = 0;
    //     var disc = 0;
    //     var netamt = 0;

    //     for (var i = $scope.invoice.detail.length - 1; i >= 0; i--) {
    //         $scope.invoice.detail[i].total = o[i].product.price * o[i].count;
    //         amt += o[i].product.price * o[i].count;
    //         disc += o[i].discount;
    //         netamt = amt - disc;
    //     };
    //     $scope.invoice.price = amt;
    //     $scope.invoice.discount = disc;
    //     $scope.invoice.total = netamt;
    // }, true);

    function getDataProduct() {
        ShopService.getProducts().then(function(products) {

            $scope.products.data = products;
            $scope.products.defaults = $scope.products.data[0].class;
            $scope.productsByCart = $scope.products.data[0].products;

        });
    }

    $scope.onSelect = function(item) {
        var productsByCart = $filter('filter')($scope.products.data, function(data) {
            return data.class === item.class;
        })
        $scope.productsByCart = productsByCart[0].products;
    }

    ShopService.getProducts().then(function(products) {
        $scope.popular_products = products.slice(0, 2);
    });

    $scope.loadData = function() {

        if ($stateParams.product_by_qty == null) {
            getDataProduct();
            $scope.orders = [];
            $scope.isSelected = [];
        } else {
            $scope.isSelected = $stateParams.isSelected;
            $scope.orders = $scope.ordersQty;
            $scope.products.data = $stateParams.products_all;
            $scope.productsByCart = $scope.products.data[0].products;
        }
    }

    $scope.select_item = function(product, isHold) {

        var count = 1;
        var countNull = 0;
        if ($scope.orders.length != 0 && isHold != 1) {
            var chk = $filter('filter')($scope.orders, function(item) {
                return item.products_id === product.products_id;
            })
            if (chk.length > 0) {
                chk[0].qty = chk[0].qty + count;
                countDown(product);
            } else {
                product.qty = count;
                $scope.orders.push(product);
                var addCheck = $filter('filter')($scope.productsByCart, function(item) {
                    return item.products_id === product.products_id;
                })
                $scope.isSelected.push(addCheck[0].products_id);
                countDown(product);
            }
        } else if (isHold == 1) {
            if (product.qty == null) {
                product.qty = count;
                $scope.isSelected.push(product.products_id);
                $scope.orders.push(product);
                countDown(product);
            }
        } else {
            product.qty = count;
            $scope.orders.push(product);
            var addCheck = $filter('filter')($scope.productsByCart, function(item) {
                return item.products_id === product.products_id;
            })
            $scope.isSelected.push(addCheck[0].products_id);
            countDown(product);
        }
    }

    function countDown(product) {
        for (var i = $scope.products.data.length - 1; i >= 0; i--) {
            if ($scope.products.data[i].products.indexOf(product) != -1) {
                $scope.products.data[i].products[$scope.products.data[i].products.indexOf(product)].total_qty -= 1;
                break;
            }
        };
    }
    $scope.onHold = function(product) {

            var isHold = 1;
            $scope.select_item(product, isHold);
            $state.go('app.product-detail', {
                data: product,
                orders: $scope.orders,
                product_data: $scope.products,
                isSelected: $scope.isSelected
            });

            // app.product-detail({productId: product._id})

        }
        // Triggered on a button click, or some other target
    $scope.showActionSheet = function() {

        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                { text: 'Keep' },
                { text: 'Discard' }
            ],
            titleText: 'Discard Order ?',
            cancelText: '<span class="test">Cancel</span>',
            cancel: function() {},
            buttonClicked: function(index) {
                switch (index) {
                    case 0:
                        var total_gross_amount = 0;
                        for (var i = $scope.orders.length - 1; i >= 0; i--) {
                            total_gross_amount += $scope.orders[i].price;
                        };
                        $scope.iFlightData.total_gross_amount = total_gross_amount
                        $scope.iFlightData.products = $scope.orders;
                        ShopService.setOrdersKeep($scope.iFlightData);
                        $scope.orders = [];
                        $scope.isSelected = [];
                        getDataProduct();
                        $state.go('app.main.all');
                        break;
                    case 1:
                        $state.go('app.main.all');
                        $scope.orders = [];
                        $scope.isSelected = [];
                        getDataProduct();
                        break;

                }
            }
        });

    };

})


.controller('ShoppingCartCtrl', function($scope, ShopService, $ionicActionSheet, _) {
    $scope.products = ShopService.getCartProducts();

    $scope.removeProductFromCart = function(product) {
        $ionicActionSheet.show({
            destructiveText: 'Remove from cart',
            cancelText: 'Cancel',
            cancel: function() {
                return true;
            },
            destructiveButtonClicked: function() {
                ShopService.removeProductFromCart(product);
                $scope.products = ShopService.getCartProducts();
                return true;
            }
        });
    };

    $scope.getSubtotal = function() {
        return _.reduce($scope.products, function(memo, product) {
            return memo + product.price;
        }, 0);
    };

})


.controller('CheckoutCtrl', function($scope) {
    //$scope.paymentDetails;
})

.controller('PaymentCtrl', function($scope, $ionicModal, $state, $ionicPopup, PaymentService) {

    $scope.currency = [];
    PaymentService.getCurrency().then(function(currency) {
        $scope.currency = currency;
    })

    $ionicModal.fromTemplateUrl('views/app/payment/type-of-payment.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.Type_of_Payment = modal;
    });

    $ionicModal.fromTemplateUrl('views/app/payment/currency.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.Payment = modal;
    });


    $scope.payments = [{
        id: 1,
        type: 'Cash',
        currency: {
            currencys: {},
            money: null,
            card_id: null,
            security: null,
            exp: null
        },
        amount: null

    }];


    $scope.itemTypePay;
    $scope.typePayment = ['Cash', 'Credit'];

    $scope.typeOfPayment = function(item) {
        $scope.Type_of_Payment.show();
        $scope.itemTypePay = item;
    }
    $scope.payment = function(typepayment, item) {
        $scope.Payment.show();
        $scope.itemTypePay = item;
    }
    $scope.addPayment = function() {
        var ids = $scope.payments.length + 1;
        $scope.payments.push({
            id: ids,
            type: 'Cash',
            currency: {
                currencys: {},
                money: null,
                card_id: null,
                security: null,
                exp: null
            },
            amount: null

        });

    }

    $scope.curren = function(currency) {
        $scope.itemTypePay.currency.currencys = currency;
        $scope.Payment.hide()
    }



    $scope.showPopup = function(item) {
        $scope.data = {};
        var myPopup = $ionicPopup.show({
            template: '<input type="number" ng-model="data.money" style="text-align:right;">',
            title: 'Enter Your Money',
            subTitle: '',
            scope: $scope,
            buttons: [{
                text: 'Cancel',
                onTap: function(e) {
                    $scope.data.money = item.currency.money;
                }
            }, {
                text: '<b>Confirm</b>',
                type: 'button-positive',
                onTap: function(e) {
                    item.currency.money = $scope.data.money;
                    $scope.data = {};
                }
            }]
        })
    }
    $scope.$watch('payments', function(n, o) {

        var res = 0;

        for (var i = $scope.payments.length - 1; i >= 0; i--) {
            if (n[i].currency.currencys.exchange != null) {
                res = n[i].currency.money * n[i].currency.currencys.exchange;
                n[i].amount = res;
            } else if (n[i].currency.card_id) {
                n[i].amount = n[i].currency.money;
            }
        };
    }, true);

})

.controller('MainCtrl', function($scope, $state, ShopService) {

    $scope.loadOrders = function() {
        $scope.orders = ShopService.getOrders().orders;
    }
})


.controller('AdjustCtrl', function($scope, AdjustService, $state, $stateParams,$ionicPopover,$filter) {
$scope.detail= $stateParams.data;
$scope.res = {};
    AdjustService.getProducts().then(function(products) {

        $scope.products = products.cart[0].products;
        $scope.res.data = products.cart;
    });

    $scope.click = function(product) {

        var click = 1;
        $state.go('app.adjustdetail', {
            data: product,
        });

        // app.product-detail({productId: product._id})

    }
$scope.onSelect = function(item) {
        var cart = $filter('filter')($scope.products.data, function(data) {
            return data.class === item.class;
        })
        // $scope.cart = cart[0].products;
    }


})

.controller('MasterCtrl', function($scope, $state, MasterService) {

    MasterService.getBlacklists().then(function(blacklists) {
        $scope.blacklists = blacklists;
    });

    MasterService.getPromotions().then(function(promotions) {
        $scope.promotions = promotions;
    });
    MasterService.getCurrency().then(function(currency) {
        $scope.currency = currency;
    });




});