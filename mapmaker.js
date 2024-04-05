const coord = [60.223671, 25.078039]
const zoom = 13
const leafmap = L.map('mapbox').setView(coord, zoom);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(leafmap);
const markergroup = L.layerGroup().addTo(leafmap);
