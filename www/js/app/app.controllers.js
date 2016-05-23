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


.controller('ProductCtrl', function($scope, $stateParams, ShopService, $ionicPopup, $ionicLoading) {
    var productId = $stateParams.data._id;

    ShopService.getProduct(productId).then(function(product) {
        $scope.product = product;
    });

    // show add to cart popup on button click
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


.controller('PostCardCtrl', function($scope, PostService, $ionicPopup, $state) {
    var commentsPopup = {};

    $scope.showComments = function(post) {
        PostService.getPostComments(post)
            .then(function(data) {
                post.comments_list = data;
                commentsPopup = $ionicPopup.show({
                    cssClass: 'popup-outer comments-view',
                    templateUrl: 'views/app/partials/comments.html',
                    scope: angular.extend($scope, { current_post: post }),
                    title: post.comments + ' Comments',
                    buttons: [
                        { text: '', type: 'close-popup ion-ios-close-outline' }
                    ]
                });
            });
    };
})




.controller('ShopCtrl', function($scope, ShopService, $ionicActionSheet, $timeout, $ionicPopover, $filter, $state, $filter) {
    $scope.products = [];
    $scope.popular_products = [];
    ShopService.getProducts().then(function(products) {
        $scope.products = products;
        $scope.productsByCart = $scope.products[0].products;

        $scope.select = {
            data:$scope.products[0].class
        }

    });

    $scope.cate = {};
    $scope.onSelect = function(item) {
        var productsByCart = $filter('filter')($scope.products, function(data) {
            return data.class === item.class;
        })
        $scope.productsByCart = productsByCart[0].products;
    }

    ShopService.getProducts().then(function(products) {
        $scope.popular_products = products.slice(0, 2);
    });
    $scope.selectItem = [];
    $scope.select_item = function(product) {
        if ($scope.selectItem.indexOf(product) == -1) {
            product.piece = 1;
            $scope.selectItem.push(product)


        } else {
            $scope.addItem = $filter('filter')($scope.selectItem, function(item) {
                return item._id === product._id;
            })
            $scope.addItem[0].piece += 1;
        }


    }
    $scope.onHold = function(product) {
            $state.go('app.product-detail', { data: product });

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

            cancelText: '<span class="test">Cancel</span>',
            cancel: function() {},
            buttonClicked: function(index) {
                switch (index) {
                    case 0:
                        $state.go('app.main.all');
                        break;
                    case 1:
                        $state.go('app.main.all');
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


.controller('PaymentCtrl', function($scope, $ionicModal, $state) {

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



    $scope.payments = [];
    $scope.paymentdetail = {
        id: null,
        type: 'Cash',
        currency: {
            exchange: null,
            money: null,
            card_id: null,
            security: null,
            exp: null
        },
        amount: null

    }
    $scope.currencys = [{
        id: 1,
        name: "USD",
        exchange: 35.36,
        desc: "ดอลลาร์สหรัฐอเมริกา"
    }, {
        id: 2,
        name: "JPY",
        exchange: 0.32,
        desc: "เยนญี่ปุ่น"
    }, {
        id: 3,
        name: "EUR",
        exchange: 40.01,
        desc: "ยูโร"
    }]
    $scope.itemTypePay;
    $scope.typeOfPayment = function(item) {
        $scope.Type_of_Payment.show();
        $scope.itemTypePay = item;
    }
    $scope.payment = function(typepayment, item) {
        $scope.Payment.show();
        $scope.itemTypePay = item;
    }
    $scope.typeOfPay = function(type) {
        $scope.itemTypePay.type = type;
        $scope.Type_of_Payment.hide();
    }
    $scope.addPayment = function() {
        var ids = $scope.payments.length + 1;
        $scope.payments.push({
            id: ids,
            type: 'Cash',
            currency: {
                exchange: null,
                money: null,
                card_id: null,
                security: null,
                exp: null
            },
            amount: null
        });

    }
    $scope.cur = function(currency) {
        $scope.itemTypePay.currency.exchange = currency.name;
        $scope.Payment.hide()
    }

})

.controller('MainCtrl', function($scope, $state, ShopService) {

    ShopService.getOrders().then(function(orders) {
        $scope.orders = orders;
    })
});