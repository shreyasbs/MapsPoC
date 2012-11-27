var infoWindow;
var map;
var markers = [];
var drawPolygon;
var selectedMarkers = [];

$(document).ready(function () {
    initialize();
    $('#btnShowMap').click(function () {
        initialize();
    });
});


var initialize = function () {
    markers = [];

    extendForPolygonSelection();

    var mapOptions = {
        center: new google.maps.LatLng(55.7577, -110.4196),
        zoom: 4,
        maxZoom: 15,
        panControl: true,
        zoomControl: true,
        scaleControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("map_canvas"),
        mapOptions);

    var customControlDiv = document.createElement('div');
    customControlDiv.setAttribute('class', 'legendButtons');
    var polygonControl = new PolygonControl(customControlDiv);
    var autoZoomControl = new AutoZoomControl(customControlDiv);
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(customControlDiv);

    enablePolygon();
    showMarkers();
};

var showMarkers = function () {
    $('#chkPlaces option').each(function () {
        if (($(this).is(':selected'))) {
            var str = $(this).val().split(";");
            codeAddress(str[0], str[1]);
        }
    });
};

var codeAddress = function (address, icon) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            addMarkers(results[0].geometry.location, results[0].formatted_address, icon);
            enableAutoZoom();//Default enable auto zoom 
        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
};


var addMarkers = function (latlog, address, icon) {
    //var image = 'http://icons.iconarchive.com/icons/aha-soft/perfect-city/48/' + icon;
    var image = 'Assets/images/' + icon;
    var energyMarker = new google.maps.Marker({
        position: latlog,
        map: map,
        icon: image,
        title: address,
    });
    markers.push(energyMarker);

    //    google.maps.event.addListener(energyMarker, 'click', function () {
    //    });
};

var enableAutoZoom = function () {
    if (markers.length > 0) {
        var bounds = new google.maps.LatLngBounds();
        //  Go through each...
        $.each(markers, function (index, marker) {
            bounds.extend(marker.position);
        });
        //  Fit these bounds to the map
        map.fitBounds(bounds);
    }
    $('#pnlZoomOn').css('background-color', '#004976').css('cursor', 'default');
    $('#pnlZoomOff').css('background-color', '#747378').css('cursor', 'pointer');
};

var disableAutoZoom = function () {
    map.setCenter(new google.maps.LatLng(55.7577, -110.4196));
    map.setZoom(4);
    $('#pnlZoomOn').css('background-color', '#747378').css('cursor', 'pointer');
    $('#pnlZoomOff').css('background-color', '#004976').css('cursor', 'default');
};

var disablePolygon = function () {
    if (drawPolygon)
        drawPolygon.setMap(null);
    $('#pnlPolyOn').css('background-color', '#747378').css('cursor', 'pointer');
    $('#pnlPolyOff').css('background-color', '#004976').css('cursor', 'default');
};

var enablePolygon = function () {
    disablePolygon();
    drawPolygon = new google.maps.Polygon({
        strokeColor: '#51A8A2',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#51A8A2',
        fillOpacity: 0.35
    });
    drawPolygon.setMap(map);

    $('#pnlPolyOn').css('background-color', '#004976').css('cursor', 'default');
    $('#pnlPolyOff').css('background-color', '#747378').css('cursor', 'pointer');

    google.maps.event.addListener(map, 'click', fixPoint);
};

var fixPoint = function (e) {
    if (drawPolygon != null && drawPolygon.map != null) {
        var vertices = drawPolygon.getPath();
        vertices.push(e.latLng);

        selectedMarkers = [];

        $.each(markers, function (index, marker) {
            if (drawPolygon.Contains(marker.position) == true) {
                selectedMarkers.push(marker);
            }
        });

        $('#ulCustomerAddresses').empty();
        $('#ulProspectAddresses').empty();

        $.each(selectedMarkers, function (index, selectedMarker) {
            if (selectedMarker.icon.indexOf('pointer_green03.') >= 0) {
                $('#ulCustomerAddresses').append('<li>>> ' + selectedMarker.title + '</li>');
            }

            if (selectedMarker.icon.indexOf('pointer_red03.') >= 0) {
                $('#ulProspectAddresses').append('<li>>>  ' + selectedMarker.title + '</li>');
            }
        });
    }
};

var extendForPolygonSelection = function () {
    google.maps.Polygon.prototype.Contains = function (point) {
        // ray casting alogrithm http://rosettacode.org/wiki/Ray-casting_algorithm
        var crossings = 0,
            path = this.getPath();

        for (var i = 0; i < path.getLength() ; i++) {
            var a = path.getAt(i),
                j = i + 1;
            if (j >= path.getLength()) {
                j = 0;
            }
            var b = path.getAt(j);
            if (rayCrossesSegment(point, a, b)) {
                crossings++;
            }
        }

        // odd number of crossings?
        return (crossings % 2 == 1);

        function rayCrossesSegment(point, a, b) {
            var px = point.lng(),
                py = point.lat(),
                ax = a.lng(),
                ay = a.lat(),
                bx = b.lng(),
                by = b.lat();
            if (ay > by) {
                ax = b.lng();
                ay = b.lat();
                bx = a.lng();
                by = a.lat();
            }
            if (py == ay || py == by) py += 0.00000001;
            if ((py > by || py < ay) || (px > Math.max(ax, bx))) return false;
            if (px < Math.min(ax, bx)) return true;

            var red = (ax != bx) ? ((by - ay) / (bx - ax)) : Infinity;
            var blue = (ax != px) ? ((py - ay) / (px - ax)) : Infinity;
            return (blue >= red);
        }
    };
};

