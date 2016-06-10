angular.module('iFlightPOS.app.controllers', [])

.controller('AppCtrl', function($scope, $ionicSideMenuDelegate, ShopService, $state, $ionicModal) {
    $scope.keepOrders = [];
    $scope.$watch(function() {
            return $ionicSideMenuDelegate.isOpenLeft();
        },
        function(isOpen) {
            if (isOpen) {
                console.log("open");
                $scope.keep = ShopService.getOrdersKeep();

            }
        });

    $scope.receiptDetail = "";
    $scope.statusVoid = "";
    $ionicModal.fromTemplateUrl('views/app/payment/view-history.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.view_history = modal;
    });
    $scope.setKeepByOrder = function(id, status) {
        if (status == 'keep') {
            ShopService.setOrderTemporaryByKeep(id);
            $state.go('app.cart');
            $ionicSideMenuDelegate.toggleLeft(false);
        } else if (status == 'sold' || status == 'void') {
            $scope.statusVoid = status;
            $scope.receiptDetail = ShopService.getOrdersByID(id);
            $scope.view_history.show();
            $scope.totalCash = 0;
            $scope.totalCredit = 0;
            $scope.subTotalUnit = 0;
            $scope.totalCredit = [];

            for (var i = $scope.receiptDetail.payments.length - 1; i >= 0; i--) {
                if ($scope.receiptDetail.payments[i].type == 'Cash') {
                    $scope.totalCash += $scope.receiptDetail.payments[i].amount;
                } else {
                    // $scope.totalCredit += filterOrderByID[0].payments[i].amount;
                    var card = $scope.receiptDetail.payments[i].currency.card_id.toString();
                    var subCard = card.substring(12, 16);
                    var credit = {
                        no: subCard,
                        amount: $scope.receiptDetail.payments[i].amount
                    }
                    $scope.totalCredit.push(credit)
                }
            };
            for (var i = $scope.receiptDetail.products.length - 1; i >= 0; i--) {

                $scope.subTotalUnit += $scope.receiptDetail.products[i].qty;
            };
        }

    }
})

.controller('ProductCtrl', function($scope, $stateParams, ShopService, $ionicPopup, $ionicLoading, $state, $filter) {

    $scope.order = [];

    $scope.product = $stateParams.data;
    $scope.order = $stateParams.orders.products;
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

        ShopService.setOrderTemporary($stateParams.orders);
        $state.go('app.shop');

    }

    $scope.remove = function(product) {
        ShopService.removeProduct(product);
        $state.go('app.shop');
    }
})

