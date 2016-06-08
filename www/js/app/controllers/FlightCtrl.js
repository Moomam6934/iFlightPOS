iFlight.controller('FlightCtrl', function($scope, $state, $timeout) {


    $scope.downloadOne = false;
    $scope.downloadTwo = false;
    $scope.successOne = false;
    $scope.successTwo = false;

    $scope.gotoSelectCart = function() {
        $scope.downloadOne = true;
        $scope.downloadTwo = true;
        $timeout(function() {
            $scope.successOne = true;
            $scope.downloadOne = false;
        }, 2000) 
        $timeout(function() {
            $scope.successTwo = true;
            $scope.downloadTwo = false;
        }, 4000)
        $timeout(function() {
            $state.go('menushop');
            $scope.download = false;
        }, 5000)
    }

})
