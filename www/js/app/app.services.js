angular.module('iFlightPOS.app.services', [])


.service('ShopService', function($http, $q, _) {

    $http.get('database.json').success(function(database) {
        var iFlight_data = database;
        window.localStorage.iFlight_data = JSON.stringify(iFlight_data);
    });


    this.getProducts = function() {
        var getProducts = JSON.parse(window.localStorage.iFlight_data || '[]');

        return getProducts.Categories;
    };

    this.getOrders = function() {
        var getOrders = JSON.parse(window.localStorage.iFlight_data || '[]');

        return getOrders.orders;
    };
    this.getOrdersKeep = function() {
        var getOrdersKeep = JSON.parse(window.localStorage.iFlight_data).orders;
        var keepOrders = [];
        for (var i = getOrdersKeep.length - 1; i >= 0; i--) {
            if (getOrdersKeep[i].status == 'keep') {
                keepOrders.push(getOrdersKeep[i]);
            }
        };
        return keepOrders;
    }
    this.setOrdersKeep = function(orders_keep) {
        var iFlight = !_.isUndefined(window.localStorage.iFlight_data) ? JSON.parse(window.localStorage.iFlight_data) : [];
        var lastItem = _.last(iFlight.orders);
        var ids = 1;
        var receipt_number = 1;

        if (orders_keep.id != null) {
            for (var i = iFlight.orders.length - 1; i >= 0; i--) {
                if (iFlight.orders[i].id === orders_keep.id) {
                    iFlight.orders[i] = orders_keep;
                }
            };
        } else {
            if (iFlight.orders.length > 0) {
                ids = lastItem.id + 1;
                receipt_number = lastItem.id + 1;
            }

            orders_keep.id = ids;
            orders_keep.receipt_number = receipt_number;
            orders_keep.status = 'keep';

            iFlight.orders.push(orders_keep);
        }

        for (var i = iFlight.Categories.length - 1; i >= 0; i--) {
            for (var ii = iFlight.Categories[i].products.length - 1; ii >= 0; ii--) {
                for (var iii = orders_keep.products.length - 1; iii >= 0; iii--) {
                    iFlight.Categories[i].products[ii].sold_qty = 0;
                    if (orders_keep.products[iii].products_id === iFlight.Categories[i].products[ii].products_id) {
                        iFlight.Categories[i].products[ii].total_qty = orders_keep.products[iii].total_qty;
                        iFlight.Categories[i].products[ii].sold_qty = iFlight.Categories[i].products[ii].sold_qty + orders_keep.products[iii].qty;
                    }
                };

            };

        };

        window.localStorage.iFlight_data = JSON.stringify(iFlight);

    };

    this.setOrdersVold = function(orders_vold) {
        var iFlight = !_.isUndefined(window.localStorage.iFlight_data) ? JSON.parse(window.localStorage.iFlight_data) : [];

        var getOrderByID = _.find(iFlight.orders, function(order) {
            return order.id == orders_vold.id;
        });

        getOrderByID.status = 'void';

        for (var i = orders_vold.products.length - 1; i >= 0; i--) {
            for (var ii = iFlight.Categories.length - 1; ii >= 0; ii--) {
                for (var iii = iFlight.Categories[ii].products.length - 1; iii >= 0; iii--) {
                    if (orders_vold.products[i].products_id === iFlight.Categories[ii].products[iii].products_id) {
                        console.log(iFlight.Categories[ii].products[iii]);
                        console.log(orders_vold.products[i]);
                        iFlight.Categories[ii].products[iii].total_qty += orders_vold.products[i].qty;
                    }
                };
            };
        };



        window.localStorage.iFlight_data = JSON.stringify(iFlight);
    };

    this.setOrdersSuccess = function(orders_success) {
        var iFlight = !_.isUndefined(window.localStorage.iFlight_data) ? JSON.parse(window.localStorage.iFlight_data) : [];
        var lastItem = _.last(iFlight.orders);
        var ids = 1;
        var receipt_number = 1;

        if (orders_success.id != null) {

            for (var i = iFlight.orders.length - 1; i >= 0; i--) {
                if (iFlight.orders[i].id === orders_success.id) {
                    orders_success.status = 'sold';
                    iFlight.orders[i] = orders_success;
                }
            };
        } else {
            if (iFlight.orders.length > 0) {
                ids = lastItem.id + 1;
                receipt_number = lastItem.id + 1;
            }


            orders_success.id = ids;
            orders_success.receipt_number = receipt_number;
            orders_success.status = 'sold';

            iFlight.orders.push(orders_success);
        }

        for (var i = iFlight.Categories.length - 1; i >= 0; i--) {
            for (var ii = iFlight.Categories[i].products.length - 1; ii >= 0; ii--) {
                for (var iii = orders_success.products.length - 1; iii >= 0; iii--) {
                    if (orders_success.products[iii].products_id === iFlight.Categories[i].products[ii].products_id) {
                        iFlight.Categories[i].products[ii].total_qty = orders_success.products[iii].total_qty;
                        iFlight.Categories[i].products[ii].sold_qty = iFlight.Categories[i].products[ii].sold_qty + orders_success.products[iii].qty;
                    }
                };

            };

        };


        window.localStorage.iFlight_data = JSON.stringify(iFlight);
        window.localStorage.removeItem('order_temporary');

    }

    this.setOrderTemporary = function(orders) {
        var order_temporary = !_.isUndefined(window.localStorage.order_temporary) ? JSON.parse(window.localStorage.order_temporary) : {};
        // if (angular.isArray(orders)) {

        //     var iFlightData = {
        //         id: null,
        //         receipt_number: null,
        //         date: new Date(),
        //         products: orders,
        //         total_gross_amount: 0,
        //         total_discount: 0,
        //         total_net_amount: 0,
        //         payments: [],
        //         payment_date: new Date(),
        //         seller_user: "Nuttakrittra Phumsawai",
        //         status: ''
        //     }
        //     window.localStorage.order_temporary = JSON.stringify(iFlightData);
        // } else {
        //     window.localStorage.order_temporary = JSON.stringify(orders);
        // }

        window.localStorage.order_temporary = JSON.stringify(orders);
    }

    this.setOrderTemporaryByKeep = function(id) {
        var iFlight = !_.isUndefined(window.localStorage.iFlight_data) ? JSON.parse(window.localStorage.iFlight_data) : [];
        var order_temporary = !_.isUndefined(window.localStorage.order_temporary) ? JSON.parse(window.localStorage.order_temporary) : {};

        var getOrderByID = _.find(iFlight.orders, function(order) {
            return order.id == id;
        });

        order_temporary = getOrderByID;

        window.localStorage.order_temporary = JSON.stringify(order_temporary);

        for (var i = iFlight.Categories.length - 1; i >= 0; i--) {
            for (var ii = iFlight.Categories[i].products.length - 1; ii >= 0; ii--) {
                for (var iii = getOrderByID.products.length - 1; iii >= 0; iii--) {
                    if (getOrderByID.products[iii].products_id === iFlight.Categories[i].products[ii].products_id) {
                        iFlight.Categories[i].products[ii].total_qty += getOrderByID.products[iii].qty;
                        iFlight.Categories[i].products[ii].sold_qty -= getOrderByID.products[iii].qty;
                        iFlight.Categories[i].products[ii].qty = getOrderByID.products[iii].qty;
                    }
                };
            };


        };
        window.localStorage.iFlight_data = JSON.stringify(iFlight);
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


        for (var i = orderToRemove.products.length - 1; i >= 0; i--) {
            for (var ii = iFlight_data.Categories.length - 1; ii >= 0; ii--) {
                for (var iii = iFlight_data.Categories[ii].products.length - 1; iii >= 0; iii--) {
                    if (orderToRemove.products[i].products_id === iFlight_data.Categories[ii].products[iii].products_id) {
                        console.log(iFlight_data.Categories[ii].products[iii]);
                        console.log(orderToRemove.products[i]);
                        iFlight_data.Categories[ii].products[iii].total_qty += orderToRemove.products[i].qty;
                    }
                };
            };
        };

        iFlight_data.orders = new_products;
        window.localStorage.iFlight_data = JSON.stringify(iFlight_data);
    };

    this.removeOrderForKeep = function(orderToRemove) {
        var iFlight_data = !_.isUndefined(window.localStorage.iFlight_data) ? JSON.parse(window.localStorage.iFlight_data) : [];

        var new_products = _.reject(iFlight_data.orders, function(order) {
            return order.id == orderToRemove.id;
        });


        iFlight_data.orders = new_products;
        window.localStorage.iFlight_data = JSON.stringify(iFlight_data);
    };

    this.getOrdersByID = function(id) {

            var iFlight_data = !_.isUndefined(window.localStorage.iFlight_data) ? JSON.parse(window.localStorage.iFlight_data) : [];
            var getOrderByID = _.find(iFlight_data.orders, function(order) {
                return order.id == id;
            });

            return getOrderByID;

        }
        // window.localStorage.removeItem('order_temporary');


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

.service('MasterService', function($http, $q, _) {

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

.service('AdjustService', function($http, $q, _) {


    this.getProducts = function() {
        var dfd = $q.defer();
        $http.get('database.json').success(function(database) {
            dfd.resolve(database.Categories);
        });
        return dfd.promise;
    };




    this.setOrderAdjust = function(adjust) {
        var iFlight = !_.isUndefined(window.localStorage.iFlight_data) ? JSON.parse(window.localStorage.iFlight_data) : [];
        var order_adjust = !_.isUndefined(window.localStorage.order_adjust) ? JSON.parse(window.localStorage.order_adjust) : [];
        var adjust_lastItem = _.last(order_adjust);
        var id = 1;
        if (order_adjust.length != 0) {
            id = adjust_lastItem.adj_id + 1;
        }
        adjust.adj_id = id;

        order_adjust.push(adjust);

        for (var i = iFlight.Categories.length - 1; i >= 0; i--) {
            for (var ii = iFlight.Categories[i].products.length - 1; ii >= 0; ii--) {
                if (iFlight.Categories[i].products[ii].products_id == adjust.products_id) {
                    iFlight.Categories[i].products[ii].total_qty -= adjust.adjustment.unit;
                }
            };

        };
        window.localStorage.order_adjust = JSON.stringify(order_adjust);
        window.localStorage.iFlight_data = JSON.stringify(iFlight);
    }

    this.getadjust = function() {
        return JSON.parse(window.localStorage.order_adjust || null);
    };

    this.removeAdjust = function(adj) {
        var iFlight = !_.isUndefined(window.localStorage.iFlight_data) ? JSON.parse(window.localStorage.iFlight_data) : [];
        var order_adjust = JSON.parse(window.localStorage.order_adjust);

        var adjust = _.reject(order_adjust, function(adjust) {
            return adjust.adj_id == adj.adj_id;
        });
        order_adjust = adjust;
        window.localStorage.order_adjust = JSON.stringify(order_adjust);


        for (var i = iFlight.Categories.length - 1; i >= 0; i--) {
            for (var ii = iFlight.Categories[i].products.length - 1; ii >= 0; ii--) {
                if (iFlight.Categories[i].products[ii].products_id == adj.products_id) {
                    iFlight.Categories[i].products[ii].total_qty += parseInt(adj.adjustment.unit);
                }
            };

        };
        window.localStorage.iFlight_data = JSON.stringify(iFlight);
    };
    // window.localStorage.removeItem('order_addjust');
})
