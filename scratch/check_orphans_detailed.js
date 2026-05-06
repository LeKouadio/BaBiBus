const fs = require('fs');
const sql = fs.readFileSync('init-db.sql', 'utf8');

const stopRegex = /\((\d+),\s*'((?:''|\\'|[^'])*)',\s*'((?:''|\\'|[^'])*)',\s*([\d.-]+),\s*([\d.-]+)\)/g;
const stops = [];
let match;
while ((match = stopRegex.exec(sql)) !== null) {
    stops.push(parseInt(match[1]));
}

const lineStopRegex = /\((\d+),\s*(\d+),\s*(\d+)\)/g;
const usedStopIds = new Set();
while ((match = lineStopRegex.exec(sql)) !== null) {
    usedStopIds.add(parseInt(match[2]));
}

const orphanStops = stops.filter(id => !usedStopIds.has(id));

fs.writeFileSync('orphans_found.json', JSON.stringify(orphanStops, null, 2));
console.log('Orphans found:', orphanStops.length);
console.log(orphanStops);
