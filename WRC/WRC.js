Costs = new Meteor.Collection("Costs");
Costs.attachSchema(new SimpleSchema({
  priceDiesel: {
    type: Number,
    label: "Price of Diesel",
    min: 0
  },
  driverCost: {
    type: Number,
    label: "Hourly cost of driver",
    min: 0
  },
}));

// Router
Router.route('/', {
  waitOn: function () {
    return Meteor.subscribe('Costs');
  },
  data: function () { // was action:
    if (this.ready())
      return true;
  }
});

Router.route('jmap');

Router.route('kmap');



// Server Code ************************************************
if (Meteor.isServer) {
  var cheerio =  Meteor.npmRequire('cheerio');
  //var someHTML = HTTP.get('http://google.com'); // fetched html
  //console.log('someHTML? :', someHTML); // and it worked!

  Meteor.startup(function () {
    // Publicaciones
    Meteor.publish('Costs', function () {
      return Costs.find();
    });

    return Meteor.methods({
      // see below for how this is used... or not
      // called with Meteor.call('removeAllCosts')
      removeAllCosts: function () {
        return Costs.remove({});
      }
    });
  });
}


// Client Code **********************************************
if (Meteor.isClient) {
  //mmap; // open up scope for deb
  var origin;

  //origin = "original";
  var directionsDisplay;
  var directionsService;
  var pointsArr = new Array();

  // counter starts at 0
  Session.setDefault('counter', 0);
  Meteor.startup(function() {
    GoogleMaps.load({
      libraries: 'places'
    });
  });

  function __addLatLng(event) {
    origin = map.center;
    if (! destination) {
      destination = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
    }
    else {
      origin = destination;
      destination = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
    }
    console.log("map click event!");
    // Add coordinates into db

    var request = {
      origin: origin,
      //waypoints: waypointsArr,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC
    };

    directionsService.route(request, function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
        console.log(response);
        console.log("total time:", response.routes[0].legs[0].duration.text);
        console.log("total distance:", response.routes[0].legs[0].distance.text);
        //console.log("total distance:", response.routes[0].legs[0].distance.value / 1000.0);
      }
    });


    console.log("lat: ", event.latLng.lat());
    // this is supposed to make a new marker.. ad hoc
    // taken from above
    new google.maps.Marker({
      position: destination,
      map: map,
      title: 'Alphonso',
      draggable: true
    });
  }



  Template.kmap.rendered = function() {
    Tracker.autorun(function () {
      // Tracker.autorun makes the function reactive (like templates)
      var start;
      var destination;
      var directionsService;
      var directionsDisplay;

      if (GoogleMaps.loaded()) {
        $("input#geocomplete").geocomplete({
          map: '.map_canvas',
          location: 'Edmonton, Alberta',
          mapOptions: {
            zoom: 10,
          //  center: new google.maps.LatLng(0.0,0.0)
          }
        })
        .bind("geocode:result", function(event, result){
          start = result.geometry.location;
          console.log('start', result);
        });

        mmap = $("input#geocomplete").geocomplete("map");

        // setup directions services and renderer from google and connect to mmap
        directionsService = new google.maps.DirectionsService();
        //google.maps.event.addListener(mmap, 'click', addLatLng);
        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setMap(mmap);

        // get info from destination input and make marker for it.
        // #todo: set color to green
        $("input#destination").geocomplete()
        .bind("geocode:result", function(event, result){
          destination = result.geometry.location;
          new google.maps.Marker({
            position: destination, //result.geometry.location,
            map: mmap // this worked !!
          });

          // setup request for directions
          var request = {
            origin: start,
            //waypoints: waypointsArr,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC
          };

          // get directions from google
          directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              directionsDisplay.setDirections(response);
              console.log(response);
              console.log("total time:", response.routes[0].legs[0].duration.text);
              console.log("total distance:", response.routes[0].legs[0].distance.text);
            }
          });

          //
        });
      }
    });
  };

  Template.kmap.events({
    'click button': function() {
      $('input').trigger('geocode');
    }
  });



/// ********** THIS IS UGLY *******************
// Template.jmap.created is called by meteor as soon as the template instance
// has been created but before it has been rendered.
Template.jmap.helpers({
  exampleMapOptions: function() {
    origin = Geolocation.currentLocation(); // This worked !!! (how??)
    // Make sure the maps API has loaded

    if (GoogleMaps.loaded()) {
      if (! origin) {
        return {
          center:  new google.maps.LatLng(0.0, 0.0),
          zoom: 10
        }
      }
      // Map initialization options
      console.log("in exampleMapOptions", origin);
      return {
        center: new google.maps.LatLng(origin.Costs.latitude, origin.Costs.longitude),
        zoom: 10
      };
    }
  }
});



  Template.jmap.created = function() {
    var  destination;

    // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('exampleMap', function(map) {
      // Add a marker to the map once it's ready

      // this map is not the same "map" as below..
      var marker = new google.maps.Marker({
        position: map.options.center,
        map: map.instance
      });

      //map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
      map = GoogleMaps.maps.exampleMap.instance;

      directionsService = new google.maps.DirectionsService();

      // Add listener
      google.maps.event.addListener(map, 'click', addLatLng);

      directionsDisplay = new google.maps.DirectionsRenderer();

      directionsDisplay.setMap(map);
      // we don't use this..
      //directionsDisplay.setPanel(document.getElementById('directions-panel'));

      // call back function for google map "click" event
      function addLatLng(event) {
        origin = map.center;
        if (! destination) {
          destination = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
        }
        else {
          origin = destination;
          destination = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
        }
        console.log("map click event!");
        // Add coordinates into db

        var request = {
          origin: origin,
          //waypoints: waypointsArr,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC
        };

        directionsService.route(request, function (response, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            console.log(response);
            console.log("total time:", response.routes[0].legs[0].duration.text);
            console.log("total distance:", response.routes[0].legs[0].distance.text);
            //console.log("total distance:", response.routes[0].legs[0].distance.value / 1000.0);
          }
        });

        var point = {
          'lat': event.latLng.lat(),
          'lng': event.latLng.lng()
        };

        console.log("lat: ", event.latLng.lat());
        // this is supposed to make a new marker.. ad hoc
        // taken from above
        new google.maps.Marker({
          position: destination,
          map: map,
          title: 'Alphonso',
          draggable: true
        });
        Costs.insert(point);
      }
    });
    };
  }
