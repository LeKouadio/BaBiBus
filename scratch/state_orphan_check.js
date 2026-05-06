const fs = require('fs');
const content = fs.readFileSync('init-db.sql', 'utf8');

let inStops = false;
let inLineStops = false;
const stops = new Set();
const usedStops = new Set();

content.split('\n').forEach(line => {
    if (line.includes('INSERT INTO stops')) {
        inStops = true;
        inLineStops = false;
    } else if (line.includes('INSERT INTO bus_lines')) {
        inStops = false;
    } else if (line.includes('INSERT INTO line_stops')) {
        inLineStops = true;
        inStops = false;
    } else if (line.includes('INSERT INTO notifications')) {
        inLineStops = false;
    }

    if (inStops) {
        const match = line.match(/\((\d+),/);
        if (match) stops.add(parseInt(match[1]));
    }
    if (inLineStops) {
        const matches = line.matchAll(/\(\d+,\s*(\d+),/g);
        for (const m of matches) {
            usedStops.add(parseInt(m[1]));
        }
    }
});

const orphans = Array.from(stops).filter(id => !usedStops.has(id));
console.log('Orphans found:', orphans.length);
if (orphans.length > 0) {
    console.log('Orphan IDs:', orphans);
} else {
    console.log('No orphans found in stops table.');
}
