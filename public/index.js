$(document).ready(function() {
    if (localStorage.getItem('switch-state') && localStorage.getItem('switch-state') === "true") {
      $('body').addClass('dark-mode');
      $(".title-link").addClass('dark-mode');
      $(".form-control").addClass('dark-mode');
    }
  
    $('.switch').click(function() {
      let el = $('body');
      el.toggleClass('dark-mode');
      $(".title-link").toggleClass('dark-mode');
      $(".form-control").toggleClass('dark-mode');
      localStorage.setItem('switch-state', el.hasClass('dark-mode'));
    });
  });