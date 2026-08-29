// Realistic Legacy jQuery Counter & Preference Component
$(document).ready(function() {
  var count = 0;
  var theme = localStorage.getItem('theme_pref') || 'dark';

  $('#counter-val').text(count);
  $('body').addClass('theme-' + theme);

  $('#btn-increment').on('click', function(e) {
    e.preventDefault();
    count++;
    $('#counter-val').text(count);
  });

  $('#btn-decrement').click(function(e) {
    e.preventDefault();
    if (count > 0) {
      count--;
      $('#counter-val').text(count);
    }
  });

  $('#btn-reset').click(function(e) {
    e.preventDefault();
    count = 0;
    $('#counter-val').text(count);
  });
});
