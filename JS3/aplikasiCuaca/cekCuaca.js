const request = require('postman-request');

// Read CLI args: accept coordinates as "lat,lon" or two separate args, optional third arg is search query
const rawArg = process.argv[2];
const maybeLat = process.argv[2];
const maybeLon = process.argv[3];
const optionalQuery = process.argv[4] || process.argv[3];

let lat, lon;
if (maybeLat && maybeLat.includes(',')) {
    const parts = maybeLat.split(',').map(s => s.trim());
    lat = parts[0];
    lon = parts[1];
} else if (maybeLat && maybeLon && !maybeLon.includes(',')) {
    lat = maybeLat;
    lon = maybeLon;
} else {
    // default coordinates (Padang area)
    lat = '-0.924759';
    lon = '100.363256';
}

const searchQuery = (typeof optionalQuery === 'string' && optionalQuery.length > 0) ? optionalQuery : null;

console.log('Koordinat lokasi anda adalah ' + lat + ', ' + lon);

// Helper to safely read nested properties
function safeGet(obj, path, defaultValue) {
    return path.split('.').reduce((o, p) => (o && o[p] !== undefined) ? o[p] : undefined, obj) ?? defaultValue;
}

// Weatherstack (metric units = Celsius)
const WEATHERSTACK_KEY = '5ec1c597168355a76d2be4aacc4bc8d4';
const urlCuaca = `http://api.weatherstack.com/current?access_key=${WEATHERSTACK_KEY}&query=${lat},${lon}&units=m`;

// Mapbox token. If set, we'll reverse-geocode to get a nicer place name/type.
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYm9ic2t5MTQiLCJhIjoiY21oMzQ1Y3h3MzJ2dDJscTRleDdndnkzbCJ9.lqavF5Eko9PV-6lepjQFnA';

function inferPlaceTypeFromMapbox(mapboxType) {
    if (!mapboxType) return 'unknown';
    // mapboxType can be 'place','locality','region','country','neighborhood'
    if (mapboxType === 'locality' || mapboxType === 'place') return 'locality';
    if (mapboxType === 'region') return 'region';
    if (mapboxType === 'country') return 'country';
    return mapboxType;
}

request({ url: urlCuaca, json: true }, (error, response) => {
    if (error) {
        return console.log('Gagal terhubung ke layanan cuaca:', error.message || error);
    }

    const body = response && response.body;
    if (!body) {
        return console.log('Respons API cuaca kosong atau tidak valid.');
    }

    if (body.error) {
        return console.log('API Weatherstack mengembalikan error:', body.error.info || JSON.stringify(body.error));
    }

    // read weather data
    const tempC = safeGet(body, 'current.temperature', 'N/A');
    const precip = safeGet(body, 'current.precip', 'N/A');
    const wsPlaceName = safeGet(body, 'location.name', null);
    const wsRegion = safeGet(body, 'location.region', null);
    const wsCountry = safeGet(body, 'location.country', null);

    // default place info from weatherstack
    let placeFull = [wsPlaceName, wsRegion, wsCountry].filter(Boolean).join(', ');
    let placeType = wsRegion ? 'locality' : (wsPlaceName ? 'place' : (wsCountry ? 'country' : 'unknown'));
    // Prefer an explicit searchQuery if provided; otherwise prefer weatherstack's request.query or the place name
    let reportedQuery = searchQuery || safeGet(body, 'request.query', wsPlaceName || 'Query tidak tersedia');

    // If MAPBOX token is available, call Mapbox reverse geocoding to enrich place name and type
    if (MAPBOX_TOKEN) {
        const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1&types=place,locality,neighborhood,region,country`;
        request({ url: mapboxUrl, json: true }, (mbErr, mbRes) => {
            if (mbErr) {
                console.log('Gagal memanggil Mapbox:', mbErr.message || mbErr);
                // fallback to weatherstack data
                printResults(reportedQuery, placeFull, placeType, tempC, precip);
                return;
            }

            const mbBody = mbRes && mbRes.body;
            if (mbBody && Array.isArray(mbBody.features) && mbBody.features.length > 0) {
                const f = mbBody.features[0];
                const mbPlaceName = f.text || null;
                const mbPlaceFull = f.place_name || placeFull;
                const mbType = Array.isArray(f.place_type) && f.place_type.length > 0 ? inferPlaceTypeFromMapbox(f.place_type[0]) : placeType;
                // If user supplied a search query, use that as "Data yang anda cari"
                const finalQuery = searchQuery || reportedQuery;
                printResults(finalQuery, mbPlaceFull, mbType, tempC, precip, mbPlaceName);
            } else {
                // no features from mapbox, fallback
                printResults(reportedQuery, placeFull, placeType, tempC, precip);
            }
        });
    } else {
        // No Mapbox token: use weatherstack data; advise user how to enable Mapbox
        if (!searchQuery && typeof body.request === 'object') {
            reportedQuery = safeGet(body, 'request.query', reportedQuery);
        }
        console.log('Note: MAPBOX_ACCESS_TOKEN tidak ditemukan. Untuk hasil lokasi lebih tepat, set environment variable MAPBOX_ACCESS_TOKEN.');
        // pass a short place name if available (e.g. 'Padang') for nicer sentence
        const shortPlace = wsPlaceName || (placeFull ? placeFull.split(',')[0] : null);
        printResults(reportedQuery, placeFull, placeType, tempC, precip, shortPlace);
    }
});

function printResults(requested, placeFull, placeType, tempC, precip, shortPlaceName) {
    // requested: what the user asked for
    // placeFull: full place string
    // shortPlaceName: optional short city name for wording
    const cityNameForSentence = shortPlaceName || (requested && requested.length < 40 ? requested : (placeFull ? placeFull.split(',')[0] : 'lokasi'));

    if (requested) console.log('Data yang anda cari adalah: ' + requested);
    else console.log('Data yang anda cari adalah: (tidak tersedia)');

    console.log('Data yang ditemukan adalah: ' + (placeFull || 'Informasi lokasi tidak tersedia'));
    console.log('Tipe lokasi adalah: ' + (placeType || 'unknown'));
    console.log('Saat ini suhu di ' + cityNameForSentence + ' mencapai ' + tempC + ' derajat celcius.');
    console.log('Kemungkinan terjadinya hujan adalah ' + precip + '%');
}