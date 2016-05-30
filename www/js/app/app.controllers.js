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

    $scope.order = [];

    $scope.product = $stateParams.data;
    $scope.order = $stateParams.orders;
    $scope.products_all = $stateParams.product_data.data;
    $scope.qty = $scope.product.qty;
    $scope.isSelected = $stateParams.isSelected;
    var quantity;
    $scope.checkoutProductData = function() {

        var getOrderTemporary = ShopService.getOrderTemporary();
        if (getOrderTemporary) {
            var productBy = $filter('filter')(getOrderTemporary.products, function(data) {
                return data.products_id === $scope.product.products_id;
            })
            if (productBy.length > 0) {
                $scope.qty = productBy[0].qty;
                $scope.product = productBy[0];
            }
        }

    }
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

        var checkByID = $filter('filter')($scope.order, function(dataByID) {
            return dataByID.products_id === $scope.product.products_id;
        })
        if (checkByID.length == 0) {
            $scope.order.push($scope.product);
        }


        for (var i = $scope.order.length - 1; i >= 0; i--) {
            if ($scope.order[i].products_id == $scope.product.products_id) {
                $scope.order[i].qty = $scope.qty;
                $scope.order[i].total_qty = quantity - $scope.qty;
                break;
            }
        }

        ShopService.setOrderTemporary($scope.order);
        $state.go('app.shop');

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
    $scope.remove = function(product) {
        ShopService.removeProduct(product);
        $state.go('app.shop');
    }
})

.controller('ShopCtrl', function($scope, ShopService, $ionicActionSheet, $timeout, $ionicPopover, $state, $filter, $stateParams, $ionicPopup) {


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
        status: ''
    }

    $scope.products = [];
    $scope.popular_products = [];
    $scope.orders = [];
    $scope.productsByCart;
    $scope.isSelected = [];


    $scope.$watch('iFlightData.products', function(o, n) {
        var total_gross_amount = 0;
        var gross_amount = 0;
        for (var i = $scope.iFlightData.products.length - 1; i >= 0; i--) {
            total_gross_amount += $scope.iFlightData.products[i].price * $scope.iFlightData.products[i].qty;
            gross_amount = $scope.iFlightData.products[i].price * $scope.iFlightData.products[i].qty;
            $scope.iFlightData.products[i].gross_amount = gross_amount;
        };
        $scope.iFlightData.total_gross_amount = total_gross_amount
    }, true);

    function getDataProduct() {

        var products = ShopService.getProducts();

        $scope.products.data = products.cart;
        $scope.products.defaults = $scope.products.data[0].class;
        $scope.productsByCart = $scope.products.data[0].products;


    }

    $scope.onSelect = function(item) {
        var productsByCart = $filter('filter')($scope.products.data, function(data) {
            return data.class === item.class;
        })
        $scope.productsByCart = productsByCart[0].products;
    }

    function loopCountData(data1, data2) {
        for (var i = data1.length - 1; i >= 0; i--) {
            for (var ii = data1[i].products.length - 1; ii >= 0; ii--) {
                for (var iii = data2.length - 1; iii >= 0; iii--) {
                    if (data2[iii].products_id === data1[i].products[ii].products_id) {
                        data1[i].products[ii].total_qty = data2[iii].total_qty
                    }
                };

            };

        };
    }

    $scope.loadData = function() {
        var orderTemporary = ShopService.getOrderTemporary();
        if (orderTemporary != null) {
            getDataProduct();
            $scope.iFlightData = orderTemporary;
            for (var i = orderTemporary.products.length - 1; i >= 0; i--) {
                if ($scope.isSelected.indexOf(orderTemporary.products[i].products_id) == -1) {
                    $scope.isSelected.push(orderTemporary.products[i].products_id);
                }
            };

            loopCountData($scope.products.data, $scope.iFlightData.products);

        } else {
            getDataProduct();
            $scope.iFlightData.products = [];
            $scope.isSelected = [];
        }

    }

    $scope.select_item = function(product) {

        var count = 1;
        var countNull = 0;

        if (product.total_qty > 0) {
            if ($scope.iFlightData.products.length != 0) {
                var chk = $filter('filter')($scope.iFlightData.products, function(item) {
                    return item.products_id === product.products_id;
                })
                if (chk.length > 0) {
                    chk[0].qty = chk[0].qty + count;
                    countDown(product);
                } else {
                    product.qty = count;
                    $scope.iFlightData.products.push(product);
                    var addCheck = $filter('filter')($scope.productsByCart, function(item) {
                        return item.products_id === product.products_id;
                    })
                    $scope.isSelected.push(addCheck[0].products_id);
                    countDown(product);
                }
            } else {
                product.qty = count;
                $scope.iFlightData.products.push(product);
                var addCheck = $filter('filter')($scope.productsByCart, function(item) {
                    return item.products_id === product.products_id;
                })
                $scope.isSelected.push(addCheck[0].products_id);
                countDown(product);
            }

            ShopService.setOrderTemporary($scope.iFlightData);
        } else {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Sold Out',
                template: '<div class="text-center">Do you want to keep data ?</div>'
            });

            confirmPopup.then(function(res) {
                if (res) {
                    console.log('You are sure');

                } else {
                    console.log('You are not sure');
                }
            });
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
            var ckeckStock = ShopService.getProducts();
            var e = [];
            for (var i = ckeckStock.cart.length - 1; i >= 0; i--) {
                var checked = $filter('filter')(ckeckStock.cart[i].products, function(data) {
                    return data.products_id === product.products_id;
                })
                if (checked.length > 0) {
                    e = checked[0];
                    break;
                }
            };
            if (e.total_qty != 0) {
                $state.go('app.product-detail', {
                    data: product,
                    orders: $scope.iFlightData.products,
                    product_data: $scope.products,
                    isSelected: $scope.isSelected
                });
            }

        }
        // Triggered on a button click, or some other target
    $scope.showActionSheet = function() {

        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                { text: 'Keep' },
                { text: 'Discard' },
                { text: 'Clear Orders' }
            ],
            titleText: 'Discard Order ?',
            cancelText: '<span class="test">Cancel</span>',
            cancel: function() {},
            buttonClicked: function(index) {
                switch (index) {
                    case 0:
                        ShopService.setOrdersKeep($scope.iFlightData);
                        $state.go('app.main.all');
                    case 1:
                        ShopService.clearOrderTemporary();
                        $state.go('app.main.all');
                    case 2:
                        ShopService.clearOrderTemporary();
                        $scope.loadData();
                }
            }
        });

    };

    $scope.checkoutProduct = function(iFlightData) {
        ShopService.setOrderTemporary(iFlightData);
        $state.go('app.cart', { iFlightData: iFlightData });
    }

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

