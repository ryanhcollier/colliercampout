import fs from 'fs';
import { chaptersArray } from './src/data/journey.js';

const token = process.env.VITE_MAPBOX_TOKEN;

async function generate() {
    console.log("Generating Route Legs via Mapbox Directions API...");
    const routeLegs = [];

    for (let i = 1; i < chaptersArray.length; i++) {
        const start = chaptersArray[i-1];
        const end = chaptersArray[i];

        // Format: longitude,latitude
        let coordsString = `${start.center[0]},${start.center[1]}`;
        
        if (end.waypoints && end.waypoints.length > 0) {
            for (const wp of end.waypoints) {
                coordsString += `;${wp[0]},${wp[1]}`;
            }
        }
        
        coordsString += `;${end.center[0]},${end.center[1]}`;

        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsString}?overview=full&geometries=geojson&access_token=${token}`;
        
        try {
            console.log(`Fetching route from ${start.title} to ${end.title}...`);
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.routes && data.routes.length > 0) {
                const coords = data.routes[0].geometry.coordinates;
                routeLegs.push(coords);
            } else {
                console.error(`No route found for ${start.title} to ${end.title}:`, data);
                // Fallback to straight line
                routeLegs.push([start.center, end.center]);
            }
            
            // tiny delay to prevent rate limiting
            await new Promise(r => setTimeout(r, 200));
        } catch(e) {
            console.error(`Error on leg ${i}`, e);
            routeLegs.push([start.center, end.center]);
        }
    }

    fs.writeFileSync('./src/data/routeLegs.json', JSON.stringify(routeLegs));
    console.log("Finished generating routeLegs.json!");
}

generate();
