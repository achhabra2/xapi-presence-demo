'use strict';

(function () {
  const socket = io();
  socket.on('hello', function (socket) {
    console.log('connected via socket');
  });
  var placesByIp = {};

  socket.on('codecs', function (codecs) {
    console.log('Received Codecs: ');
    console.log(codecs);
      for (var codec in codecs) {
        if (placesByIp[codec])
          setTooltipContentOnPlace('Count: ' + codecs[codec].lastCount, placesByIp[codec], map);
      }
  });

  socket.on('PeopleCount', function (payload) {
    console.log('Received PC Payload: ');
    console.log(payload);
    if (placesByIp[payload.ip])
      setTooltipContentOnPlace('Count: ' + payload.data, placesByIp[payload.ip], map);
  });

  var VENUEID = '5a4bef3d1d003100139e8f79'; //Demo venue

  Mapwize.setApiKey('4ea25aee513eb288c47affd26a7988bf'); // PASTE YOU API KEY HERE !!! This is a demo key, giving you access to the demo building. It is not allowed to use it for production. The key might change at any time without notice.

  var placeLayerByPlaceName = {};

  //Call this function once to add the tooltip on the map
  function addTooltipOnPlace(text, place, map) {
    var placeLayer = L.GeoJSON.geometryToLayer(place.geometry);
    //set style of new placeLayer to no style (no fill, no stroke) otherwise when binding a tooltip will create layer with default style
    placeLayer.setStyle({
      fillOpacity: 0,
      opacity: 0
    });
    placeLayer.bindTooltip(text, { direction: 'top', permanent: true, className: 'tooltip' }).addTo(map);
    placeLayerByPlaceName[place.name] = placeLayer;
  }

  //Call this function (incomplete) to update place style if we choose to.  Probably would be better to actually update with map.setPlaceStyle(placeId, style) since layer with tooltip is already defined as blank
  function changeAvailability(place, map, availability) {
    var placeLayer = L.GeoJSON.geometryToLayer(place.geometry);
    //set style of current place
    placeLayer.setStyle({
      fillOpacity: 0,
      opacity: 0
    });

    //Doc for setStyle: https://github.com/Mapwize/mapwize.js-dist/blob/master/doc/doc.md#_place-style
    //Options for setStyle are:
    //{
    // 		markerUrl: string (An url to the icon of the marker. Must be an image, ideally png, square, 100*100 pixels),
    //    strokeColor: string (The color of the shape border as #hex),
    //    strokeOpacity: number (The opacity of the border, between 0 and 1),
    //    strokeWidth: number (The width of the border),
    //    fillColor: string (The color of the inside of the shape as #hex),
    //    fillOpacity: number (The opacity of the inside, between 0 and 1),
    //    labelBackgroundColor: string (The color of the backgroud of the label as #hex),
    //    labelBackgroundOpacity: number (The opacity of the background of the label, between 0 and 1)
    // }

  }

  //Call this function every time you want to update the tooltip text
  function setTooltipContentOnPlace(text, place) {
    var placeLayer = placeLayerByPlaceName[place.name];
    placeLayer.setTooltipContent(text);
  }

  //Gets map data and boundaries
  Mapwize.Api.getVenue(VENUEID, function (err, venue) {
    if (err) {
      console.error(err);
    }

    var venueBounds = new L.LatLngBounds(
      new L.LatLng(venue.latitudeMin, venue.longitudeMin),
      new L.LatLng(venue.latitudeMax, venue.longitudeMax)
    );

    //Create the map
    var map = Mapwize.map('map', {});

    //Fits the bounds of the map so the entire region is visible.
    map.fitBounds(venueBounds);

    //Retrieve the places of the venue
    Mapwize.Api.getPlaces({ venueId: VENUEID }, function (err, places) {
      console.log('getting places');
      //Key all places by a data element to easily retrieve later
      placesByIp = _.keyBy(places, 'data.ipAddress');
      //Add some tooltips
      for (var place of places) {
        addTooltipOnPlace('Count:', place, map);
      }

      socket.emit('getCodecs');

    });


  });

})()