.controller('ShopCtrl', function($scope, ShopService, $ionicActionSheet, $timeout, $ionicPopover, $state, $filter, $stateParams, $ionicPopup, $ionicSideMenuDelegate, $ionicSlideBoxDelegate, $ionicLoading) {


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

    function getDataProduct() {

        var products = ShopService.getProducts();

        $scope.products.all = [];
        $scope.products.best_seller = [];
        $scope.products.promotion = [];
        $scope.products.combo = [];

        $scope.products.data = products;
        $scope.products.defaults = $scope.products.data[0].category_name;
        $scope.productsByCart = $scope.products.data[0].products;

        for (var i = products.length - 1; i >= 0; i--) {
            for (var ii = products[i].products.length - 1; ii >= 0; ii--) {
                $scope.products.all.push(products[i].products[ii]);
                if (products[i].products[ii].bestSale == true) {
                    $scope.products.best_seller.push(products[i].products[ii]);
                }
                if (products[i].products[ii].product_type == 'promotion') {
                    $scope.products.promotion.push(products[i].products[ii]);
                }
                if (products[i].products[ii].product_type == 'combo') {
                    $scope.products.combo.push(products[i].products[ii]);
                }
            };

        };


    }

    $scope.onSelect = function(item) {
        var productsByCart = $filter('filter')($scope.products.data, function(data) {
            return data.category_name === item.category_name;
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
        console.log('load data complete.');


        $timeout(function() {
            $ionicLoading.hide();
        }, 2000)

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
                    product.qty = chk[0].qty;
                    countDown(product);
                } else {
                    product.qty = count;
                    $scope.iFlightData.products.push(product);
                    // var addCheck = $filter('filter')($scope.productsByCart, function(item) {
                    //     return item.products_id === product.products_id;
                    // })
                    $scope.isSelected.push(product.products_id);
                    countDown(product);
                }
            } else {
                product.qty = count;
                $scope.iFlightData.products.push(product);
                $scope.isSelected.push(product.products_id);
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
                for (var ii = $scope.iFlightData.products.length - 1; ii >= 0; ii--) {
                    if ($scope.iFlightData.products[ii].products_id === $scope.products.data[i].products[$scope.products.data[i].products.indexOf(product)].products_id) {
                        $scope.products.data[i].products[$scope.products.data[i].products.indexOf(product)].total_qty -= 1;
                        $scope.iFlightData.products[ii].total_qty = $scope.products.data[i].products[$scope.products.data[i].products.indexOf(product)].total_qty;
                        break;

                    }

                };
            }


        };

    }
    $scope.onHold = function(product) {
        var ckeckStock = ShopService.getProducts();
        var e = [];
        for (var i = ckeckStock.length - 1; i >= 0; i--) {
            var checked = $filter('filter')(ckeckStock[i].products, function(data) {
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
                orders: $scope.iFlightData,
                product_data: $scope.products,
                isSelected: $scope.isSelected
            });
        }

    }

    $scope.menuOpen = true;

    // Triggered on a button click, or some other target
    $scope.showActionSheet = function(pass) {
        var checkedKeep = ShopService.getOrders();
        var ch = false;
        for (var i = checkedKeep.length - 1; i >= 0; i--) {
            if (checkedKeep[i].id === $scope.iFlightData.id) {
                ch = true;
            }
        };
        if ($scope.iFlightData.products.length > 0) {
            if ($scope.menuOpen == pass) {
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
                        if (index == 0) {
                            hideSheet();
                            if ($scope.iFlightData.products.length > 0) {
                                if (ch == true) {
                                    ShopService.setOrdersKeep($scope.iFlightData);
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
                                    ShopService.clearOrderTemporary();
                                    $scope.loadData();
                                    $ionicSlideBoxDelegate.update();
                                    $ionicSideMenuDelegate.toggleLeft();
                                    $scope.menuOpen = false;
                                } else {
                                    $scope.data = {};
                                    var myPopup = $ionicPopup.show({
                                        template: '<input type="text" ng-model="data.seat" style="text-align:right;">',
                                        title: 'Seat',
                                        subTitle: '',
                                        scope: $scope,
                                        buttons: [{
                                            text: 'Cancel',
                                            onTap: function(e) {
                                                // $scope.data.money = item.currency.money;
                                            }
                                        }, {
                                            text: '<b>Confirm</b>',
                                            type: 'button-positive',
                                            onTap: function(e) {
                                                $scope.iFlightData.seat = $scope.data.seat;
                                                ShopService.setOrdersKeep($scope.iFlightData);
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
                                                ShopService.clearOrderTemporary();
                                                $scope.loadData();
                                                $ionicSlideBoxDelegate.update();
                                                $ionicSideMenuDelegate.toggleLeft();
                                                $scope.menuOpen = false;
                                            }
                                        }]
                                    })
                                }
                            }

                        } else if (index == 1) {
                            if ($scope.iFlightData.status == 'keep') {
                                ShopService.removeOrderForKeep($scope.iFlightData);
                            }

                            ShopService.clearOrderTemporary();
                            $scope.loadData();
                            $ionicSlideBoxDelegate.update();
                            $timeout(function() {
                                hideSheet();
                                $ionicSideMenuDelegate.toggleLeft();
                            }, 1500);

                            $scope.menuOpen = false;
                        } else {
                            ShopService.clearOrderTemporary();
                            $scope.loadData();
                            $ionicSlideBoxDelegate.update();
                            hideSheet();
                        }

                    }
                });
            } else {
                $scope.menuOpen = true;
            }
        } else {
            $ionicSideMenuDelegate.toggleLeft();
        }

    };


    $scope.checkoutProduct = function(iFlightData) {
        $ionicLoading.show({
            noBackdrop: false,
            template: '<ion-spinner icon="ios" class="spinner-back"></ion-spinner>',

        });

        ShopService.setOrderTemporary(iFlightData);
        $state.go('app.cart', { iFlightData: iFlightData });
    }


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

    $scope.slideHasChanged = function(e) {
        console.log(e);
    }

})


