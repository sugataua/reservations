// public/app.js

// angular.module('location', [])
//     .config(function ($locationProvider) {
//         $locationProvider.html5Mode(true);
//     })

var resourceApp = angular.module('resourceApp', ["ngRoute", "ui.bootstrap"]);

resourceApp.config(function($routeProvider, $locationProvider) {
    $routeProvider
    .when("/resources/add", {
        templateUrl : "resource.htm",
        controller: "resourceCreateController"
    })
    .when("/resources/:resourceId/edit", {
        templateUrl : "resource.htm",
        controller: "resourceEditController"
    })
    .when("/admin", {
        templateUrl : "admin.htm",
        controller: "adminController"
    })
    .when("/reservations/:reservationId", {
        templateUrl: "reservation.htm",
        controller: "viewReservationController"
    })
    .when("/", {
        templateUrl : "main.htm",
        controller: "reservationController"
    })
    .otherwise('/');
    $locationProvider.html5Mode(true);
});

resourceApp.controller('mainController', ['$scope', '$location', function($scope, $location){
    $scope.notificationActive = false;
    $scope.isCurrentPath = function(viewLocation){
        return viewLocation === $location.path();
    };

    $scope.alerts = [];
    $scope.weekDays = [
        'Monday',
        'Tuesday',
        'Wensday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
    ];

    $scope.getBitValue = function(exp) {
        return Math.pow(2, exp);
    }

      $scope.closeAlert = function(index) {
          $scope.alerts.splice(index, 1);
      }

      $scope.addAlert = function(alert) {
          $scope.alerts.push(alert);
      }

}]);

resourceApp.controller('adminController', ['$scope', '$http', function($scope, $http) {
      
    // get all resources
    $scope.resources = [];

    $scope.loadResources = function() {
        $http.get('/api/resources')
        .then(function(response) {
            $scope.resources = response.data;
            console.log($scope.resources);
            
        }, function(response) {
            console.log('Error: ' + response);
        });        
    };
    
    $scope.loadResources();
   


    // send DELETE request
    $scope.deleteResource = function(id) {
        console.log('/api/resources/' + id);
        $http.delete('/api/resources/' + id)
            .then(function(response) {
                console.log(response);
                $scope.loadResources();
            }, function(response) {
                console.log('Error: ' + response);
            });
    };


    $scope.loadReservations = function() {
        $http.get('/api/reservations')
        .then(function(response) {
            $scope.reservations = response.data;
            console.log(response);
        }, function(response) {
            console.log('Error: ' + response);
        });        
    };

    $scope.loadReservations();

    $scope.deleteReservation = function(id) {
        console.log('/api/reservations/' + id);
        $http.delete('/api/reservations/' + id)
            .then(function(response) {
                console.log(response);
                $scope.loadReservations();
            }, function(response) {
                console.log('Error: ' + response);
            });
    };

}]);


resourceApp.controller('resourceCreateController', ['$scope', '$http', function($scope, $http) {
    $scope.titleAction = "Create";
    $scope.formData = {};

        // send create request to API
        $scope.submitResourceForm = function(isValid) {
            if (isValid) {
                console.log($scope.formData);
                $http.post('/api/resources', JSON.stringify($scope.formData), {headers: {'Content-Type': 'application/json'}})
                    .then(function(response) {
                        if (response.status === 200) {
                            $scope.formData = {}; // clear the form so our user is ready to enter another
                            $scope.resourceForm.$setPristine();
                            $scope.resourceForm.$setUntouched();
    
                            //$scope.loadResources();
                            $scope.addAlert({
                                type: 'success',
                                msg: response.data.message
                            });
                        } else {
    
                            $scope.addAlert({
                                type: 'danger',
                                msg: response.data.message
                            });
                        }
    
                        
                        
                        
                        console.log(response);
                    }, function(response) {
                        console.log('Error: ' + response);
                    });
            }
            
        };
    

}]);

resourceApp.controller('resourceEditController', ['$scope', '$http', '$route', function($scope, $http, $route) {
        console.log($route.current.params);  
        $scope.titleAction = "Edit";
        var resourceId = $route.current.params.resourceId;
        $scope.formData = null;
    
        $scope.getSingleResource = function() {
            $http.get('/api/resources/' + resourceId)
            .then(function(response) {
                $scope.formData = response.data;
                console.log(response);
            }, function(response) {
                console.log('Error: ' + response);
            });        
        };


        $scope.submitResourceForm = function(isValid) {
            if (isValid) {
                console.log($scope.formData);
                $http.put('/api/resources/' + resourceId, JSON.stringify($scope.formData), {headers: {'Content-Type': 'application/json'}})
                    .then(function(response) {
                        if (response.status === 200) {
                                                        
                            $scope.addAlert({
                                type: 'success',
                                msg: response.data.message
                            });
                        } else {
    
                            $scope.addAlert({
                                type: 'danger',
                                msg: response.data.message
                            });
                        }                
                        
                        
                        console.log(response);
                    }, function(response) {
                        console.log('Error: ' + response);
                    });
            }
        }

    
        $scope.getSingleResource();

}]);


