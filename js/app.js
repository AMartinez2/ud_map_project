var locations = [
  {title: 'Lincoln Memorial', location: {lat: 38.8892686, lng: -77.0501761}},
  {title: 'The White House', location: {lat: 38.8976763, lng: -77.0365298}},
  {title: 'Washington Monument', location: {lat: 38.8894839, lng: -77.0352791}},
  {title: 'Lincoln Memorial Reflecting Pool', location: {lat: 38.8893459, lng: -77.0447157}},
  {title: 'United States Capitol', location: {lat: 38.8899389, lng: -77.0090505}},
  {title: 'Thomas Jefferson Memorial', location: {lat: 38.8813959, lng: -77.0364569}},
  {title: 'Hirshhorn Museum', location: {lat: 38.888236, lng: -77.0230138}},
  {title: 'Holocaust Memorial Museum', location: {lat: 38.8867076, lng: -77.0326074}},
  {title: 'National Archives Building', location: {lat: 38.8928229, lng: -77.0229648}},
  {title: 'International Spy Museum', location: {lat: 38.896945, lng: -77.0236171}},
  {title: 'Smithsonian Institution', location: {lat: 38.8859942, lng: -77.0212813}},
  {title: 'Folger Shakespeare Library', location: {lat: 38.8893719, lng: -77.0027549}},
  {title: 'Smithsonian Castle', location: {lat: 38.88878241, lng: -77.02601686}},
];
var styles = [
{
    "featureType": "all",
    "elementType": "labels.text.fill",
    "stylers": [
        {
            "saturation": 36
        },
        {
            "color": "#000000"
        },
        {
            "lightness": 40
        }
    ]
},
{
    "featureType": "all",
    "elementType": "labels.text.stroke",
    "stylers": [
        {
            "visibility": "on"
        },
        {
            "color": "#000000"
        },
        {
            "lightness": 16
        }
    ]
},
{
    "featureType": "all",
    "elementType": "labels.icon",
    "stylers": [
        {
            "visibility": "off"
        }
    ]
},
{
    "featureType": "administrative",
    "elementType": "geometry.fill",
    "stylers": [
        {
            "color": "#000000"
        },
        {
            "lightness": 20
        }
    ]
},
{
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [
        {
            "color": "#000000"
        },
        {
            "lightness": 17
        },
        {
            "weight": 1.2
        }
    ]
},
{
    "featureType": "landscape",
    "elementType": "geometry",
    "stylers": [
        {
            "color": "#000000"
        },
        {
            "lightness": 20
        }
    ]
},
{
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
        {
            "color": "#000000"
        },
        {
            "lightness": 21
        }
    ]
},
{
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [
        {
            "color": "#000000"
        },
        {
            "lightness": 17
        }
    ]
},
{
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
        {
            "color": "#000000"
        },
        {
            "lightness": 29
        },
        {
            "weight": 0.2
        }
    ]
},
{
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
        {
            "color": "#000000"
        },
        {
            "lightness": 18
        }
    ]
},
{
    "featureType": "road.local",
    "elementType": "geometry",
    "stylers": [
        {
            "color": "#000000"
        },
        {
            "lightness": 16
        }
    ]
},
{
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
        {
            "color": "#000000"
        },
        {
            "lightness": 19
        }
    ]
},
{
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
        {
            "color": "#8397a0"
        },
        {
            "lightness": 17
        }
    ]
}
];

// Globals
var markers = [];
var infoWindow;
var map;
var geocoder;
var streetView;
var bounds;
var wikiPage;


// Inital call function
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 38.88995829, lng: -77.02966092}, // Default center of map
    zoom: 13,
    mapControl: true,
    mapTypeControlOptions: {
           style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
           position: google.maps.ControlPosition.BOTTOM_CENTER
         },
    styles: styles
  });
  // Init our infoWindow
  infoWindow = new google.maps.InfoWindow();
  // Init the geocoder
  geocoder = new google.maps.Geocoder();
  // Init streetView
  streetView = new google.maps.StreetViewService();

  bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < locations.length; i++) {
    // Create a marker
    var marker = new google.maps.Marker({
      position: locations[i].location,
      title: locations[i].title,
      animation: google.maps.Animation.DROP,
      id: i
    });
    // Push the info to the markers array
    markers.push({
      title:    marker.title,
      position: marker.position,
      marker:   marker,
      trim:     marker.title.replace(/\s/g, '-') // For assigning id to html elements
    });
    bounds.extend(marker.position);
    // Create Marker Listener
    createListener(marker);
    marker.setMap(map);
    // codeAddress(Locations[i]);
  }
  map.fitBounds(bounds);
  // Apply bindings once google finished is setup
  ko.applyBindings(new AppViewModel());
}