.controller('PaymentCtrl', function($scope, $ionicModal, $state, $ionicPopup, PaymentService, $stateParams, ShopService, $filter) {



    $scope.iFlightData = ShopService.getOrderTemporary();
    $scope.calculatorTotal = $stateParams.iFlightData.total_gross_amount;

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
        var result = 0;
        for (var i = $scope.payments.length - 1; i >= 0; i--) {
            if ($scope.payments[i].amount != null) {
                result += $scope.payments[i].amount;
            }
        };
        if (result > $scope.iFlightData.total_gross_amount) {
            $scope.changemoney = Math.abs($scope.iFlightData.total_gross_amount - result);
            $scope.calculatorTotal = 0;
        } else {
            $scope.calculatorTotal = $scope.iFlightData.total_gross_amount - result;
            $scope.changemoney = 0;
        }
        $scope.iFlightData.sold_total = result;
        $scope.iFlightData.change = $scope.changemoney;
        $scope.iFlightData.payments = $scope.payments;

    }, true);
    $scope.removePayment = function(index) {
        $scope.payments.splice(index, 1);
    }

    $scope.comfirmPayment = function() {
        console.log($scope.iFlightData);

        var confirmPopup = $ionicPopup.confirm({
            title: 'Confirm',
            template: 'Are you sure you want to continue ?'
        });

        confirmPopup.then(function(res) {
            if (res) {
                console.log('You are sure');
                ShopService.setOrdersSuccess($scope.iFlightData);
                $state.go('receipt', { id: $scope.iFlightData.receipt_number });
            } else {
                console.log('You are not sure');
            }
        });

    }

    $scope.$watch('iFlightData.products', function(n, o) {

        var getStock = ShopService.getProducts();
        var res_total_gross_amount = 0;
        for (var i = 0; i < getStock.cart.length; i++) {
            for (var ii = getStock.cart[i].products.length - 1; ii >= 0; ii--) {
                for (var iii = $scope.iFlightData.products.length - 1; iii >= 0; iii--) {
                    if (getStock.cart[i].products[ii].products_id === n[iii].products_id) {
                        $scope.iFlightData.products[iii].total_qty = getStock.cart[i].products[ii].total_qty - parseInt(n[iii].qty);
                        $scope.iFlightData.products[iii].gross_amount = parseInt(n[iii].qty) * n[iii].price;
                        res_total_gross_amount += $scope.iFlightData.products[iii].gross_amount;

                    }
                };
            };
        }
        $scope.iFlightData.total_gross_amount = res_total_gross_amount;
        ShopService.setOrderTemporary($scope.iFlightData);


    }, true);

    $scope.ranges = function(id) {

        var getStock = ShopService.getProducts();
        var ratings = [];


        for (var i = 0; i < getStock.cart.length; i++) {
            for (var ii = getStock.cart[i].products.length - 1; ii >= 0; ii--) {
                if (getStock.cart[i].products[ii].products_id === id) {
                    inStock = getStock.cart[i].products[ii].total_qty;
                }
            };

        }

        for (var i = 0; i < inStock; i++) {
            ratings.push(i + 1)
        }

        return ratings;
    }
    $scope.remove = function(product) {
        ShopService.removeProduct(product);
        $scope.iFlightData = ShopService.getOrderTemporary();
    }

})

