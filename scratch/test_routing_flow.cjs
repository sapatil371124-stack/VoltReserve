const axios = require('axios');

async function testRouting() {
  console.log("Testing OSRM real road navigation engine...");
  // User in College Road Nashik -> Destination: Expressway FastCharge Hub Mumbai Naka Nashik
  const originLng = 73.7621;
  const originLat = 20.0035;
  const destLng = 73.7850;
  const destLat = 19.9880;

  const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;
  const res = await axios.get(url, { timeout: 8000 });
  const route = res.data.routes[0];
  const distKm = (route.distance / 1000).toFixed(1);
  const durationMins = Math.round(route.duration / 60);

  console.log(`✓ Real Road Distance: ${distKm} km`);
  console.log(`✓ Real Travel Duration: ~${durationMins} min`);
  console.log(`✓ Road Waypoints Count: ${route.geometry.coordinates.length}`);
  console.log(`✓ Turn-by-turn Steps: ${route.legs[0].steps.length}`);
  console.log("Sample Step 1:", route.legs[0].steps[0].maneuver.type, route.legs[0].steps[0].name || "roadway");
  if (route.legs[0].steps.length > 1) {
    console.log("Sample Step 2:", route.legs[0].steps[1].maneuver.type, route.legs[0].steps[1].name || "roadway");
  }
}

testRouting().catch(console.error);
