var locations = [
  {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
  {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
  {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
  {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
  {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
  {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
]

var markers = [];
var infoWindow;
var map;
var geocoder;
var streetView
var bounds;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7180628, lng: -73.9961237},
    zoom: 13,
    mapControl: true,
    mapTypeControlOptions: {
           style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
           position: google.maps.ControlPosition.BOTTOM_CENTER
         }
  });
  // Init our infoWindow
  infoWindow = new google.maps.InfoWindow();
  // Init the geocoder
  geocoder = new google.maps.Geocoder();
  // Init streetView
  streetView = new google.maps.StreetViewService();

  bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < locations.length; i++) {
    var marker = new google.maps.Marker({
      position: locations[i].location,
      title: locations[i].title,
      animation: google.maps.Animation.DROP,
      id: i
    });
    markers.push({
      title:    marker.title,
      position: marker.position,
      marker:   marker
    });
    bounds.extend(marker.position);
    marker.addListener('click', function() {
      populateInfoWindow(this, infoWindow);
    });
    marker.setMap(map);
    // codeAddress(Locations[i]);
  }
  map.fitBounds(bounds);
  // Apply bindings once google finished is setup
  ko.applyBindings(new AppViewModel());
}

// // Geocode a given address
// function codeAddress(place) {
//   var address = place.adr;
//
//   geocoder.geocode( {'address': address}, function(results, status) {
//     if (status == 'OK') {
//       var marker = new google.maps.Marker({
//         map: map,
//         title: place.name,
//         position: results[0].geometry.location
//       });
//       bounds.extend(marker.position);
//       // Add event listener
//       marker.addListener('click', function() {
//         self.populateInfoWindow(this, infoWindow);
//       });
//       // Push to the markers array
//       markers.push({
//         name: marker.title,
//         marker: marker
//       });
//     }
//     else {
//       alert('Geocode was not successful for the following reason: ' + status);
//     }
//   });
// };


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
    map.panTo(marker.position);
    infoWindow.setContent("<div>" + marker.title + "</div>");
    // Add that young streetview to the infoWindow if possible
    var radius = 40;

    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        var location = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(
          location, marker.position);
        infoWindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
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
        infoWindow.setContent('<div>' + marker.title + marker.position + '</div>' +
          '<div>No Street View Found</div>');
      }
    }
    streetView.getPanoramaByLocation(marker.position, radius, getStreetView);
    infoWindow.open(map, marker);
  }
}



function AppViewModel() {
  var self = this;
  // textInput
  self.inputLocation = ko.observable("");

  self.markerList = ko.computed(function() {
    var fill = self.inputLocation().toLowerCase();
    if (!fill) {
      for (var i = 0; i < markers.length; i++) {
        if (markers[i].marker) {
          markers[i].marker.setVisible(true);
        }
      }
      return markers;
    } else {
      return ko.utils.arrayFilter(markers, function(mk) {
        // If there is no match, indexOf() returns -1
        var select = mk.title.toLowerCase().indexOf(self.inputLocation()) !== -1;
        if (select) {
          mk.marker.setVisible(true);
        } else {
          mk.marker.setVisible(false);
        }
        return select;
      });
    }
  });
}
