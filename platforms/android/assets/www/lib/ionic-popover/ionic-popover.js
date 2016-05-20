angular.module('popover', [])
    // .directive('ioneSelectList', function() {
    //     return {
    //         restrict: 'A',

//         link: function(scope, elem, attrs) {

//             elem.bind('click', function() {
//                 alert("OK")
//             });

//         }
//     }

// })
.directive('ionePopover', function() {
    return {
        restrict: 'E',
        template: '<div style="margin-top:-5px;" ng-click="popover.show($event)">{{title}}<p style="margin-top:-30px; font-size:1px;">{{subtitle}} <i class="icon ion-arrow-down-b"></i></p></div>',
        scope: {
            title: '@',
            subtitle: '@',
            templateurl: '@',
            // data: '=model',
            list: '=listmodel',
            onSelected: '='
        },
        // link: function(scope, elem, attrs) {
        //     var src = elem.find('img');
        //     alert(src.attr('src'));
        //     src.bind('click', function() {
        //         alert("OK")
        //     });

        // },
        controller: function($scope, $ionicPopover) {
            // $scope.title_info = '=info';
            // alert($scope.data);
            $ionicPopover.fromTemplateUrl($scope.templateurl, {
                scope: $scope,
                animation: 'am-fade-and-scale' //am-fade-and-scale //am-fade-and-slide-top
            }).then(function(popover) {
                $scope.popover = popover;
            });


            $scope.selectPath = function(item) {
                $scope.onSelected(item);
                $scope.popover.hide();
            }
        },
    };

});
