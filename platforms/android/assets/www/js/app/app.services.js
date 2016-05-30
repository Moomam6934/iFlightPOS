angular.module('your_app_name.app.services', [])

.service('AuthService', function() {

    this.saveUser = function(user) {
        window.localStorage.your_app_name_user = JSON.stringify(user);
    };

    this.getLoggedUser = function() {

        return (window.localStorage.your_app_name_user) ?
            JSON.parse(window.localStorage.your_app_name_user) : null;
    };

})



.service('ShopService', function($http, $filter, $q, _) {

    $http.get('database.json').success(function(database) {
        var iFlight_data = database;
        window.localStorage.iFlight_data = JSON.stringify(iFlight_data);
    });


    this.getProducts = function() {
        return JSON.parse(window.localStorage.iFlight_data || '[]');
    };

    this.addProductToCart = function(productToAdd) {
        var cart_products = !_.isUndefined(window.localStorage.ionTheme1_cart) ? JSON.parse(window.localStorage.ionTheme1_cart) : [];

        //check if this product is already saved
        var existing_product = _.find(cart_products, function(product) {
            return product._id == productToAdd._id;
        });

        if (!existing_product) {
            cart_products.push(productToAdd);
        }

        window.localStorage.ionTheme1_cart = JSON.stringify(cart_products);
    };

    this.getCartProducts = function() {
        return JSON.parse(window.localStorage.ionTheme1_cart || '[]');
    };

    this.removeProductFromCart = function(productToRemove) {
        var cart_products = JSON.parse(window.localStorage.ionTheme1_cart);

        var new_cart_products = _.reject(cart_products, function(product) {
            return product._id == productToRemove._id;
        });

        window.localStorage.ionTheme1_cart = JSON.stringify(new_cart_products);
    };

    this.getOrders = function() {
        return (window.localStorage.iFlight_data) ?
            JSON.parse(window.localStorage.iFlight_data) : null;
    };
    this.setOrdersKeep = function(orders_keep) {
        var iFlight = !_.isUndefined(window.localStorage.iFlight_data) ? JSON.parse(window.localStorage.iFlight_data) : [];
        var lastItem = _.last(iFlight.orders);
        var ids = 1;
        var receipt_number = 1;
        if (iFlight.orders.length > 0) {
            ids = lastItem.id + 1;
            receipt_number = lastItem.id + 1;
        }

        orders_keep.id = ids;
        orders_keep.receipt_number = receipt_number;
        orders_keep.status = 'keep';

        iFlight.orders.push(orders_keep);

        window.localStorage.iFlight_data = JSON.stringify(iFlight);
    };

    this.setOrdersVold = function(orders_vold) {
        var iFlight = !_.isUndefined(window.localStorage.iFlight_data) ? JSON.parse(window.localStorage.iFlight_data) : [];

        var getOrderByID = _.find(iFlight.orders, function(order) {
            return order.id == orders_vold.id;
        });

        getOrderByID.status = 'void';


        window.localStorage.iFlight_data = JSON.stringify(iFlight);
    };

    this.setOrdersSuccess = function(orders_success) {
        var iFlight = !_.isUndefined(window.localStorage.iFlight_data) ? JSON.parse(window.localStorage.iFlight_data) : [];
        var lastItem = _.last(iFlight.orders);
        var ids = 1;
        var receipt_number = 1;
        if (iFlight.orders.length > 0) {
            ids = lastItem.id + 1;
            receipt_number = lastItem.id + 1;
        }
        for (var i = iFlight.cart.length - 1; i >= 0; i--) {
            for (var ii = iFlight.cart[i].products.length - 1; ii >= 0; ii--) {
                for (var iii = orders_success.products.length - 1; iii >= 0; iii--) {
                    if (orders_success.products[iii].products_id === iFlight.cart[i].products[ii].products_id) {
                        iFlight.cart[i].products[ii].total_qty = orders_success.products[iii].total_qty
                    }
                };

            };

        };

        orders_success.id = ids;
        orders_success.receipt_number = receipt_number;
        orders_success.status = 'sold';

        iFlight.orders.push(orders_success);

        window.localStorage.iFlight_data = JSON.stringify(iFlight);
        window.localStorage.removeItem('order_temporary');

    }

    this.setOrderTemporary = function(orders) {
        var order_temporary = !_.isUndefined(window.localStorage.order_temporary) ? JSON.parse(window.localStorage.order_temporary) : {};
        if (angular.isArray(orders)) {

            var iFlightData = {
                id: null,
                receipt_number: null,
                date: new Date(),
                products: orders,
                total_gross_amount: 0,
                total_discount: 0,
                total_net_amount: 0,
                payments: [],
                payment_date: new Date(),
                seller_user: "Nuttakrittra Phumsawai",
                status: ''
            }
            window.localStorage.order_temporary = JSON.stringify(iFlightData);
        } else {
            window.localStorage.order_temporary = JSON.stringify(orders);
        }
    }
    this.getOrderTemporary = function() {
        return JSON.parse(window.localStorage.order_temporary || null);
    };
    this.clearOrderTemporary = function() {
        window.localStorage.removeItem('order_temporary');
    }
    this.removeProduct = function(productToRemove) {
        var order_temporary = JSON.parse(window.localStorage.order_temporary);

        var new_products = _.reject(order_temporary.products, function(product) {
            return product.products_id == productToRemove.products_id;
        });

        order_temporary.products = new_products;
        window.localStorage.order_temporary = JSON.stringify(order_temporary);
    };

    this.removeOrder = function(orderToRemove) {
        var iFlight_data = !_.isUndefined(window.localStorage.iFlight_data) ? JSON.parse(window.localStorage.iFlight_data) : [];

        var new_products = _.reject(iFlight_data.orders, function(order) {
            return order.id == orderToRemove.id;
        });

        iFlight_data.orders = new_products;
        window.localStorage.iFlight_data = JSON.stringify(iFlight_data);
    };
    // window.localStorage.removeItem('iFlightData');


})

.service('PaymentService', function($q, $http) {
    this.getCurrency = function() {
        var dfd = $q.defer();
        $http.get('database.json').success(function(database) {
            dfd.resolve(database.currency);
        });
        return dfd.promise;
    }
})

.service('MasterService', function($http, $filter, $q, _) {

    this.getBlacklists = function() {
        var dfd = $q.defer();
        $http.get('database.json').success(function(database) {
            dfd.resolve(database.blacklists);
        });
        return dfd.promise;
    };
    this.getPromotions = function() {
        var dfd = $q.defer();
        $http.get('database.json').success(function(database) {
            dfd.resolve(database.promotions);
        });
        return dfd.promise;
    };
    this.getCurrency = function() {
        var dfd = $q.defer();
        $http.get('database.json').success(function(database) {
            dfd.resolve(database.currency);
        });
        return dfd.promise;
    }
})

.service('AdjustService', function($http, $filter, $q, _) {


    this.getProducts = function() {
        var dfd = $q.defer();
        $http.get('database.json').success(function(database) {
            dfd.resolve(database);
        });
        return dfd.promise;
    };



})