.controller('MainCtrl', function($scope, $state, ShopService, $ionicPopup) {

    $scope.loadOrders = function() {
        $scope.orders = ShopService.getOrders().orders;
    }

    $scope.removeOrder = function(order) { 

        if (order.status === 'sold') {
            $scope.securityCode;
            var myPopup = $ionicPopup.show({
                template: '<input type="number" ng-model="securityCode" style="text-align:right;">',
                title: 'Enter Your Security Code.',
                subTitle: '',
                scope: $scope,
                buttons: [{
                    text: 'Cancel',
                    onTap: function(e) {

                    }
                }, {
                    text: '<b>Confirm</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        ShopService.setOrdersVold(order);
                        $scope.loadOrders();
                    }
                }]
            })
        } else if (order.status === 'void') {
            // ShopService.removeOrder(order);
        } else {
            ShopService.removeOrder(order);
        } 
        $scope.loadOrders();
    }

})


.controller('AdjustCtrl', function($scope, AdjustService, $state, $stateParams, $ionicPopover, $filter, ShopService) {
    $scope.detail = $stateParams.data;

    $scope.adjustsList = AdjustService.getadjust();
    $scope.res = {};
    $scope.cart;


    AdjustService.getProducts().then(function(products) {

        $scope.products = products.cart[0].products;
        $scope.res.data = products.cart;
    });

    $scope.click = function(product) {

        var click = 1;
        $state.go('app.adjustdetail', {
            data: product,
        });

    }

    $scope.onSelect = function(item) {
        var productsByCart = $filter('filter')($scope.res.data, function(data) {
            return data.class === item.class;
        })
        $scope.products = productsByCart[0].products;
    }


    /////////////////////addItem//////////////////////////
    $scope.adjusts = {};
    $scope.aadAdjust = function() {

        $scope.detail.adjustmeny = $scope.adjusts;
        AdjustService.setOrderAdjust($scope.detail);
        $scope.detail = null;
        $state.go('app.orderadjust');
        $scope.adjustsList = AdjustService.getadjust();
    }
    $scope.removeAdj = function(id) {
        AdjustService.removeAdjust(id);
        $scope.adjustsList = AdjustService.getadjust();

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



})

.controller('ReceiptCtrl', function($scope, $stateParams, $filter, ShopService, $state) {

    var orderId = $stateParams.id;
    var getOrdersData = ShopService.getProducts();

    var filterOrderByID = $filter('filter')(getOrdersData.orders, function(order) {
        return order.receipt_number === orderId;
    })
    console.log(filterOrderByID[0]);

    $scope.receiptDetail = filterOrderByID[0];

    $scope.totalCash = 0;
    $scope.totalCredit = 0;
    $scope.subTotalUnit = 0;
    $scope.totalCredit = [];

    for (var i = filterOrderByID[0].payments.length - 1; i >= 0; i--) {
        if (filterOrderByID[0].payments[i].type == 'Cash') {
            $scope.totalCash += filterOrderByID[0].payments[i].amount;
        } else {
            // $scope.totalCredit += filterOrderByID[0].payments[i].amount;
            var card = filterOrderByID[0].payments[i].currency.card_id.toString();
            var subCard = card.substring(12, 16);
            var credit = {
                no: subCard,
                amount: filterOrderByID[0].payments[i].amount
            }
            $scope.totalCredit.push(credit)
        }
    };
    for (var i = filterOrderByID[0].products.length - 1; i >= 0; i--) {

        $scope.subTotalUnit += filterOrderByID[0].products[i].qty;
    };

    $scope.print = function() {
        $state.go('app.main.all');
    }

})
