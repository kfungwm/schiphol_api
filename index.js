var express = require('express'),
    morgan = require ('morgan'),
    request = require('request'),
    bodyParser = require('body-parser'),
    hbs = require ('hbs');
    http = require("https");


var app = express();

app.use(express.static('public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
  res.render('index');
});


app.get('/flight', function (req, res) {
// ======= SCHIPHOL Search Flightname details ========

var app_id = "152ae116",
    app_key = "16c9819f9d3ab5e97d46e66d404402ac",

    flightName = req.query.flightNumber,
    // flightName = "CX270",
    url = '/public-flights/flights?app_id=' + app_id + '&app_key=' + app_key + '&flightname=' + flightName;

var options = {
  "method": "GET",
  "hostname": "api.schiphol.nl",
  "port": null,
  "path": url,
  "headers": {
    "resourceversion": "v3"
  }
};

function flightDetails() {
  http.get(options, function (res) {
    var chunks = [];
    res.on("data", function (chunk) {
      chunks.push(chunk);
    }).on("end", function () {
        var body = Buffer.concat(chunks);
        var parsedData = JSON.parse(body);

        var flightData = [];

        flightData.destinations = parsedData.flights[0].route.destinations[0];
        flightData.flightName = parsedData.flights[0].flightName;
        flightData.scheduleDate = parsedData.flights[0].scheduleDate;
        flightData.scheduleTime = parsedData.flights[0].scheduleTime;
        flightData.gate = parsedData.flights[0].gate;
        flightData.terminal = parsedData.flights[0].terminal;

        flightData.push(flightData);

        matchCity(flightData);
    });
  });
}
  // flightDetails();

// ====== flightName match the city name =======




function matchCity (flightData) {

  var city_des = flightData.destinations;
  var cityUrl = '/public-flights/destinations/' + city_des + '?app_id=' + app_id + '&app_key=' + app_key;

  var options2 = {
    "method": "GET",
    "hostname": "api.schiphol.nl",
    "port": null,
    "path": cityUrl,
    "headers": {
      "resourceversion": "v1"
    }
  };


  http.get(options2, function (res) {
    var chunks = [];
    res.on("data", function (chunk) {
      chunks.push(chunk);
    }).on("end", function () {
        var body = Buffer.concat(chunks);
        var parsedData = JSON.parse(body);

        var cityData = [];
        cityData.city = parsedData.city;
        cityData.country = parsedData.country;

        cityData.push(cityData);

        cityWeather(flightData, cityData);
    });
  });
}
// matchCity();


// //========== WEATHER API ===========


function cityWeather (flightData, cityData) {

  var APPID = 'a335b031bda5798564c74aca0b4a81aa',
      cityName = cityData.city;
      numberDate = 5;
      url = 'http://api.openweathermap.org/data/2.5/forecast/daily?q=' + cityName + '&cnt=' + numberDate + '&units=metric' + '&APPID=' + APPID;

  request({url: url}, function(error, response, body) {
  if(!error && response.statusCode === 200) {
    var parsedData = JSON.parse(body);

    //  // for 5 days
    var weather = [];

    for(var i = 0; i < 5; i++) {
      var weatherData = {};

      weatherData.main = parsedData.list[i].weather[0].main;
      weatherData.description = parsedData.list[i].weather[0].description;
      weatherData.icon = parsedData.list[i].weather[0].icon;

      // main temp
      weatherData.temp = parsedData.list[i].temp.day;
      weatherData.temp_min= parsedData.list[i].temp.min;
      weatherData.temp_max= parsedData.list[i].temp.max;

      //wind
      weatherData.windSpeed = parsedData.list[i].speed;
      weatherData.windDeg = parsedData.list[i].deg;

      //city country
      weatherData.cityName = parsedData.city.name;
      weatherData.countryName = parsedData.city.country;

      weather.push(weatherData);
    }

      for(var j = 0; j < weather.length; j++) {

        weather.main = weather[j].main;
        weather.description = weather[j].description;
        weather.temp = weather[j].temp;
        weather.temp_min = weather[j].temp_min;
        weather.temp_max = weather[j].temp_max;
        weather.icon = weather[j].icon;
        weather.cityName = weather[j].cityName;
        weather.countryName = weather[j].countryName;

     }
       console.log("-------- laatste api --------");
       console.log(flightData);
       console.log(cityData);
       console.log(weather);
       // console.log();
       // console.log();
       console.log("========== einde api =========");
       var data = {
         flightData: flightData, cityData: cityData, weather: weather
       };

       res.render('flight', data);
    }
  });
}
// cityWeather();

  flightDetails();

});



app.listen(3000, () => {
  console.log('Web server started on port 3000');
});
