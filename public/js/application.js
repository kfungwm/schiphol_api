// var token = '3139185.369b559.7e7dacf5e1c94a409b8939609f337255',
// userid = 3139185;
//
//
// $.ajax({
//   url: 'https://api.instagram.com/v1/users/' + userid + '/media/recent/?access_token=' + token,
//   dataType: 'jsonp',
//   type: 'GET',
//   success: function(naam) {
//     console.log(naam);
//     for(var x in naam.data) {
//
//       // console.log(naam.data[x]);
//       console.log(naam.data[x].images.standard_resolution.url);
//       console.log(naam.data[x].link);
//       // $('.instagram').append('<div class="outer"><a target="_blank" href="' + naam.data[x].link + '"><div class="inner" style="background-image: url('+naam.data[x].images.standard_resolution.url+')"></div></div>');
//       // $('#instagram').append(naam.data[x].likes.count);
//     }
//   },
//   error: function(data) {
//     console.log(data);
//     console.log("error");
//   }
// });



// https://api.schiphol.nl/public-flights/flights?app_id=152ae116&app_key=16c9819f9d3ab5e97d46e66d404402ac&flightname=CX270&includedelays=false&page=0&sort=%2Bscheduletime

// var flightName = 'CX270';
//
// $.ajax({
//   url: 'https://api.schiphol.nl/public-flights/flights?app_id=152ae116&app_key=16c9819f9d3ab5e97d46e66d404402ac&flightname=CX270&includedelays=false&page=0&sort=%2Bscheduletime',
//   dataType: 'jsonp',
//   type: 'GET',
//   success: function(naam) {
//     console.log(naam);
//     // for(var x in naam.data) {
//     //
//     //   // console.log(naam.data[x]);
//     //   console.log(naam.data[x].images.standard_resolution.url);
//     //   console.log(naam.data[x].link);
//       // $('.instagram').append('<div class="outer"><a target="_blank" href="' + naam.data[x].link + '"><div class="inner" style="background-image: url('+naam.data[x].images.standard_resolution.url+')"></div></div>');
//       // $('#instagram').append(naam.data[x].likes.count);
//     // }
//   },
//   error: function(data) {
//     console.log(data);
//     console.log("error");
//   }
// });


//====================================================