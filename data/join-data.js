const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const FILE_CENTROIDS = path.join(__dirname, '/country-centroids.csv');
const FILE_BORDERS = path.join(__dirname, '/country-borders.csv');
const FILE_COUNTRY_NAMES = path.join(__dirname, '/country-names.csv');

class Country {
  count1 = 0;
  count2 = 0;
  name1 = '';
  name2 = '';
};

run();
async function run () {
  const centroids = await loadFile(FILE_CENTROIDS);
  const borders = await loadFile(FILE_BORDERS);
  const names = await loadFile(FILE_COUNTRY_NAMES);
  const namesLookup = names.reduce((acc, value) => {
    acc[value.code] = value.name;
    return acc;
  }, {});
  // console.log('Names:', namesLookup);
  // console.log('Centroids:', centroids);
  // console.log('Countries:', countries);
  const codes = {};
  borders.forEach(border => {
    if (border.country_code != '') {
      codes[border.country_code] = codes[border.country_code] || new Country();
      codes[border.country_code].count1 += 1;
      codes[border.country_code].name1 = border.country_name;
    }
    if (border.country_border_code != '') {
      codes[border.country_border_code] = codes[border.country_border_code] || new Country();
      codes[border.country_border_code].count1 += 1;
      codes[border.country_border_code].name1 = border.country_border_name;
    }
  });
  centroids.forEach(centroid => {
    if (centroid.country != '') {
      codes[centroid.country] = codes[centroid.country] || new Country();
      codes[centroid.country].centroid = {lat: centroid.latitude, lon: centroid.longitude};
      codes[centroid.country].count2 += 1;
      codes[centroid.country].name2 = centroid.name;
    }
  });

  // // higlight mismatches:
  // Object.keys(codes).forEach(code => {
  //   if (codes[code].count1 == 0 || codes[code].count2 == 0) {
  //     console.log('Missing code:', `"${code}"`, codes[code]);
  //   }
  //   if (codes[code].name1 != codes[code].name2) {
  //     console.log('Name Mismatch:', code, codes[code]);
  //   }
  // });
  // console.log('Country codes:', codes);

  // // Write names from each source in one file to make the manual union easier
  // const dualNames = Object.keys(codes).map(code => [code, codes[code].name1, codes[code].name2]);
  // console.log(dualNames);
  // fs.writeFileSync(path.join(__dirname, '/name-choices.csv'), JSON.stringify(dualNames));


  // Generate final merged dataset:
  const data = {
    borders: borders.map(border => ([border.country_code, border.country_border_code])),
    countries: Object.keys(namesLookup).reduce((acc, code) => {
      acc[code] = {
        name: namesLookup[code],
        lat: codes[code].centroid.lat,
        lon: codes[code].centroid.lon,
        linksCount: codes[code].count1
      };
      return acc;
    }, {})
  };
  // console.log(data);
  // Write to final file:
  fs.writeFileSync(path.join(__dirname, '/merged-dataset.json'), JSON.stringify(data));
  // Done! Now use this file in the frontend
}

async function loadFile(filePath) {
  return new Promise(accept => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', row => rows.push(row))
      .on('end', () => accept(rows));
  })
}
