/* Init map */
function initMap() {
    // Try HTML5 geolocation
    // Get current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            setCurrentLocation,
            browserGeolocationFail,
            { maximumAge: 50000, timeout: 20000, enableHighAccuracy: true }
        );
    } else {
        alert('Error: Your browser doesn\'t support geolocation.');
    }
}

/* Set center map and marker */
var setCurrentLocation = function (position) {
    // New map, Initial center to "Rayong"
    var map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 12.6814, lng: 101.2816 },
        zoom: 15
    });
    var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };

    // Set center
    map.setCenter(pos);

    // Add marker
    var marker = new google.maps.Marker({
        position: pos,
        label: "SOS",
        map: map,
        draggable: true
    });

    // New geocoder
    var geocoder = new google.maps.Geocoder;

    // Call function set location info
    updateLocation(geocoder, pos);

    // Get new location from marker after drag
    google.maps.event.addListener(marker, 'dragend', function (event) {
        updateLocation(geocoder, { lat: event.latLng.lat(), lng: event.latLng.lng() });
    });
};

/* Update coordinates and address after drag merker */
function updateLocation(geocoder, latlng) {
    document.getElementById('latitude').value = latlng.lat;
    document.getElementById('longitude').value = latlng.lng;
    geocoder.geocode({
        'location': latlng
    }, function (results, status) {
        if (status === 'OK') {
            if (results[0]) {
                document.getElementById('address').value = results[0].formatted_address;
            } else {
                alert('Info: No results found');
            }
        } else {
            alert('Error: Geocoder failed due to: ' + status);
        }
    });
}

/* Case browser can not get geolocation */
var browserGeolocationFail = function (error) {
    switch (error.code) {
        case error.TIMEOUT:
            alert("Browser geolocation error !\n\nTimeout.");
            break;
        case error.PERMISSION_DENIED:
            if (error.message.indexOf("Only secure origins are allowed") == 0) {
                tryAPIGeolocation();
            }
            break;
        case error.POSITION_UNAVAILABLE:
            // dirty hack for safari
            if (error.message.indexOf("Origin does not have permission to use Geolocation service") == 0) {
                tryAPIGeolocation();
            } else {
                alert("Browser geolocation error !\n\nPosition unavailable.");
            }
            break;
    }
};