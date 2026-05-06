const fs = require('fs');

const sql = fs.readFileSync('init-db.sql', 'utf8');

// Even more robust regex for stops: (id, 'name', 'address', lat, long)
// Handles escaped single quotes '' and \'
const stopRegex = /\((\d+),\s*'((?:''|\\'|[^'])*)',\s*'((?:''|\\'|[^'])*)',\s*([\d.-]+),\s*([\d.-]+)\)/g;
const stops = [];
let match;
while ((match = stopRegex.exec(sql)) !== null) {
    stops.push({
        id: parseInt(match[1]),
        name: match[2].replace(/''/g, "'").replace(/\\'/g, "'"),
        address: match[3].replace(/''/g, "'").replace(/\\'/g, "'"),
        lat: parseFloat(match[4]),
        lng: parseFloat(match[5])
    });
}

// Regex for line_stops: (line_id, stop_id, position)
const lineStopRegex = /\((\d+),\s*(\d+),\s*(\d+)\)/g;
const usedStopIds = new Set();
while ((match = lineStopRegex.exec(sql)) !== null) {
    usedStopIds.add(parseInt(match[2]));
}

const orphanStops = stops.filter(stop => !usedStopIds.has(stop.id));

console.log('Total stops found in table:', stops.length);
console.log('Orphan stops count:', orphanStops.length);
if (orphanStops.length > 0) {
    console.log('Orphan stops (ID, Name):');
    orphanStops.forEach(s => console.log(`${s.id}: ${s.name}`));
}

// Check for used stops that are missing from stops table
const stopIdsInTable = new Set(stops.map(s => s.id));
const missingStopsUsed = Array.from(usedStopIds).filter(id => !stopIdsInTable.has(id));
if (missingStopsUsed.length > 0) {
    console.log('Used stop IDs that are MISSING from stops table:', missingStopsUsed);
}
