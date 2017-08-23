var express = require('express'),
    morgan = require ('morgan'),
    request = require('request'),
    bodyParser = require('body-parser'),
    hbs = require ('hbs');
    http = require("https");

var app = express();

var port = process.env.PORT || 3000;


app.use(express.static('public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/flight', function(req, res) {
// ======= SCHIPHOL Search Flightname details ========

var app_id = "152ae116",
    app_key = "16c9819f9d3ab5e97d46e66d404402ac",

    flightName = req.query.flightNumber.toUpperCase().replace(/\s+/g, '');
    url = '/public-flights/flights?app_id=' + app_id + '&app_key=' + app_key + '&flightname=' + flightName;

var options = {
  method: "GET",
  hostname: "api.schiphol.nl",
  port: null,
  path: url,
  headers: {
    resourceversion: "v3"
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
        flightData.scheduleTime = parsedData.flights[0].scheduleTime.substring(0, parsedData.flights[0].scheduleTime.length-3);
        flightData.gate = parsedData.flights[0].gate;
        flightData.terminal = parsedData.flights[0].terminal;
        flightData.checkIn = parsedData.flights[0].checkinAllocations.checkinAllocations[0].rows.rows[0].position;
        flightData.flightIA = parsedData.flights[0].prefixIATA;

        flightData.push(flightData);

        matchAirlines(flightData);
    });
  });
}

// ====== IATA Match AirlinesName ======

function matchAirlines(flightData) {

  var iata = flightData.flightIA;
  var airlinesUrl = '/public-flights/airlines/' + iata + '?app_id=' + app_id + '&app_key=' + app_key;

  var airlines = {
    method: "GET",
    hostname: "api.schiphol.nl",
    port: null,
    path: airlinesUrl,
    headers: {
      resourceversion: "v1"
    }
  };

  http.get(airlines, function(res) {
    var chunks = [];
    res.on("data", function(chunk) {
      chunks.push(chunk);
    }).on("end", function() {
        var body = Buffer.concat(chunks);
        var parsedData = JSON.parse(body);

        var airlinesData = [];
        airlinesData.name = parsedData.publicName;

        airlinesData.push(airlinesData);

        matchCity(flightData, airlinesData);
    });
  });
}

// ====== flightName match the city name =======

function matchCity(flightData, airlinesData) {

  var city_des = flightData.destinations;
  var cityUrl = '/public-flights/destinations/' + city_des + '?app_id=' + app_id + '&app_key=' + app_key;

  var cityOptions = {
    method: "GET",
    hostname: "api.schiphol.nl",
    port: null,
    path: cityUrl,
    headers: {
      resourceversion: "v1"
    }
  };

  http.get(cityOptions, function(res) {
    var chunks = [];
    res.on("data", function(chunk) {
      chunks.push(chunk);
    }).on("end", function() {
        var body = Buffer.concat(chunks);
        var parsedData = JSON.parse(body);
        var cityData = [];
        cityData.city = parsedData.city;
        cityData.country = parsedData.country;

        cityData.push(cityData);

        cityWeather(flightData, airlinesData, cityData);
    });
  });
}


// //========== WEATHER API ===========

function cityWeather(flightData, airlinesData, cityData) {

  var APPID = 'a335b031bda5798564c74aca0b4a81aa',
      cityName = cityData.city;
      numberDate = 5;
      url = 'http://api.openweathermap.org/data/2.5/forecast/daily?q=' + cityName + '&cnt=' + numberDate + '&units=metric' + '&APPID=' + APPID;

  request({url: url}, function(error, response, body) {
  if(!error && response.statusCode === 200) {
    var parsedData = JSON.parse(body);

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
     foursquareFood(flightData, airlinesData, cityData, weather);
    }
  });
}

// //======= Foursquare Api =======

var CLIENT_ID = 'URUFPNY1Q2C1D4OVRN15VBBP3E3HUT1SOQDQQBPWYLLUTP2Q',
    CLIENT_SECRET = 'TKPY0CWD3MUCVVAWTSCSGSZBWW3HIRI2LHJGOUXQNUPQJQ4Y';

