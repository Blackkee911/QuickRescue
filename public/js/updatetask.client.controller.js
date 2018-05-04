$('#btnCancel').click(function () {
    window.open('tasklist', '_self');
});

/* Init map */
function initMap() {
    setCurrentLocation();
}

/* Set center map and marker */
var setCurrentLocation = function () {
    // New map, Initial center to "Rayong"
    var map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 12.6814, lng: 101.2816 },
        zoom: 15
    });

    var lat = Number(document.getElementById('latitude').value);
    var lng = Number(document.getElementById('longitude').value);

    var pos = {
        lat: lat,
        lng: lng
    };

    // Set center
    map.setCenter(pos);

    // Add marker
    var marker = new google.maps.Marker({
        position: pos,
        label: 'SOS',
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