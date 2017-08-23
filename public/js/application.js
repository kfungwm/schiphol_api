// $('.load_button').submit(function() {
//     $('#gif').css('visibility', 'visible');
// });

// $.get("navigation.hbs", function(data) {
//   $("#nav-placeholder").replaceWith(data);
// });


$('.load_button').click(function(){
   $('#gif').show();
   if(valid)
      return true;
   else
      {
        $(this).removeAttr('disabled');
        $('#gif').hide();
        return false;
      }
});


$('.load_info a').on('click', function(){
  var eq = $(this).index();

  $('.main .fours').removeClass('show');
  $('.main .fours').eq(eq).addClass('show');

});
