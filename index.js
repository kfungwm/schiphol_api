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

app.get('/', (req,res) => {
  res.render('index');
});


// api.openweathermap.org/data/2.5/forecast?id=524901&APPID=a335b031bda5798564c74aca0b4a81aa
var APPID = 'a335b031bda5798564c74aca0b4a81aa',
    cityName = 'HongKong',
    // url = 'http://api.openweathermap.org/data/2.5/weather?q=' + cityName +  '&APPID=' + APPID;
    // url = 'http://api.openweathermap.org/data/2.5/forecast?q=' + cityName +  '&APPID=' + APPID;


    //  //number of dates
    numberDate = 5;
    url = 'http://api.openweathermap.org/data/2.5/forecast/daily?q=' + cityName + '&cnt=' + numberDate + '&units=metric' + '&APPID=' + APPID;

// http://api.openweathermap.org/data/2.5/forecast/daily?q=HOngKong&cnt=5&APPID=a335b031bda5798564c74aca0b4a81aa


app.get("/weather", function (req, res) {

  // function myCity(city) {
  //   var url = 'http://api.openweathermap.org/data/2.5/weather?q=' + cityName +  '&APPID=' + APPID;
  //   sendrequest(url);
  // }

  request({url: url}, function(error, response, body) {
  if(!error && response.statusCode === 200) {
    var parsedData = JSON.parse(body);

    // console.log(parsedData);
    // console.log("========");


    //  // for 5 days
    var weather =[];

    for(var i = 0; i < 5; i++) {
      var weatherData = {};

      // console.log("========");
      // console.log(parsedData.list[i].weather[0].main);

      weatherData.main = parsedData.list[i].weather[0].main;
      weatherData.description = parsedData.list[i].weather[0].description;
      weatherData.icon = parsedData.list[i].weather[0].icon;

      // console.log(weather.description);
      // console.log(weather.icon);

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



      // break;
    //
    //   //weather
    //   main = parsedData.weather[0].main;
    //   description = parsedData.weather[0].description;
    //   icon = parsedData.weather[0].icon;
    //   //main temp
    //   temp = parsedData.main.temp;
    //   temp_min= parsedData.main.temp_min;
    //   temp_max= parsedData.main.temp_max;
    //
    //   //wind
    //   windSpeed = parsedData.wind.speed;
    //   windDeg = parsedData.wind.deg;
    //
    //   //city country
    //   cityName = parsedData.name;
    //   countryName = parsedData.sys.country;


//====================== works for day 1
    // var weather = {};
    //
    // weather.main = parsedData.weather[0].main;
    // weather.description = parsedData.weather[0].description;
    // weather.icon = parsedData.weather[0].icon;
    // //main temp
    // weather.temp = parsedData.main.temp;
    // weather.temp_min= parsedData.main.temp_min;
    // weather.temp_max= parsedData.main.temp_max;
    //
    // //wind
    // weather.windSpeed = parsedData.wind.speed;
    // weather.windDeg = parsedData.wind.deg;
    //
    // //city country
    // weather.cityName = parsedData.name;
    // weather.countryName = parsedData.sys.country;
    // console.log(weather);


    }

      // console.log(weather);
      // console.log("STATUS===========");
      // console.log(weather[1].main);
      // console.log("1=============");
      // console.log(weather[2].main);
      // // console.log(weather[0].main);
      //   console.log("2=============");
      //   console.log(weather.length);
      //   console.log("4============");
      //   console.log(weather[0].cityName);

        // weather.icon = weather[0].icon;
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

      res.render("weather", {weather: weather});
    }
  });
});






// var urlweather = 'http://api.openweathermap.org/data/2.5/weather?q=' + cityName +  '&APPID=' + APPID;

// request(sendrequest, function(error, response, body) {
// if(!error && response.statusCode === 200) {
//   var parsedData = JSON.parse(body);
//   console.log(parsedData);
//   }
// });




// }"urlweather", function(error, response, body) {
// if(!error && response.statusCode === 200) {
//   var parsedData = JSON.parse(body);
//   console.log(parsedData);
//   }
// });

// $.ajax({
//   url: 'https://api.instagram.com/v1/users/' + userid + '/media/recent/?access_token=' + token,
//   dataType: 'jsonp',
//   type: 'POST',
//   success: function(naam) {



//===========================================================================

var http = require("https");
var options = {
  "method": "GET",
  "hostname": "api.schiphol.nl",
  "port": null,
  "path": "/public-flights/flights?app_id=152ae116&app_key=16c9819f9d3ab5e97d46e66d404402ac&flightname=CX270",
  "headers": {
    "resourceversion": "v3"
  }
};
var req = http.get(options, function (res) {
  var chunks = [];
  res.on("data", function (chunk) {
    chunks.push(chunk);
  }).on("end", function () {
    var body = Buffer.concat(chunks);
    var parsedData = JSON.parse(body);
    console.log(parsedData);

    console.log(parsedData.flights[0].route.destinations[0]);

    console.log(parsedData.flights[0].flightName);
    console.log(parsedData.flights[0].scheduleDate);
    console.log(parsedData.flights[0].scheduleTime);
    console.log(parsedData.flights[0].gate);
    console.log(parsedData.flights[0].terminal);
    // parsedData.results.forEach(function (schipdata) {
    //
    //   console.log(schipdata);
    // });
  });
});
req.end();

















app.listen(3000, () => {
  console.log('Web server started on port 3000');
});
