

// TODO flow
/*
  get values from input location
  geocode input location to get the lat long
  create places request object using that info, specify distance and such
    will probably use knock out to get other request info to filter results
  execute the places request and push results into markers array
  diplay markers array onto the map and the list on the side
    markers may need to be geocoded as well before display
  user should be able to click either one
*/



// Basically our model ////////////////////

// Global Maps services
var map;
var geocoder;
var places;
var markers = [];
var largeInfoWindow;
var streetView;


function initMap() {
  // Constructor creates a new map - only center and zoom are required
  var loc = {lat: 33.8688, lng: 151.2093}; // Default lat lng for sydney
  map = new google.maps.Map(document.getElementById('map'), {
    center: loc,
    zoom: 14
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
  codeAddress("sydney");
  // generateMarkers(locationLatLng);
  showMarkers("sydney");
  // Fill the side bar with the different markers
  // populateVisualMarkerArray();
}


// Geocode a given address
function codeAddress(locationInput) {
  geocoder.geocode( {'address': locationInput}, function(results, status) {
    if (status == 'OK') {
      map.setCenter(results[0].geometry.location);
      // locationLatLng = results[0].geometry.location;
      generateMarkers(results[0].geometry.location);
    }
    else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}


// Generate places markers
function generateMarkers(inputLatLng) {
  // Get relevant places near the searched area
  places.nearbySearch({
    location: inputLatLng,
    radius: 1000
  }, function generate(results, status) {
   if (status === google.maps.places.PlacesServiceStatus.OK) {
     for (var i = 0; i < results.length; i++) {
       var place = results[i];
       var marker = new google.maps.Marker({
         map: map,
         title: place.name,
         position: place.geometry.location
       });
       marker.addListener('click', function() {
         populateInfoWindow(this, largeInfoWindow);
       });
       // Push to markers array
       markers.push(marker);
     }
   }
   else {
     alert("Places request failed, status = " + status);
   }
  });
}


// This function will loop through the markers array and display them all.
function showMarkers(inputLocation) {
  largeInfoWindow.setContent("");
  largeInfoWindow.marker = null;

  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
  // Center around the entered area
  geocoder.geocode(
    { address: inputLocation }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        map.setZoom(15);
      } else {
        window.alert('We could not find that location - try entering a more' +
            ' specific place.');
      }
    });
}


// This function will loop through the listings and remove them
function hideMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  // Clear the array
  markers = [];
}


// This function adds information to a markers corrisponding infoWindow and
//  displays the marker's location information when a marker is clicked
function populateInfoWindow(marker, infoWindow) {
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
}


function update(inputLocation) {
  hideMarkers();
  codeAddress(inputLocation);
  showMarkers(inputLocation);
}


// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function AppViewModel() {
    var self = this;

    self.inputLocation = ko.observable();

    // KO array of our markers
    self.visualMarkers = ko.observableArray([]);

    // TODO When we start getting marker info from maps, we will need to flush
    //        the markers array and then refill it with necessary info
    self.run = function() {
      update(self.inputLocation());
      //self.markers.push( new Marker(self.inputLocation()) );
      // Empty visualMarkers array everytime we update
      self.visualMarkers([]);
      console.log('waffles');
      for(var i = 0; i < markers.length; i++) {
        console.log("pushing " + markers[i]);
        self.visualMarkers.push(markers[i]);
      }
    }
}
// Activates knockout.js
ko.applyBindings(new AppViewModel());
