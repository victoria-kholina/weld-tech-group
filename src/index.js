import './assets/css/bootstrap-grid.min.css'
import '@splidejs/splide/css/core';
import './scss/main.scss'


import $ from 'jquery';



$(function() {

    // Set SVG sprites code from the file to the html of every page. Needed for crossbrawser support

    const basePath = window.location.pathname.includes('/services/')
    ? '../assets/img/sprite.svg' : './assets/img/sprite.svg'; 

    $.ajax({
      url: basePath, 
      method: 'GET',
      dataType: 'text',
      success: function (data) {
        const parser = new DOMParser();
        const svgDoc= parser.parseFromString(data, 'image/svg+xml');
        const svgElem = svgDoc.documentElement;
        $('body').append(svgElem); 
      },
      error: function () {
        console.error('Error in downloading svg');
      },
    });

    // change video size on screen resize

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

    // sticky menu

    function setStickyMenuHeight() {
      let stickyMenu = $(".sticky-menu-wrap");
      let banner = $(".welcome-banner");
      let bannerHeight = banner.outerHeight();

      stickyMenu.css("height", banner.outerHeight())
    
    }

    setStickyMenuHeight()
    $(window).resize(function(){
      setStickyMenuHeight()
    });

    // run animation on scroll
    function checkVisibility() {
      $('.animate-on-scroll').each(function () {
          let elem = $(this);
          let elemTop = elem.offset().top;
          let windowBottom = $(window).scrollTop() + $(window).height();

          if (windowBottom > elemTop && !elem.hasClass('animated')) {
              elem.addClass('animated');
          }
      });
  }

  $(window).on('scroll', checkVisibility);
  checkVisibility(); 

  // Equal height function. 

  function setEqualHeight(elements) {
    let maxHeight = 0;

    $(elements).css('height', 'auto');

    $(elements).each(function () {
      let elementHeight = $(this).outerHeight();
      if (elementHeight > maxHeight) {
        maxHeight = elementHeight;
      }
    });

    $(elements).css('height', maxHeight + 'px');
  }

    setEqualHeight('.work-stages-item'); 

    $(window).on('resize', function () {
      setEqualHeight('.work-stages-item');
    });
  
});