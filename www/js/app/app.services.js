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
        var dfd = $q.defer();
        $http.get('database.json').success(function(database) {
            dfd.resolve(database.cart);
        });
        return dfd.promise;
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
        var ids = iFlight.orders.length + 1;
        var receipt_number = iFlight.orders.length + 1;

        orders_keep.id = ids;
        orders_keep.receipt_number = receipt_number;

        iFlight.orders.push(orders_keep);

        window.localStorage.iFlight_data = JSON.stringify(iFlight);
    };
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
.service('AdjustService', function($http,$filter, $q, _) {

    this.getProducts = function() {
        var dfd = $q.defer();
        $http.get('database.json').success(function(database) {
            dfd.resolve(database.cart.products);
        });
        return dfd.promise;
    };


})