function createListener(marker) {
  marker.addListener('click', function() {
    getWikiPage(this.title, this);
    // populateInfoWindow(this, infoWindow);
  });
}


// Fill a marker's info window when clicked
function populateInfoWindow(marker, infoWindow, windowInfo) {

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
    var radius = 40;

    // Get panoramic street view for given marker
    streetView.getPanoramaByLocation(marker.position, radius, function (data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        var location = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(
          location, marker.position);
          // Data to be displayed in window
        infoWindow.setContent(windowInfo);
        var panoramaOptions = {
          position: location,
          pov: {
            heading: heading,
            pitch: 30
          }
        };
        // Bind
        var panorama = new google.maps.StreetViewPanorama(
          document.getElementById('pano'), panoramaOptions);
      } else {
        infoWindow.setContent('<div><h3>' + marker.title + marker.position + '</h3></div>' +
          '<div>No Street View Found</div>');
      }
    });
    // Open our infoWindow
    infoWindow.open(map, marker);
  }
}

// Wikipedia Api Call Function
function getWikiPage(title, marker) {
  var ntitle = title.replace(/\s/g, '');
  var url = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' +
              ntitle + '&format=json&callback=wikiCallback';
  var timeout = setTimeout(function() {
    var windowInfo =  "<div id='pano'></div>" +
                "<div id='wikiLink'>" +
                  "<h2>" + title + "</h2>" +
                  "<a href='#'>Unable to load Wikipedia information</a></div>";
  }, 8000);
  // Ajax call, then pass info to populateInfoWindow
  $.ajax({
    url: url,
    dataType: 'jsonp',
    async: false,
    cache: false,
    type: "GET"
  }).done(function(data) {
    var li = data[1];
    var windowInfo = "<div id='pano'></div>" +
              "<div id='wikiLink'>" +
                "<h2>" + title + "</h2>" +
                "<a href='http://en.wikipedia.org/wiki/" +
                li[0] + "'>Wikipedia Article</a></div>";
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    }
    else {
      marker.setAnimation(google.maps.Animation.DROP);
    }
    populateInfoWindow(marker, infoWindow, windowInfo);
    clearTimeout(timeout);
  }).fail(function(data) { // Something went wrong
    var windowInfo = "<div id='pano'></div>" +
                "<div id='wikiLink'>" +
                  "<h2>" + title + "</h2>" +
                  "<a href='#'>Unable to load Wikipedia information</a></div>";
    populateInfoWindow(marker, infoWindow, windowInfo);
  });
}

// Toggles css rules
function toggle() {
  var button = document.getElementById('show-menu');
  var menu = document.getElementById('side-menu');
  var map = document.getElementById('map');
  // Hide menu
  if (button.classList[0] == 'hidden') {
    button.classList.remove('hidden');
    menu.classList.add('hidden');
    map.classList.add('stretch');
    google.maps.event.trigger(map, 'resize');
  }
  // Show menu
  else {
    button.classList.add('hidden');
    menu.classList.remove('hidden');
    map.classList.remove('stretch');
    google.maps.event.trigger(map, 'resize');
  }
}


// An item in the location list was clicked
// Argument will be a DOM element. Use element id to compare to `marker.trim`
function clicked(nodeId) {
  console.log("waffles");
  markers.forEach(function(marker) {
				if (marker.trim == nodeId) {
          google.maps.event.trigger(marker.marker, 'click');
				}
  });
}


// Our AppViewModel
function AppViewModel() {
  var self = this;
  self.tog = function() {
    toggle();
  }
  self.cl = function(node) {
    clicked(node);
  }
  // textInput
  self.inputLocation = ko.observable("");

  self.markerList = ko.computed(function() {
    var fill = self.inputLocation().toLowerCase();
    // If there is something in the filter input, apply the filter to the markers
    if (fill) {
      return ko.utils.arrayFilter(markers, function(mk) {
        // If there is no match, indexOf() returns -1
        var ft = mk.title.toLowerCase().indexOf(fill) !== -1;
        if (ft) {
          mk.marker.setVisible(true);
        }
        else {
          mk.marker.setVisible(false);
        }
        return ft;
      });
    }
    // If there is no input, just display all markers
    else {
      for (var i = 0; i < markers.length; i++) {
        if (markers[i].marker) {
          markers[i].marker.setVisible(true);
        }
      }
      return markers;
    }
  });
}


// Error handling for google maps on fail
function mapsError() {
    alert("Google Maps could not be loaded.");
}
