iFlight.controller('SyncCtrl', function($scope,$state){

 $scope.keyPressed = function(keyCode) {

        pword = $scope.typedCode;

        switch (keyCode) {
            case -3:
                var codeLength = $scope.typedCode.length;
                if (codeLength > 0) {
                    $scope.typedCode = $scope.typedCode.substr(0, codeLength - 1);
                }else{
                    $scope.typedCode = "";
                }
                break;
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 0:
                if (!/^\d+$/.test(pword)) {
                    $scope.typedCode = keyCode;
                } else {
                    $scope.typedCode += '' + keyCode;
                }
                break;

        }

        if ($scope.typedCode.length == 6) {
            if ($scope.typedCode == 111111) {
                $location.path('templates/member');
            } else {
                $scope.typedCode = "";
            }
        }

    };

    $scope.goHome = function(){
		$state.go('menushop');

    }
});