function foursquareFood(flightData, airlinesData, cityData, weather) {
  var cityName = cityData.city;
  var date = flightData.scheduleDate.replace(/[^A-Z0-9]+/ig, "");
  var section = "food";
  var limitNumber = 10;
  foodUrl = 'https://api.foursquare.com/v2/venues/explore?near=' + cityName + '&section=' + section + '&limit=' + limitNumber + '&venuePhotos=1&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&v=' + date;

  request({url: foodUrl}, function(error, response, body) {
    if(!error && response.statusCode === 200) {
      var parsedData = JSON.parse(body);
      var listData = parsedData.response.groups[0].items;

      var foodList = [];

      for(var i = 0; i < listData.length; i++) {
        var foodData = {};

        foodData.name = parsedData.response.groups[0].items[i].venue.name;
        foodData.phone = parsedData.response.groups[0].items[i].venue.contact.phone;
        foodData.lat = parsedData.response.groups[0].items[i].venue.location.lat;
        foodData.lng = parsedData.response.groups[0].items[i].venue.location.lng;
        foodData.address = parsedData.response.groups[0].items[i].venue.location.address;
        foodData.postalCode = parsedData.response.groups[0].items[i].venue.location.postalCode;
        foodData.city = parsedData.response.groups[0].items[i].venue.location.city;

        foodData.prefix = parsedData.response.groups[0].items[i].venue.featuredPhotos.items[0].prefix;
        foodData.suffix = parsedData.response.groups[0].items[i].venue.featuredPhotos.items[0].suffix;
        foodData.url = parsedData.response.groups[0].items[i].venue.url;
        foodData.rating = parsedData.response.groups[0].items[i].venue.rating;
        // footData.menu = foodData.response.groups[0].items[i].venue.menu.url;
        // foodData.status = parsedData.response.groups[0].items[i].venue.hours.status;


        foodList.push(foodData);
      }
      foursquareCoffee(flightData, airlinesData, cityData, weather, foodList);

    }
  });
}

function foursquareCoffee(flightData, airlinesData, cityData, weather, foodList) {
  var cityName = cityData.city;
  var date = flightData.scheduleDate.replace(/[^A-Z0-9]+/ig, "");
  var section = "coffee";
  var limitNumber = 10;
  coffeeUrl = 'https://api.foursquare.com/v2/venues/explore?near=' + cityName + '&section=' + section + '&limit=' + limitNumber + '&venuePhotos=1&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&v=' + date;

  request({url: coffeeUrl}, function(error, response, body) {
    if(!error && response.statusCode === 200) {
      var parsedData = JSON.parse(body);
      var listData = parsedData.response.groups[0].items;

      var coffeeList = [];

      for(var i = 0; i < listData.length; i++) {
        var coffeeData = {};

        coffeeData.name = parsedData.response.groups[0].items[i].venue.name;
        coffeeData.phone = parsedData.response.groups[0].items[i].venue.contact.phone;
        coffeeData.lat = parsedData.response.groups[0].items[i].venue.location.lat;
        coffeeData.lng = parsedData.response.groups[0].items[i].venue.location.lng;
        coffeeData.address = parsedData.response.groups[0].items[i].venue.location.address;
        coffeeData.postalCode = parsedData.response.groups[0].items[i].venue.location.postalCode;
        coffeeData.city = parsedData.response.groups[0].items[i].venue.location.city;

        coffeeData.prefix = parsedData.response.groups[0].items[i].venue.featuredPhotos.items[0].prefix;
        coffeeData.suffix = parsedData.response.groups[0].items[i].venue.featuredPhotos.items[0].suffix;
        coffeeData.url = parsedData.response.groups[0].items[i].venue.url;
        coffeeData.rating = parsedData.response.groups[0].items[i].venue.rating;
        // coffeeData.status = parsedData.response.groups[0].items[i].venue.hours.status;

        coffeeList.push(coffeeData);
      }
      foursquareNightlife(flightData, airlinesData, cityData, weather, foodList, coffeeList);

    }
  });
}


