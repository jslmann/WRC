Coords = new Meteor.Collection("Coords");

// Router
Router.route('/', {
  waitOn: function () {
    return Meteor.subscribe('Coords');
  },
  action: function () {
    if (this.ready())
      return true;
  }
});

if (Meteor.isServer) {
  Meteor.startup(function () {
    // Publicaciones
    Meteor.publish('Coords', function () {
      return Coords.find();
    });

    return Meteor.methods({
      // see below for how this is used... or not
      // called with Meteor.call('removeAllCoords')
      removeAllCoords: function () {
        return Coords.remove({});
      }
    });
  });
}

if (Meteor.isClient) {
  var map;
  var directionsDisplay;
  var directionsService;
  var pointsArr = new Array();

  // counter starts at 0
  Session.setDefault('counter', 0);
  Meteor.startup(function() {
    GoogleMaps.load();
  });

//   Template.hello.helpers({
//     counter: function () {
//       return Session.get('counter');
//     }
//   });
//
//   Template.hello.events({
//     'click button': function () {
//       // increment the counter when button is clicked
//       Session.set('counter', Session.get('counter') + 1);
//     }
//   });

  Template.body.helpers({
    exampleMapOptions: function() {
      // Make sure the maps API has loaded
      if (GoogleMaps.loaded()) {
        // Map initialization options
        return {
          center: new google.maps.LatLng(43.0, -113.0),
          zoom: 10
        };
      }
    }
  });


  Template.body.created = function() {
    console.log("body created");
  // We can use the `ready` callback to interact with the map API once the map is ready.
  GoogleMaps.ready('exampleMap', function(map) {
    // Add a marker to the map once it's ready
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

    function addLatLng(event) {
      console.log("map click event!");
      // Add coordinates into db
      var point = {
        'lat': event.latLng.lat(),
        'lng': event.latLng.lng()
      };
      // this is supposed to make a new marker.. ad hoc
      // taken from above
      new google.maps.Marker({
        position: new google.maps.LatLng(event.latLng.lat(), event.latLng.lng()),
        map: map,
        name: 'Alphonso'
      });
      Coords.insert(point);
    }
  });
  };
 }
