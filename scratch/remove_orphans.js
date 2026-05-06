const fs = require('fs');

function cleanSql(filePath, orphanIds) {
    let content = fs.readFileSync(filePath, 'utf8');
    const orphanSet = new Set(orphanIds);
    
    // Pattern to match: (id, 'name', 'address', lat, lng)[,;]
    const stopLineRegex = /^\((\d+),\s*'((?:''|\\'|[^'])*)',\s*'((?:''|\\'|[^'])*)',\s*([\d.-]+),\s*([\d.-]+)\)([,;])/gm;
    
    let lastValidId = -1;
    let match;
    const matches = [];
    while ((match = stopLineRegex.exec(content)) !== null) {
        matches.push(match);
    }
    
    // Identify which lines to keep
    const toKeep = matches.filter(m => !orphanSet.has(parseInt(m[1])));
    
    if (toKeep.length === 0) return;
    
    // The last one must end with ; the others with ,
    const newStopLines = toKeep.map((m, i) => {
        const punctuation = (i === toKeep.length - 1) ? ';' : ',';
        return `(${m[1]}, '${m[2]}', '${m[3]}', ${m[4]}, ${m[5]})${punctuation}`;
    });
    
    // Replace the entire block
    const firstStopLine = matches[0][0];
    const lastStopLine = matches[matches.length - 1][0];
    
    const startIndex = content.indexOf(matches[0][0]);
    const endIndex = content.indexOf(matches[matches.length - 1][0]) + matches[matches.length - 1][0].length;
    
    const newBlock = newStopLines.join('\n');
    content = content.slice(0, startIndex) + newBlock + content.slice(endIndex);
    
    fs.writeFileSync(filePath, content);
}

const orphanIds = JSON.parse(fs.readFileSync('scratch/orphans_to_delete.json', 'utf8'));
cleanSql('backend/backend/src/main/resources/data.sql', orphanIds);
console.log('Successfully cleaned data.sql');