resourceApp.controller('viewReservationController', ['$scope', '$http', '$route', function($scope, $http, $route) {
    console.log($route.current.params);

    var reservationId = $route.current.params.reservationId;
    $scope.reservation = null;

    $scope.getSingleReservation = function() {
        $http.get('/api/reservations/' + reservationId)
        .then(function(response) {
            $scope.reservation = response.data;
            console.log(response);
        }, function(response) {
            console.log('Error: ' + response);
        });        
    };

    $scope.getSingleReservation();

}]);

resourceApp.controller('reservationController', ['$scope', '$http', '$window', function($scope, $http, $window) {
    
    $scope.formData = {};
    $scope.resources = [];
    $scope.reservations  = [];

    $scope.reservationBeginTime = null;
    $scope.reservationEndTime = null;

    $scope.incorrectInterval = false;
    $scope.intervalViolation = false;

    $scope.isSubmittingData = false;

    $scope.calendarOptions = {
        minDate: new Date(),
        showWeeks: false
    };
    $scope.popupCalendar = {
        opened: false
      };

    $scope.openCalendar = function() {
        $scope.popupCalendar.opened = true;
      };
   

    $scope.loadResources = function() {
        $http.get('/api/resources')
        .then(function(response) {
            $scope.resources = response.data;
            console.log(response);
        }, function(response) {
            console.log('Error: ' + response);
        });        
    };



    $scope.loadReservations = function() {
        $http.get('/api/reservations')
        .then(function(response) {
            $scope.reservations = response.data;
            console.log(response);
        }, function(response) {
            console.log('Error: ' + response);
        });        
    };


    $scope.deleteReservation = function(id) {
        console.log('/api/reservations/' + id);
        $http.delete('/api/reservations/' + id)
            .then(function(response) {
                console.log(response);
                $scope.loadReservations();
            }, function(response) {
                console.log('Error: ' + response);
            });
    };

    $scope.loadResources();
    $scope.loadReservations();

    function collectDT(date, time) {
        var date_obj = new Date(date);
        var time_obj = new Date(time);

        var hours = time_obj.getHours();
        var minutes = time_obj.getMinutes();

        return new Date(date_obj.setHours(hours, minutes));
    }


    function findResource(id) {
        for(var i=0; i<$scope.resources.length; i++) {
            if ($scope.resources[i]._id === id) {
                console.log($scope.resources[i]._id + '_' + id);
                return $scope.resources[i];
            }
        }
        return null;
    }

    function compareTimeIntervals(a, b) {
        var date_a = new Date(a.begin);
        var date_b = new Date(b.begin);

        if (date_a < date_b) {
            return -1;
        }
        
        if (date_a > date_b) {
            return 1;
        }

        return 0;
    }

    function checkIntervalViolation(timeIntervals){
        for (var i=0; i<timeIntervals.length - 1; i++) {
            if (timeIntervals[i].end > timeIntervals[i+1].begin) {
                console.log(timeIntervals[i]);
                console.log(timeIntervals[i+1]);
                return true;
            }
        }
        return false;
    }


    
    $scope.createReservation = function(isValid) {
        $scope.isSubmittingData = true;
        
        if (isValid) {
            $scope.formData.begin = collectDT($scope.reservationDate, $scope.reservationBeginTime);
            $scope.formData.end = collectDT($scope.reservationDate, $scope.reservationEndTime);
    
            console.log('Reservation begins: ' + $scope.formData.begin);
            console.log('Reservation ends: ' + $scope.formData.end);

            $scope.incorrectInterval = $scope.formData.begin > $scope.formData.end;

            if ($scope.incorrectInterval) return;
    
            /* TODO: check if time interval violates other reservations */
            
            var targetResource = findResource($scope.formData.resource_id);
    
            targetResource.reservationslist.push($scope.formData);
    
            var sorted_intervals = targetResource.reservationslist.sort(compareTimeIntervals);
    
            $scope.intervalViolation = checkIntervalViolation(targetResource.reservationslist);
                    
            console.log('Sorted:');
            console.log(sorted_intervals);
    
            console.log('Violation:',$scope.intervalViolation);
            if ($scope.intervalViolation) return;
            
            var postData = JSON.stringify($scope.formData);
    
            console.log( postData);
    
            $http.post("/api/reservations", $scope.formData, {headers: {'Content-Type': 'application/json'}})
            .then(function(response) {
                console.log(response);
                $scope.formData = {};
                $scope.notificationActive = true;

                console.log('Response');
                console.log(response);
                $scope.isSubmittingData  = false;

               $window.location.href = '/reservations/' + response.data.reservation._id;
                
               // $scope.settlements = response.data.settlements;
                /*
                $scope.reverse = false;
                $scope.orderByParam = "";
                */
                //$scope.total = response.data.total;
                //$scope.maxPage = Math.floor($scope.total / $scope.limitRecords) + ($scope.total % $scope.limitRecords > 0 ? 1 : 0);
                }, function() { $scope.isSubmittingData = false;});
        }
        $scope.isSubmittingData = false;
    };
}]);
