const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

/**
 * Loads CSV data from a specified file and returns it as JSON.
 *
 * @param {string} filePath - Path to the CSV file.
 * @returns {Promise<Object[]>} - Promise resolving to an array of JSON objects.
 */
async function loadCSVData(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(parse({ columns: true, delimiter: ',' }))
            .on('data', (row) => results.push(row))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

module.exports = { loadCSVData };