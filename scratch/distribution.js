const fs = require('fs');
const sql = fs.readFileSync('init-db.sql', 'utf8');

const stopRegex = /\((\d+),\s*'((?:''|\\'|[^'])*)',\s*'((?:''|\\'|[^'])*)',\s*([\d.-]+),\s*([\d.-]+)\)/g;
const stopNames = {};
let match;
while ((match = stopRegex.exec(sql)) !== null) {
    stopNames[match[1]] = match[2];
}

const lineStopRegex = /\((\d+),\s*(\d+),\s*(\d+)\)/g;
const stopCounts = {};
while ((match = lineStopRegex.exec(sql)) !== null) {
    const stopId = match[2];
    stopCounts[stopId] = (stopCounts[stopId] || 0) + 1;
}

const distribution = {};
for (const id in stopNames) {
    const count = stopCounts[id] || 0;
    distribution[count] = (distribution[count] || 0) + 1;
}

console.log('Stop Line count distribution:');
console.log(distribution);

console.log('\nStops with only 1 line:');
let count1 = 0;
for (const id in stopNames) {
    if ((stopCounts[id] || 0) === 1) {
        console.log(`${id}: ${stopNames[id]}`);
        count1++;
    }
}
console.log('Total stops with 1 line:', count1);
