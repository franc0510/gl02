// Before starting : npm install objects-to-csv
const ObjectsToCsv = require('objects-to-csv');
const datatable = [];


var csvEncoder = function () {};

// If you use "await", code must be inside an asynchronous function:
csvEncoder.prototype.encode = function (datatable) {
    //console.log(datatable);
    (async () => {
        let csv = new ObjectsToCsv(datatable);

        // Save to file:
        await csv.toDisk('./classeur.csv');

        // Return the CSV file as string:
        //console.log(await csv.toString());
    })();
};

module.exports = csvEncoder;
