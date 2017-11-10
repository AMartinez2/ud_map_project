function MapObject() {
  var self = this;

  // Map instance variables
  var map = null;
  var geocoder = null;
  var places = null;
  var markers = [];
  var largeInfoWindow = null;
  var streetView = null;

  self.init = function() {
    // Constructor creates a new map - only center and zoom are required
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 33.8688, lng: 151.2093},
      zoom: 13
    });

    // Init the geocoder
    geocoder = new google.maps.Geocoder();
    // Init places
    places = new google.maps.places.PlacesService(map);
    // Init our infoWindow
    largeInfoWindow = new google.maps.InfoWindow();
    // Init streetView
    streetView = new google.maps.StreetViewService();

    // Get default location and markers
    self.codeAddress("sydney");
    // Fill the side bar with the different markers
    // populateVisualMarkerArray();
  };


  // Geocode a given address
  self.codeAddress = function(locationInput) {
    geocoder.geocode( {'address': locationInput}, function(results, status) {
      if (status == 'OK') {
        map.setCenter(results[0].geometry.location);
        // locationLatLng = results[0].geometry.location;
        map.setZoom(15);
        self.generateMarkers(results[0].geometry.location);
      }
      else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  };


  // // Generate places markers
  self.generateMarkers = function(inputLatLng) {
    // Get relevant places near the searched area
    places.nearbySearch({
      location: inputLatLng,
      radius: 1000
    }, function(results, status) {
     if (status === google.maps.places.PlacesServiceStatus.OK) {
       for (var i = 0; i < results.length; i++) {
         var place = results[i];
         self.addMarker(place);
       }
     }
     else {
       alert("Places request failed, status = " + status);
     }
   });
  };


  // This function will loop through the listings and remove them
  self.hideMarkers = function() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    // Clear the array
    markers = [];
  };


  // Create and push to markers array
  self.addMarker = function(place) {
    var marker = new google.maps.Marker({
      map: map,
      title: place.name,
      position: place.geometry.location
    });
    marker.addListener('click', function() {
      self.populateInfoWindow(this, largeInfoWindow);
    });
    markers.push(marker)
  }


  // This function adds information to a markers corrisponding infoWindow and
  //  displays the marker's location information when a marker is clicked
  self.populateInfoWindow = function(marker, infoWindow) {
    // Check to see if infoWindow is already on our clicked marker
    if (infoWindow.marker != marker) {
      // Clear the window
      infoWindow.setContent("");
      // assign our marker
      infoWindow.marker = marker;
      // Listen for window close
      infoWindow.addListener('closeclick', function() {
        infoWindow.marker = null;
      });
      infoWindow.setContent("<div>" + marker.title + "</div>");
      // Add that young streetview to the infoWindow if possible
      var radius = 40;

      function getStreetView(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          var location = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(
            location, marker.position);
          largeInfoWindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
          var panoramaOptions = {
            position: location,
            pov: {
              heading: heading,
              pitch: 30
            }
          };
          var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), panoramaOptions);
        } else {
          largeInfoWindow.setContent('<div>' + marker.title + '</div>' +
            '<div>No Street View Found</div>');
        }
      }
      streetView.getPanoramaByLocation(marker.position, radius, getStreetView);
      infoWindow.open(map, marker);
    }
  };
};


// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function AppViewModel() {
    var self = this;

    self.inputLocation = ko.observable();

    // KO array of our markers
    self.visualMarkers = ko.observableArray([]);

    self.run = function() {
      // TODO var mk = get_places(inputLocation) {google api call}
      console.log("before " + map.markers);
      map.hideMarkers();
      map.codeAddress(self.inputLocation());
      // Empty visualMarkers array everytime we update
      self.visualMarkers([]);
      console.log("after " + map.markers);
    }
}


// Create our Map Object
var map = new MapObject();
// Activates knockout.js
ko.applyBindings(new AppViewModel());
