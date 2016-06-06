iFlight.controller('SyncCtrl', function($scope, $state, $timeout, $ionicPopup, $stateParams) {

    var pass = $stateParams.pass;

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
                $state.go('app.syncing', { pass: $scope.typedCode });
                $scope.typedCode = "";
            } else if ($scope.typedCode == 000000) {
                $state.go('app.syncing', { pass: $scope.typedCode });
                $scope.typedCode = "";
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
        $timeout(function() {
            if (pass == 000000) {

                var confirmPopup = $ionicPopup.confirm({
                    template: "<div class='text-center'>Authen is invalid</div>",
                    title: "Warning",
                    buttons: [{
                        text: "Try Agian",
                        type: 'button-positive',
                        onTap: function(e) {
                            $scope.loadProgress();
                        }
                    }, {
                        text: "Cancel",
                        onTap: function(e) {
                            $state.go('app.main-sync');
                        }
                    }, ]
                });
            } else {
                var elem = document.getElementById("myBar");
                var width = 1;
                var id = setInterval(frame, 10);

                function frame() {

                    if (width >= 100) {
                        clearInterval(id);

                        var alertPopup = $ionicPopup.alert({
                            title: 'Sync to Hub',
                            template: '<div class="text-center">Success!</div>'
                        });

                        alertPopup.then(function(res) {
                            $state.go('menushop');
                        });


                    } else {
                        width++;
                        elem.style.width = width + '%';
                        document.getElementById("label").innerHTML = width * 1 + '%';
                    }


                }
            }

        }, 1000);

    }

});