function foursquareNightlife(flightData, airlinesData, cityData, weather, foodList, coffeeList) {
  var cityName = cityData.city;
  var date = flightData.scheduleDate.replace(/[^A-Z0-9]+/ig, "");
  var section = "nightlife";
  var limitNumber = 10;
  nightlifeUrl = 'https://api.foursquare.com/v2/venues/explore?near=' + cityName + '&section=' + section + '&limit=' + limitNumber + '&venuePhotos=1&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&v=' + date;

  request({url: nightlifeUrl}, function(error, response, body) {
    if(!error && response.statusCode === 200) {
      var parsedData = JSON.parse(body);
      var listData = parsedData.response.groups[0].items;

      var nightlifeList = [];

      for(var i = 0; i < listData.length; i++) {
        var nightlifeData = {};

        nightlifeData.name = parsedData.response.groups[0].items[i].venue.name;
        nightlifeData.phone = parsedData.response.groups[0].items[i].venue.contact.phone;
        nightlifeData.lat = parsedData.response.groups[0].items[i].venue.location.lat;
        nightlifeData.lng = parsedData.response.groups[0].items[i].venue.location.lng;
        nightlifeData.address = parsedData.response.groups[0].items[i].venue.location.address;
        nightlifeData.postalCode = parsedData.response.groups[0].items[i].venue.location.postalCode;
        nightlifeData.city = parsedData.response.groups[0].items[i].venue.location.city;

        nightlifeData.prefix = parsedData.response.groups[0].items[i].venue.featuredPhotos.items[0].prefix;
        nightlifeData.suffix = parsedData.response.groups[0].items[i].venue.featuredPhotos.items[0].suffix;
        nightlifeData.url = parsedData.response.groups[0].items[i].venue.url;
        nightlifeData.rating = parsedData.response.groups[0].items[i].venue.rating;
        // nightlifeData.status = parsedData.response.groups[0].items[i].venue.hours.status;

        nightlifeList.push(nightlifeData);
      }
      foursquareShops(flightData, airlinesData, cityData, weather, foodList, coffeeList, nightlifeList);

    }
  });
}

function foursquareShops(flightData, airlinesData, cityData, weather, foodList, coffeeList, nightlifeList) {
  var cityName = cityData.city;
  var date = flightData.scheduleDate.replace(/[^A-Z0-9]+/ig, "");
  var section = "shops";
  var limitNumber = 10;
  shopsUrl = 'https://api.foursquare.com/v2/venues/explore?near=' + cityName + '&section=' + section + '&limit=' + limitNumber + '&venuePhotos=1&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&v=' + date;

  request({url: shopsUrl}, function(error, response, body) {
    if(!error && response.statusCode === 200) {
      var parsedData = JSON.parse(body);
      var listData = parsedData.response.groups[0].items;

      var shopsList = [];

      for(var i = 0; i < listData.length; i++) {
        var shopsData = {};

        shopsData.name = parsedData.response.groups[0].items[i].venue.name;
        shopsData.phone = parsedData.response.groups[0].items[i].venue.contact.phone;
        shopsData.lat = parsedData.response.groups[0].items[i].venue.location.lat;
        shopsData.lng = parsedData.response.groups[0].items[i].venue.location.lng;
        shopsData.address = parsedData.response.groups[0].items[i].venue.location.address;
        shopsData.postalCode = parsedData.response.groups[0].items[i].venue.location.postalCode;
        shopsData.city = parsedData.response.groups[0].items[i].venue.location.city;

        shopsData.prefix = parsedData.response.groups[0].items[i].venue.featuredPhotos.items[0].prefix;
        shopsData.suffix = parsedData.response.groups[0].items[i].venue.featuredPhotos.items[0].suffix;
        shopsData.url = parsedData.response.groups[0].items[i].venue.url;
        shopsData.rating = parsedData.response.groups[0].items[i].venue.rating;
        // shopsData.status = parsedData.response.groups[0].items[i].venue.hours.status;

        shopsList.push(shopsData);
      }
      foursquareTrending(flightData, airlinesData, cityData, weather, foodList, coffeeList, nightlifeList, shopsList);

    }
  });
}