function AutoZoomControl(controlDiv) {
    controlDiv.style.padding = '5px';

    var labelControlUI = document.createElement('div');
    labelControlUI.innerHTML = '<label style="width: 120px;float: left;margin-left: -48px;clear: both;margin-top: 6px;">Auto Zoom</label>';
    controlDiv.appendChild(labelControlUI);

    var onControlUI = document.createElement('div');
    onControlUI.id = 'pnlZoomOn';
    onControlUI.style.backgroundColor = '#004976';
    onControlUI.style.float = 'left';
    onControlUI.style.border = '1px solid #000000';
    onControlUI.style.cursor = 'default';
    onControlUI.style.textAlign = 'center';
    onControlUI.style.width = '36px';
    onControlUI.style.marginTop = '-10px';
    onControlUI.style.marginLeft = '18px';
    onControlUI.style.marginLeft = '26px\0/IE9';
    onControlUI.title = 'Auto Zoom On';

    controlDiv.appendChild(onControlUI);
    var onControlText = document.createElement('div');
    onControlText.style.fontFamily = 'Arial,sans-serif';
    onControlText.style.fontSize = '12px';
    onControlText.style.color = '#ffffff';
    onControlText.style.paddingLeft = '4px';
    onControlText.style.paddingRight = '4px';

    onControlText.innerHTML = '<b>On<b>';
    onControlUI.appendChild(onControlText);

    var offControlUI = document.createElement('div');
    offControlUI.id = 'pnlZoomOff';
    offControlUI.style.backgroundColor = '#747378';
    offControlUI.style.float = 'right';
    offControlUI.style.border = '1px solid #000000';
    offControlUI.style.cursor = 'pointer';
    offControlUI.style.textAlign = 'center';
    offControlUI.style.width = '36px';
    offControlUI.style.marginTop = '-16px';
    offControlUI.style.marginTop = '-10px\0/IE9';
    offControlUI.style.marginLeft = '16px';
    offControlUI.style.marginLeft = '0px\0/IE9';
    offControlUI.title = 'Auto Zoom Off';

    controlDiv.appendChild(offControlUI);
    var offControlText = document.createElement('div');
    offControlText.style.fontFamily = 'Arial,sans-serif';
    offControlText.style.fontSize = '12px';
    offControlText.style.color = '#ffffff';
    offControlText.style.paddingLeft = '4px';
    offControlText.style.paddingRight = '4px';
    offControlText.innerHTML = '<b>Off<b>';
    offControlUI.appendChild(offControlText);

    google.maps.event.addDomListener(onControlUI, 'click', function () {
        enableAutoZoom();
    });

    google.maps.event.addDomListener(offControlUI, 'click', function () {
        disableAutoZoom();
    });
};

function PolygonControl(controlDiv) {
    controlDiv.style.padding = '5px';

    var labelControlUI = document.createElement('div');
    labelControlUI.style.width = 'auto';
    labelControlUI.style.float = 'left';
    labelControlUI.style.whiteSpace = 'nowrap';
    labelControlUI.innerHTML = '<label>Polygon Tool</label>';
    controlDiv.appendChild(labelControlUI);

    var onControlUI = document.createElement('div');
    onControlUI.id = 'pnlPolyOn';
    onControlUI.style.backgroundColor = '#004976';//'#E7E4EB';
    onControlUI.style.float = 'left';
    onControlUI.style.border = '1px solid #000000';
    onControlUI.style.cursor = 'default';
    onControlUI.style.textAlign = 'center';
    onControlUI.style.width = '36px';
    onControlUI.style.marginTop = '-15px';
    onControlUI.style.marginLeft = '40px';
    onControlUI.style.marginLeft = '48px\0/IE9';
    onControlUI.title = 'Polygon On';
    controlDiv.appendChild(onControlUI);
    var onControlText = document.createElement('div');
    onControlText.style.fontFamily = 'Arial,sans-serif';
    onControlText.style.fontSize = '12px';
    onControlText.style.color = '#ffffff';
    onControlText.style.paddingLeft = '4px';
    onControlText.style.paddingRight = '4px';
    onControlText.innerHTML = '<b>On<b>';
    onControlUI.appendChild(onControlText);

    var offControlUI = document.createElement('div');
    offControlUI.id = 'pnlPolyOff';
    offControlUI.style.backgroundColor = '#747378';
    offControlUI.style.float = 'right';
    offControlUI.style.border = '1px solid #000000';
    offControlUI.style.cursor = 'pointer';
    offControlUI.style.textAlign = 'center';
    offControlUI.style.width = '36px';
    offControlUI.style.marginTop = '-15px';
    offControlUI.style.marginLeft = '3px';
    offControlUI.title = 'Polygon Off';

    controlDiv.appendChild(offControlUI);
    var offControlText = document.createElement('div');
    offControlText.style.fontFamily = 'Arial,sans-serif';
    offControlText.style.fontSize = '12px';
    offControlText.style.color = '#ffffff';
    offControlText.style.paddingLeft = '4px';
    offControlText.style.paddingRight = '4px';
    offControlText.innerHTML = '<b>Off<b>';
    offControlUI.appendChild(offControlText);

    google.maps.event.addDomListener(onControlUI, 'click', function () {
        enablePolygon();
    });

    google.maps.event.addDomListener(offControlUI, 'click', function () {
        disablePolygon();
    });
};