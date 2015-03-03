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
      removeAllCoords: function () {
        return Coords.remove({});
      }
    });
  });
}

if (Meteor.isClient) {
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
          center: new google.maps.LatLng(53.0, -113.0),
          zoom: 10
        };
      }
    }
  });


  Template.body.created = function() {
  // We can use the `ready` callback to interact with the map API once the map is ready.
  GoogleMaps.ready('exampleMap', function(map) {
    // Add a marker to the map once it's ready
    var marker = new google.maps.Marker({
      position: map.options.center,
      map: map.instance
    });
  });
  };
 }
