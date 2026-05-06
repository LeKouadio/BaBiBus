
const fs = require('fs');

const sql = fs.readFileSync('init-db.sql', 'utf8');

// Parse stops
const stopMatches = sql.matchAll(/\((\d+),\s*'([^']+)',\s*'([^']+)',\s*([\d.-]+),\s*([\d.-]+)\)/g);
const stops = Array.from(stopMatches).map(m => ({
    id: parseInt(m[1]),
    name: m[2],
    address: m[3],
    lat: parseFloat(m[4]),
    lng: parseFloat(m[5])
}));

// Parse lines
const lineMatches = sql.matchAll(/\((\d+),\s*'([^']+)',\s*'([^']+)',\s*'#[A-F0-9]+'/g);
const lines = Array.from(lineMatches).map(m => ({
    id: parseInt(m[1]),
    number: m[2],
    name: m[3]
}));

// Parse existing line_stops to avoid duplicates
const lineStopMatches = sql.matchAll(/\((\d+),\s*(\d+),\s*(\d+)\)/g);
const existingLineStops = new Set(Array.from(lineStopMatches).map(m => `${m[1]}-${m[2]}`));

const neighborhoods = [
    'Plateau', 'Cocody', 'Yopougon', 'Marcory', 'Treichville', 'Adjamé', 
    'Abobo', 'Koumassi', 'Port-Bouët', 'Bingerville', 'Anyama', 'Songon', 'Attécoubé', 'Abatta', 'Angré', 'Riviera'
];

let newLineStops = [];

// For each line that has no stops or very few, add more
lines.forEach(line => {
    const currentStops = Array.from(lineStopMatches).filter(m => parseInt(m[1]) === line.id);
    
    // Find neighborhoods in line name
    const lineNeighborhoods = neighborhoods.filter(n => line.name.toLowerCase().includes(n.toLowerCase()));
    
    if (lineNeighborhoods.length > 0) {
        // Find orphan stops in these neighborhoods
        const lineNeighborhoodStops = stops.filter(s => 
            lineNeighborhoods.some(n => s.name.toLowerCase().includes(n.toLowerCase())) &&
            !existingLineStops.has(`${line.id}-${s.id}`)
        );
        
        // Take a subset (up to 12 stops)
        const stopsToAdd = lineNeighborhoodStops.slice(0, 12);
        
        stopsToAdd.forEach((stop, index) => {
            const pos = currentStops.length + index + 1;
            newLineStops.push(`(${line.id}, ${stop.id}, ${pos})`);
            existingLineStops.add(`${line.id}-${stop.id}`);
        });
    }
});

// For any remaining orphan stops, assign them to the closest line
const usedStops = new Set(Array.from(existingLineStops).map(s => parseInt(s.split('-')[1])));
const orphanStops = stops.filter(s => !usedStops.has(s.id));

orphanStops.forEach((stop, index) => {
    const matchingLine = lines.find(l => neighborhoods.some(n => stop.name.toLowerCase().includes(n.toLowerCase()) && l.name.toLowerCase().includes(n.toLowerCase())));
    if (matchingLine) {
        const currentCount = Array.from(existingLineStops).filter(s => s.startsWith(`${matchingLine.id}-`)).length;
        newLineStops.push(`(${matchingLine.id}, ${stop.id}, ${currentCount + 1})`);
        existingLineStops.add(`${matchingLine.id}-${stop.id}`);
    } else {
        const lineId = (index % lines.length) + 1;
        const currentCount = Array.from(existingLineStops).filter(s => s.startsWith(`${lineId}-`)).length;
        newLineStops.push(`(${lineId}, ${stop.id}, ${currentCount + 1})`);
        existingLineStops.add(`${lineId}-${stop.id}`);
    }
});

let output = '-- New Line Stops Relationships\n';
if (newLineStops.length > 0) {
    output += 'INSERT INTO line_stops (line_id, stop_id, position) VALUES \n';
    output += newLineStops.join(',\n') + ';\n';
}

fs.writeFileSync('scratch/line_stops.sql', output, 'utf8');
console.log('Generated scratch/line_stops.sql');
