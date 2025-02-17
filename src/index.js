import './assets/css/bootstrap-grid.min.css'
import '@splidejs/splide/css/core';
import './scss/main.scss'


import $ from 'jquery';



$(function() {

    // Устанавливаем SVG data с внешнего файла на страницу. Нужно для поддержки SVG спрайтов разными браузерами. 

    const basePath = window.location.pathname.includes('/services/')
    ? '../assets/img/sprite.svg' : './assets/img/sprite.svg'; 

    $.ajax({
      url: basePath, 
      method: 'GET',
      dataType: 'text',
      success: function (data) {
        const parser = new DOMParser();
        const svgDocument = parser.parseFromString(data, 'image/svg+xml');
        const svgElement = svgDocument.documentElement;
        $('body').append(svgElement); 
      },
      error: function () {
        console.error('Error in downloading svg');
      },
    });

    function resizeVideo() {
      var videoHeight = $(window).height();
      var videoWidth = videoHeight * (9 / 16); 
      $('.welcome-video').css({
          'width': videoWidth + 'px'
      });
    }
    resizeVideo();
    $(window).resize(function(){
      resizeVideo();
    });
});