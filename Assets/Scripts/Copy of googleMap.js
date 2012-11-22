var infoWindow;
var map;
var markers = [];

$(document).ready(function () {
    initialize();
    $('#btnShowMap').click(function () {
        initialize();
    });
});


function initialize() {
    markers = [];
    var mapOptions = {
        center: new google.maps.LatLng(55.7577, -110.4196),
        zoom: 4,
        panControl: true,
        zoomControl: true,
        scaleControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("map_canvas"),
		mapOptions);

    // Create a DIV to hold the control and call HomeControl()
    var autoControlDiv = document.createElement('div');
    var autoZoomControl = new AutoZoomControl(autoControlDiv);
    //homeControlDiv.index = 2;
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(autoControlDiv);

    showMarkers();




    //	var image = 'http://icons.iconarchive.com/icons/famfamfam/mini/16/icon-home-icon.png';

    //	var marker = new google.maps.Marker({
    //		position: map.getCenter(),
    //		map: map,
    //		title: 'Click to zoom',
    //		icon: image
    //	});


    //	var myLatLng = new google.maps.LatLng(54, -109);
    //	var beachMarker = new google.maps.Marker({
    //		position: myLatLng,
    //		map: map,
    //		icon: image
    //	});


    //	var bermudaTriangle;

    //	map = new google.maps.Map(document.getElementById("map_canvas"),
    //      mapOptions);

    //	var triangleCoords = [
    //    new google.maps.LatLng(54.774252, -112.190262),
    //    new google.maps.LatLng(54.466465, -113.118292),
    //    new google.maps.LatLng(54.321384, -114.75737)
    //  ];

    //	bermudaTriangle = new google.maps.Polygon({
    //		paths: triangleCoords,
    //		strokeColor: "#FF0000",
    //		strokeOpacity: 0.8,
    //		strokeWeight: 3,
    //		fillColor: "#FF0000",
    //		fillOpacity: 0.35,
    //		editable: true
    //	});

    //	bermudaTriangle.setMap(map);

    //	// Add a listener for the click event
    //	google.maps.event.addListener(bermudaTriangle, 'click', showArrays);

    //	infowindow = new google.maps.InfoWindow();
}

var showMarkers = function () {
    $('#chkPlaces option').each(function () {
        if (($(this).is(':selected'))) {
            var str = $(this).val().split(";");
            //addMarkers(str[0], str[1], str[2]);
            codeAddress(str[0], str[1]);
        }
    });
};

var addMarkers = function (lat, log, icon) {
    var image = 'http://icons.iconarchive.com/icons/aha-soft/perfect-city/48/' + icon;
    var myLatLng = new google.maps.LatLng(lat, log);
    var energyMarker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        icon: image
    });
    google.maps.event.addListener(energyMarker, 'click', function () {
    });
};

var addMarkers = function (latlog, icon) {
    var image = 'http://icons.iconarchive.com/icons/aha-soft/perfect-city/48/' + icon;
    var energyMarker = new google.maps.Marker({
        position: latlog,
        map: map,
        icon: image
    });
    markers.push(energyMarker);
    
    google.maps.event.addListener(energyMarker, 'click', function () {
    });
};

function showArrays(event) {
    alert();
    // Since this Polygon only has one path, we can call getPath()
    // to return the MVCArray of LatLngs
    var vertices = this.getPath();

    var contentString = "<b>Bermuda Triangle Polygon</b><br />";
    contentString += "Clicked Location: <br />" + event.latLng.lat() + "," + event.latLng.lng() + "<br />";

    // Iterate over the vertices.
    for (var i = 0; i < vertices.length; i++) {
        var xy = vertices.getAt(i);
        contentString += "<br />" + "Coordinate: " + i + "<br />" + xy.lat() + "," + xy.lng();
    }

    // Replace our Info Window's content and position
    infowindow.setContent(contentString);
    infowindow.setPosition(event.latLng);

    infowindow.open(map);
}

var codeAddress = function(address, icon) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            addMarkers(results[0].geometry.location, icon);
        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
};


function AutoZoomControl(controlDiv) {
    controlDiv.style.padding = '5px';
    var onControlUI = document.createElement('div');
    onControlUI.style.backgroundColor = 'blue';
    onControlUI.style.border = '1px solid';
    onControlUI.style.cursor = 'pointer';
    onControlUI.style.textAlign = 'center';
    onControlUI.title = 'Auto Zoom';
    controlDiv.appendChild(onControlUI);
    var onControlText = document.createElement('div');
    onControlText.style.fontFamily = 'Arial,sans-serif';
    onControlText.style.fontSize = '12px';
    onControlText.style.paddingLeft = '4px';
    onControlText.style.paddingRight = '4px';
    onControlText.innerHTML = '<b>On<b>';
    onControlUI.appendChild(onControlText);

    var offControlUI = document.createElement('div');
    offControlUI.style.backgroundColor = 'blue';
    offControlUI.style.border = '1px solid';
    offControlUI.style.cursor = 'pointer';
    offControlUI.style.textAlign = 'center';
    offControlUI.title = 'Auto Zoom';
    controlDiv.appendChild(offControlUI);
    var offControlText = document.createElement('div');
    offControlText.style.fontFamily = 'Arial,sans-serif';
    offControlText.style.fontSize = '12px';
    offControlText.style.paddingLeft = '4px';
    offControlText.style.paddingRight = '4px';
    offControlText.innerHTML = '<b>Off<b>';
    offControlUI.appendChild(offControlText);
    
    google.maps.event.addDomListener(onControlUI, 'click', function () {
        enableAutoZoom();
    });

    google.maps.event.addDomListener(offControlUI, 'click', function() {
        disableAutoZoom();
    });
};


var enableAutoZoom = function () {
    var bounds = new google.maps.LatLngBounds();
    //  Go through each...
    $.each(markers, function (index, marker) {
        bounds.extend(marker.position);
    });
    //  Fit these bounds to the map
    map.fitBounds(bounds);
};

var disableAutoZoom = function () {
    map.setCenter(new google.maps.LatLng(55.7577, -110.4196));
    map.setZoom(4);
};