const request = require('postman-request');
const url = 'http://api.weatherstack.com/current?access_key=5ec1c597168355a76d2be4aacc4bc8d4&query=-0.8968343875047832,100.35063941244701';
request({ url: url }, (error, response) => {
    // console.log(response)
    const data = JSON.parse(response.body)
    // console.log(data)
    // console.log(data.current)
    console.log(data.current.temperature)
})

const geocodeURL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/Jakarta.json?access_token=pk.eyJ1IjoiYm9ic2t5MTQiLCJhIjoiY21oMzQ1Y3h3MzJ2dDJscTRleDdndnkzbCJ9.lqavF5Eko9PV-6lepjQFnA&limit=2'
request({ url: geocodeURL, json: true }, (error, response) => {
    const latitude = response.body.features[1].center[1]
    const longitude = response.body.features[1].center[0]
    console.log(latitude, longitude)
})
