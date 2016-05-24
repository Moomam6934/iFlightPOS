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



.service('ShopService', function($http, $q, _) {

    this.getProducts = function() {
        var dfd = $q.defer();
        $http.get('database.json').success(function(database) {
            dfd.resolve(database.cart);
        });
        return dfd.promise;
    };

    this.getProduct = function(productId) {
        var dfd = $q.defer();
        $http.get('database.json').success(function(database) {
            var product = _.find(database.products, function(product) {
                return product._id == productId;
            });

            dfd.resolve(product);
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
        var dfd = $q.defer();
        $http.get('database.json').success(function(database) {
            dfd.resolve(database.orders);
        });
        return dfd.promise;
    };

})
.service('paymentService',function($q,$http){
    this.getCurrency = function(){
        var dfd =$q.defer();
        $http.get('database.json').success(function(database) {
            dfd.resolve(database.orders);
        });
        return dfd.promise;
    }
})