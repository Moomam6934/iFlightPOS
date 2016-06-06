iFlight.controller('SyncCtrl', function($scope, $state, $timeout) {

    $scope.keyPressed = function(keyCode) {

        pword = $scope.typedCode;

        switch (keyCode) {
            case -3:
                var codeLength = $scope.typedCode.length;
                if (codeLength > 0) {
                    $scope.typedCode = $scope.typedCode.substr(0, codeLength - 1);
                } else {
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
                $state.go('app.syncing');
            } else {
                $scope.typedCode = "";
            }
        }

    };

    $scope.goHome = function() {
        $state.go('menushop');

    }

    $scope.loadding = 0;
    $scope.loadComplate = 100;

    $scope.loadProgress = function() {
        var elem = document.getElementById("myBar");
        var width = 1;
        var id = setInterval(frame, 10);

        function frame() {
            if (width >= 100) {
                clearInterval(id);
                alert('Success');
            } else {
                width++;
                elem.style.width = width + '%';
                document.getElementById("label").innerHTML = width * 1  + '%';
            }
        }
    }

});
