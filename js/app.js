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
]

var markers = [];
var infoWindow;
var map;
var geocoder;
var streetView
var bounds;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 38.88995829, lng: -77.02966092},
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
          var windowData = '<div>' +
                              marker.title +
                            '</div><div id="pano">' +
                          '</div>' +
                          '<div id="wikiLink"><h4>Related Wiki Articles</h4></div>';
        infoWindow.setContent(windowData);
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
          '<div>No Street View Found</div><div id="wikiLink"></div>');
      }
    }
    streetView.getPanoramaByLocation(marker.position, radius, getStreetView);
    // Call to get relevant wikipedia page for clicked marker
    getWikiPage(marker.title);
    infoWindow.open(map, marker);
    console.log("waffles");

  }
}

// Wikipedia Api Call Function
function getWikiPage(title) {
  var $wikiLink = $('#wikiLink');
  console.log(title);
  title = title.replace(/\s/g, '');
  var url = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' +
              title + '&format=json&callback=wikiCallback';
console.log("url: " + url);
  var timeout = setTimeout(function() {
     $wikiLink.text("Failed to get wikipedia resources");
  }, 8000);

  $.ajax({
    url: url,
    dataType: 'jsonp',
    success: function(data) {
      var $wiki = $('#wikiLink');
      var list = data[1];
      for (var i = 0; i < list.length; i++) {
        var url = 'http://en.wikipedia.org/wiki/' + list[i];
        $wiki.append('<li><a href="' + url + '">' + list[i] + '</a></li>').html;
      };
      clearTimeout(timeout);
    }
  });
}


// An item in the location list was clicked
function clicked(locationName) {
  markers.forEach(function(marker) {
				if (marker.title == locationName) {
          google.maps.event.trigger(marker.marker, 'click');
				}
  });
}


// Our AppViewModel
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
        var select = mk.title.toLowerCase().indexOf(fill) !== -1;
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