function foursquareTrending(flightData, airlinesData, cityData, weather, foodList, coffeeList, nightlifeList, shopsList) {
  var cityName = cityData.city;
  var date = flightData.scheduleDate.replace(/[^A-Z0-9]+/ig, "");
  var section = "trending";
  var limitNumber = 10;
  trendingUrl = 'https://api.foursquare.com/v2/venues/explore?near=' + cityName + '&section=' + section + '&limit=' + limitNumber + '&venuePhotos=1&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&v=' + date;

  request({url: trendingUrl}, function(error, response, body) {
    if(!error && response.statusCode === 200) {
      var parsedData = JSON.parse(body);
      var listData = parsedData.response.groups[0].items;

      var trendingList = [];

      for(var i = 0; i < listData.length; i++) {
        var trendingData = {};

        trendingData.name = parsedData.response.groups[0].items[i].venue.name;
        trendingData.phone = parsedData.response.groups[0].items[i].venue.contact.phone;
        trendingData.lat = parsedData.response.groups[0].items[i].venue.location.lat;
        trendingData.lng = parsedData.response.groups[0].items[i].venue.location.lng;
        trendingData.address = parsedData.response.groups[0].items[i].venue.location.address;
        trendingData.postalCode = parsedData.response.groups[0].items[i].venue.location.postalCode;
        trendingData.city = parsedData.response.groups[0].items[i].venue.location.city;

        trendingData.prefix = parsedData.response.groups[0].items[i].venue.featuredPhotos.items[0].prefix;
        trendingData.suffix = parsedData.response.groups[0].items[i].venue.featuredPhotos.items[0].suffix;
        trendingData.url = parsedData.response.groups[0].items[i].venue.url;
        trendingData.rating = parsedData.response.groups[0].items[i].venue.rating;
        // trendingData.status = parsedData.response.groups[0].items[i].venue.hours.status;

        trendingList.push(trendingData);
      }
      foursquareArts(flightData, airlinesData, cityData, weather, foodList, coffeeList, nightlifeList, shopsList, trendingList);

    }
  });
}


function foursquareArts(flightData, airlinesData, cityData, weather, foodList, coffeeList, nightlifeList, shopsList, trendingList) {

  var cityName = cityData.city;
  var date = flightData.scheduleDate.replace(/[^A-Z0-9]+/ig, "");
  var section = "arts";
  var limitNumber = 10;
  artsUrl = 'https://api.foursquare.com/v2/venues/explore?near=' + cityName + '&section=' + section + '&limit=' + limitNumber + '&venuePhotos=1&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&v=' + date;


  request({url: artsUrl}, function(error, response, body) {
    if(!error && response.statusCode === 200) {
      var parsedData = JSON.parse(body);
      var listData = parsedData.response.groups[0].items;

      var artsList = [];

      for(var i = 0; i < listData.length; i++) {
        var artsData = {};

        artsData.name = parsedData.response.groups[0].items[i].venue.name;
        artsData.phone = parsedData.response.groups[0].items[i].venue.contact.phone;
        artsData.lat = parsedData.response.groups[0].items[i].venue.location.lat;
        artsData.lng = parsedData.response.groups[0].items[i].venue.location.lng;
        artsData.address = parsedData.response.groups[0].items[i].venue.location.address;
        artsData.postalCode = parsedData.response.groups[0].items[i].venue.location.postalCode;
        artsData.city = parsedData.response.groups[0].items[i].venue.location.city;

        artsData.prefix = parsedData.response.groups[0].items[i].venue.featuredPhotos.items[0].prefix;
        artsData.suffix = parsedData.response.groups[0].items[i].venue.featuredPhotos.items[0].suffix;
        // artsData.url = parsedData.response.groups[0].items[i].venue.url;
        artsData.rating = parsedData.response.groups[0].items[i].venue.rating;

        artsList.push(artsData);
      }
      console.log("-------- All Api Details --------");
      console.log(flightData);
      console.log("===============");
      console.log(airlinesData);
      console.log("===============");
      console.log(cityData);
      console.log("===============");
      console.log(weather);
      console.log("===============");
      console.log(trendingList);
      console.log("===============");
      console.log(nightlifeList);
      console.log("===============");
      console.log(coffeeList);
      console.log("===============");
      console.log(artsList);
      console.log("===============");
      console.log(shopsList);
      console.log("========== End =========");

      var data = {
        flightData: flightData, airlinesData: airlinesData, cityData: cityData, weather: weather, artsList: artsList, foodList: foodList, coffeeList: coffeeList, nightlifeList: nightlifeList, shopsList: shopsList, trendingList: trendingList
      };

      res.render('flight', data);
    }
  });
}

  flightDetails();

});



app.get('/nav', (req, res) => {
  res.render('navigation');
});


app.listen(port, () => {
  console.log('Web server started on port ' + port);
});
