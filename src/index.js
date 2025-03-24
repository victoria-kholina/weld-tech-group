import './assets/css/bootstrap-grid.min.css'
import '@splidejs/splide/css/core';
import './scss/main.scss'


import $ from 'jquery';
import Splide from '@splidejs/splide';


$(function() {
  if (document.querySelector('.splide')) {
    var homeSlider = new Splide('.home-slider .splide', {
      type: 'loop',
      speed: 1000,
      cover: true,
      autoplay: true,
      interval: 2000,
      pagination: false,
      perPage: 5,
      perMove: 1,
      pauseOnFocus: true,
      gap: '20px',
      rewind : true,
      breakpoints: {
        600: {
          perPage: 2,
          gap: '15px',
        },
        767: {
          perPage: 3,
          gap: '15px',
        },
        1023: {
          perPage: 4,
          gap: '15px',
        },
        1199: {
          perPage: 5,
        },
      },
    });

    homeSlider.mount();
  }

    // Set SVG sprites code from the file to the html of every page. Needed for crossbrawser support

    const basePath = '/assets/img/sprite.svg'; // абсолютный путь от корня

    $.ajax({
      url: basePath,
      method: 'GET',
      dataType: 'text',
      success: function (data) {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(data, 'image/svg+xml');
        const svgElem = svgDoc.documentElement;
        document.body.prepend(svgElem); // лучше prepend — для доступа в <use>
      },
      error: function () {
        console.error('Ошибка при загрузке SVG спрайта:', basePath);
      },
    });
    

    
    function setStickyMenuHeight() {
      
      let stickyMenu = $(".sticky-menu-wrap");
      let banner = $(".welcome-banner");

      if(banner) { stickyMenu.css("height", banner.outerHeight()) };     
    
    }

    if($(window).width() > 767) {
      setStickyMenuHeight();
    }
    $(window).resize(function(){
      if($(window).width() > 767) {
        setStickyMenuHeight();
      } else {
        $(".sticky-menu-wrap").css("height", "50px");
      }
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
  
  if($(window).width() > 767) {
    setEqualHeight('.work-stages-item'); 
    setEqualHeight('.certificate-text');
    setEqualHeight('.services-item');
    setEqualHeight('.values-item');
  }

    $(window).on('resize', function () {
      if($(window).width() > 767) {
        setEqualHeight('.work-stages-item');
        setEqualHeight('.certificate-text'); 
        setEqualHeight('.services-item');
        setEqualHeight('.values-item');
      }
    });

    // Adapt vertical line height

    function updateLineHeight() {
      let row = $('.work-stages-row');
      let firstCircle = $('.work-stages-item.item-1 .stage-circle');
      let lastCircle = $('.work-stages-item.item-6 .stage-circle');
      let line = $('.stage-line');

      if (firstCircle.length && lastCircle.length) {
          let firstOffset = firstCircle.offset().top + firstCircle.outerHeight() / 2;
          let lastOffset = lastCircle.offset().top + lastCircle.outerHeight() / 2;
          let rowOffset = row.offset().top;

          let lineHeight = lastOffset - firstOffset;

          line.css({
              'top': firstOffset - rowOffset + 'px',
              'height': lineHeight + 'px'
          });
      }
  }

    updateLineHeight();
  $(window).on('resize', function () {
      updateLineHeight();
  })

  // Modal windows

  $(".open-modal").click(function(){
    let contentType = $(this).data("type"); 
    let htmlContent = $(this).next("modal-content");

    $("#modal-iframe").hide().attr("src", "");
    $("#modal-body").hide().html("");

    if (contentType === "pdf") {
      let linkSrc = $(this).data("src");  
      $("#modal-iframe").attr("src", linkSrc).css("display", "flex");
    } else if (contentType === "img") {
      let imageModal = $('<img>', {
        src:  $(this).attr("src"),
        alt: 'Modal Image'
      })
      $("#modal-body").html(imageModal).css("display", "flex");
    } else {
      $("#modal-body").html(htmlContent).css("display", "flex");
    }

    $("#modal-window").fadeIn();
  });

  $(".close, #modal-window").click(function(event){
    if (event.target === this) {
      $("#modal-window").fadeOut();
      setTimeout(() => { 
        $("#modal-iframe").attr("src", ""); 
        $("#modal-body").html(""); 
      }, 300);
    }
  });


  // Contact forms

  $('#contact-form').on('submit', function (e) {
    e.preventDefault(); 
    
    if (!this.checkValidity()) {
        this.reportValidity();
        return;
    }

    let formData = $(this).serialize();

    $.ajax({
        type: 'POST',
        url: './php/send_email.php', 
        data: formData,
        success: function (response) {
            $('#form-status')
                .removeClass('error')
                .addClass('success')
                .text('Сообщение успешно отправлено!')
                .css("display", "inline-block");
            $('#contact-form')[0].reset(); 
        },
        error: function () {
            $('#form-status')
                .removeClass('success')
                .addClass('error')
                .text('Произошла ошибка при отправке сообщения.')
                .css("display", "inline-block");
        }
    });
  });

    // Cookies

    const notification = $('#cookie-notification');
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');

    if (!cookiesAccepted) {
      notification.css("display","flex");
    }

    $('#accept-cookies').on('click', function () {
      localStorage.setItem('cookiesAccepted', 'true'); 
      notification.css("display","none"); 
    });

    // Mobile menu

    let menuToggle = $(".mobile-menu-toggle");
    let mobileMenu = $(".mobile-menu");

    menuToggle.on("click", function () {
        $(this).toggleClass("open"); 
        mobileMenu.toggleClass("open"); 
    });

    $(".menu-item a").on("click", function () {
        menuToggle.removeClass("open");
        mobileMenu.removeClass("open");
    });

    function loadImage(img) {
      const $img = $(img);
      const src = $img.attr('data-src');
      if (src) {
        $img.attr('src', src)
          .on('load', function () {
            $img.addClass('loaded');
          })
          .removeAttr('data-src');
      }
    }
  
    function lazyLoadVisibleImages() {
      $('.lazy-image[data-src]').each(function () {
        const rect = this.getBoundingClientRect();
        const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
        if (inViewport) {
          loadImage(this);
        }
      });
    }
  
    // При загрузке страницы
    lazyLoadVisibleImages();
  
    // При скролле
    $(window).on('scroll', lazyLoadVisibleImages);
  
    // Если изображения находятся в табах — загружаем при активации
    $('.tabs-btn').on('click', function () {
      const tabId = $(this).data('tab');
  
      $('.tabs-btn').removeClass('active');
      $(this).addClass('active');
  
      $('.tabs-content').removeClass('active');
      $('#' + tabId).addClass('active');
  
      // Загружаем изображения внутри активного таба
      $('#' + tabId).find('.lazy-image[data-src]').each(function () {
        loadImage(this);
      });
    });

  
});