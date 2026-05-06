
const fs = require('fs');

const initSql = fs.readFileSync('init-db.sql', 'utf8');
const dataSql = fs.readFileSync('backend/backend/src/main/resources/data.sql', 'utf8');

const lineStopsRegex = /INSERT INTO line_stops[^;]+;/;
const initLineStops = initSql.match(lineStopsRegex)[0];

const newDataSql = dataSql.replace(lineStopsRegex, initLineStops);

fs.writeFileSync('backend/backend/src/main/resources/data.sql', newDataSql, 'utf8');
console.log('Synchronized data.sql with init-db.sql line_stops');