.controller('CheckoutCtrl', function($scope) {
    //$scope.paymentDetails;
})

.controller('PaymentCtrl', function($scope, $ionicModal, $state, $ionicPopup, PaymentService, $stateParams, ShopService, $filter, MasterService, $ionicActionSheet, $ionicLoading) {

    $ionicLoading.hide();

    $scope.iFlightData = ShopService.getOrderTemporary();
    $scope.calculatorTotal = $scope.iFlightData.total_gross_amount;
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


    $scope.goBackToShop = function() {

        $ionicLoading.show({
            noBackdrop: false,
            template: '<ion-spinner icon="ios" class="spinner-back"></ion-spinner>',

        });

        $state.go('app.shop');
    }

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


    $scope.data = {};
    $scope.showPopup = function(item) {

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
        // var saveTotal = 0;
        // var saveTotalFrist = 0;
    $scope.curren = function(currency) {
        // console.log($scope.iFlightData.total_gross_amount, $scope.calculatorTotal);
        $scope.itemTypePay.currency.currencys = currency;

        $scope.iFlightData.sumTotal
        var money = $scope.calculatorTotal / currency.exchange;

        if (money > parseInt(money)) {
            $scope.data.money = parseInt(money + 1);
        } else {
            $scope.data.money = $scope.calculatorTotal / currency.exchange;
        }
        $scope.Payment.hide();
    }

    var a;

    $scope.$watch('payments', function(n, o) {

        var res = 0;
        var blacklists = null;
        var result = 0;

        if ($scope.itemTypePay != undefined) {
            var getOByID = $filter('filter')(n, function(data) {
                return data.id == $scope.itemTypePay.id;
            })
            a = getOByID[0];
        }

        $scope.calculatorTotal = 0;

        MasterService.getBlacklists().then(function(data) {
            blacklists = data;

            for (var i = $scope.iFlightData.payments.length - 1; i >= 0; i--) {
                if ($scope.iFlightData.payments[i].currency.card_id != null) {
                    var blacklists_checked = $filter('filter')(blacklists, function(rtBlacklists) {
                        return rtBlacklists.account == $scope.iFlightData.payments[i].currency.card_id;
                    })

                    if (blacklists_checked.length > 0) {
                        var alertPopup = $ionicPopup.alert({
                            title: '<div class="text-center"><b>Warning</b></div>',
                            template: '<div class="text-center">Blacklist</div>'
                        });

                        alertPopup.then(function(res) {

                        });
                        $scope.iFlightData.payments[i].currency.card_id = null;
                        $scope.iFlightData.payments[i].currency.money = null;
                        $scope.iFlightData.payments[i].amount = null;
                    }

                }

            };
        });



        for (var i = $scope.payments.length - 1; i >= 0; i--) {
            if (n[i].currency.currencys.exchange != null) {
                res = n[i].currency.money * n[i].currency.currencys.exchange;
                n[i].amount = res;
            } else if (n[i].currency.card_id) {
                n[i].amount = n[i].currency.money;
            }
        };

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
        for (var i = 0; i < getStock.length; i++) {
            for (var ii = getStock[i].products.length - 1; ii >= 0; ii--) {
                for (var iii = $scope.iFlightData.products.length - 1; iii >= 0; iii--) {
                    if (getStock[i].products[ii].products_id === n[iii].products_id) {
                        $scope.iFlightData.products[iii].total_qty = getStock[i].products[ii].total_qty - parseInt(n[iii].qty);
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


        for (var i = 0; i < getStock.length; i++) {
            for (var ii = getStock[i].products.length - 1; ii >= 0; ii--) {
                if (getStock[i].products[ii].products_id === id) {
                    inStock = getStock[i].products[ii].total_qty;
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
    $scope.showActionSheet = function() {
        var checkedKeep = ShopService.getOrders();
        var ch = false;
        for (var i = checkedKeep.length - 1; i >= 0; i--) {
            if (checkedKeep[i].id === $scope.iFlightData.id) {
                ch = true;
            }
        };
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
                if (index == 0) {
                    hideSheet();
                    if (ch == true) {

                        ShopService.setOrdersKeep($scope.iFlightData);
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
                        ShopService.clearOrderTemporary();
                        $state.go('app.shop');
                    } else {
                        $scope.data = {};
                        var myPopup = $ionicPopup.show({
                            template: '<input type="text" ng-model="data.seat" style="text-align:right;">',
                            title: 'Seat',
                            subTitle: '',
                            scope: $scope,
                            buttons: [{
                                text: 'Cancel',
                                onTap: function(e) {
                                    // $scope.data.money = item.currency.money;
                                }
                            }, {
                                text: '<b>Confirm</b>',
                                type: 'button-positive',
                                onTap: function(e) {
                                    $scope.iFlightData.seat = $scope.data.seat;
                                    ShopService.setOrdersKeep($scope.iFlightData);
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
                                    ShopService.clearOrderTemporary();
                                    $state.go('app.shop');
                                }
                            }]
                        })
                    }

                } else if (index == 1) {
                    if ($scope.iFlightData.status == 'keep') {
                        ShopService.removeOrderForKeep($scope.iFlightData);
                    }
                    ShopService.clearOrderTemporary();
                    $state.go('app.shop');
                }
            }
        });

    };

    $scope.keyCardId = function(item) {
        if (item.currency.card_id != null) {
            if (item.currency.card_id.toString().length == 16) {
                console.log("true");
                item.currency.money = $scope.calculatorTotal;
            }
        }

    }

})

.controller('MainCtrl', function($scope, $state, ShopService, $ionicPopup) {

    $scope.loadOrders = function() {
        $scope.orders = ShopService.getOrders();
    }

    $scope.removeOrder = function(order) {

        if (order.status === 'sold') {
            $scope.securityCode;
            var myPopup = $ionicPopup.show({
                template: '<input type="password" ng-model="securityCode" style="text-align:center;">',
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




    $scope.loadAdj = function() {
        $scope.products = [];
        var products = ShopService.getProducts();
        // $scope.products = $scope.res.data[0].products;

        for (var i = products.length - 1; i >= 0; i--) {
            for (var ii = products[i].products.length - 1; ii >= 0; ii--) {
                $scope.products.push(products[i].products[ii]);

            };

        };
    }

    $scope.click = function(product) {

        var click = 1;
        if (product.total_qty > 0) {
            $state.go('app.adjustdetail', {
                data: product,
            });
        }


    }

    $scope.onSelect = function(item) {
        var productsByCart = $filter('filter')($scope.res.data, function(data) {
            return data.category_name === item.category_name;
        })
        $scope.products = productsByCart[0].products;
    }


    /////////////////////addItem//////////////////////////
    $scope.adjusts = {};

    $scope.qtyAdjust = function(count) {

        var ratings = [];

        for (var i = 0; i < count; i++) {
            ratings.push(i + 1)
        }
        quantity = ratings.length;
        return ratings;
    }

    $scope.selectRemark = function(rm) {
        $scope.adjusts.remark = rm;
    }

    $scope.gotoShopAdjust = function() {
        $state.go('app.shopadjust');
    }
    $scope.aadAdjust = function() {

        $scope.detail.adjustment = $scope.adjusts;
        AdjustService.setOrderAdjust($scope.detail);
        $scope.detail = null;
        $state.go('app.orderadjust');
    }
    $scope.removeAdj = function(adj) {
        AdjustService.removeAdjust(adj);
        $scope.adjustsList = AdjustService.getadjust();

    }
    $scope.getAdjust = function() {
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

.controller('ReceiptCtrl', function($scope, $stateParams, $filter, ShopService, $state,$ionicLoading) {

    var orderId = $stateParams.id;
    var getOrdersData = ShopService.getOrders();

    var filterOrderByID = $filter('filter')(getOrdersData, function(order) {
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
        $ionicLoading.show({
            noBackdrop: false,
            template: '<ion-spinner icon="ios" class="spinner-back"></ion-spinner>',

        });

        $state.go('app.shop');
    }

})
