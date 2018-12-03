// Before starting : npm install objects-to-csv
const ObjectsToCsv = require('objects-to-csv');



var csvEncoder = function () {

    // Pick up the data
    //parser.parse;
    //const data[] = parser.parsedMail;

    // Data exemple
    const data = [
        {
            code: 'HK',
            name: 'Hong Kong'
    },
        {
            code: 'KLN',
            name: 'Kowloon'
    },
        {
            code: 'NT',
            name: 'New Territories'
    },
];


    // If you use "await", code must be inside an asynchronous function:
    (async () => {
        let csv = new ObjectsToCsv(data);

        // Save to file:
        await csv.toDisk('./test.csv');

        // Return the CSV file as string:
        console.log(await csv.toString());
    })();
};
csvEncoder();
