/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYW5pYTAyMTciLCJhIjoiY21nN3dieTJ1MDE0MjJtcXVzZWV5eTQwcCJ9.GxnXrNhRYOojmiBQeJnvRw';

  var map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/ania0217/cmg7x0hdg00ab01qwanve79xn', // style URL
    scrollZoom: false,
    // center: [-118.113491,34.111745], // starting position [lng, lat]
    // zoom: 9, // starting zoom
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
