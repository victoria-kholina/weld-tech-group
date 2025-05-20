import Splide from '@splidejs/splide';

// Throttle function for performance optimization
function throttle(func, limit) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}

document.addEventListener('DOMContentLoaded', function() {
  
  // Modal windows
  const modalWindow = document.getElementById('modal-window');
  const modalIframe = document.getElementById('modal-iframe');
  const modalBody = document.getElementById('modal-body');
  
  document.querySelectorAll('.open-modal').forEach(button => {
    button.addEventListener('click', function() {
      const contentType = this.dataset.type;
      const htmlContent = this.nextElementSibling;
      
      modalIframe.style.display = 'none';
      modalIframe.src = '';
      modalBody.style.display = 'none';
      modalBody.innerHTML = '';
      
      if (contentType === 'pdf') {
        const linkSrc = this.dataset.src;
        modalIframe.src = linkSrc;
        modalIframe.style.display = 'flex';
      } else if (contentType === 'img') {
        const imageModal = document.createElement('img');
        imageModal.src = this.src;
        imageModal.alt = 'Modal Image';
        modalBody.appendChild(imageModal);
        modalBody.style.display = 'flex';
      } else {
        modalBody.innerHTML = htmlContent.innerHTML;
        modalBody.style.display = 'flex';
      }
      
      modalWindow.style.display = 'block';
      modalWindow.style.opacity = '1';
    });
  });
  
  [modalWindow, document.querySelector('.close')].forEach(element => {
    element.addEventListener('click', function(event) {
      if (event.target === this) {
        modalWindow.style.opacity = '0';
        setTimeout(() => {
          modalWindow.style.display = 'none';
          modalIframe.src = '';
          modalBody.innerHTML = '';
        }, 300);
      }
    });
  });
  
  // Splide slider
  if (document.querySelector('.splide')) {
    const homeSlider = new Splide('.home-slider .splide', {
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
      rewind: true,
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
  
  // SVG sprites
  const basePath = '/assets/img/sprite.svg';
  
  fetch(basePath)
    .then(response => response.text())
    .then(data => {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(data, 'image/svg+xml');
      const svgElem = svgDoc.documentElement;
      document.body.appendChild(svgElem);
    })
    .catch(error => {
      console.error('Ошибка при загрузке SVG спрайта:', basePath, error);
    });
  
  // Sticky menu height
  function setStickyMenuHeight() {
    const stickyMenu = document.querySelector('.sticky-menu-wrap');
    const banner = document.querySelector('.welcome-banner');
    
    if (banner && stickyMenu) {
      stickyMenu.style.height = `${banner.offsetHeight}px`;
    }
  }
  
  if (window.innerWidth > 767) {
    setStickyMenuHeight();
  }
  
  window.addEventListener('resize', function() {
    const stickyMenu = document.querySelector('.sticky-menu-wrap');
    if (window.innerWidth > 767) {
      setStickyMenuHeight();
    } else {
      stickyMenu.style.height = '50px';
    }
  });
  
  function checkVisibility() {
    document.querySelectorAll('.animate-on-scroll').forEach(elem => {
      const rect = elem.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
  
      if (isVisible) {
        elem.classList.add('animated');
      }
    });
  }
  
  window.addEventListener('scroll', throttle(checkVisibility, 50));
  checkVisibility();
  
  // Equal height function
  function setEqualHeight(elements) {
    const elementsList = document.querySelectorAll(elements);
    let maxHeight = 0;
    
    elementsList.forEach(element => {
      element.style.height = 'auto';
    });
    
    elementsList.forEach(element => {
      const elementHeight = element.offsetHeight;
      if (elementHeight > maxHeight) {
        maxHeight = elementHeight;
      }
    });
    
    elementsList.forEach(element => {
      element.style.height = `${maxHeight}px`;
    });
  }
  
  if (window.innerWidth > 767) {
    setEqualHeight('.work-stages-item');
    setEqualHeight('.certificate-text');
    setEqualHeight('.services-item');
    setEqualHeight('.values-item');
  }
  
  window.addEventListener('resize', function() {
    if (window.innerWidth > 767) {
      setEqualHeight('.work-stages-item');
      setEqualHeight('.certificate-text');
      setEqualHeight('.services-item');
      setEqualHeight('.values-item');
    }
  });
  
  // Vertical line height
  function updateLineHeight() {
    const row = document.querySelector('.work-stages-row');
    const firstCircle = document.querySelector('.work-stages-item.item-1 .stage-circle');
    const lastCircle = document.querySelector('.work-stages-item.item-6 .stage-circle');
    const line = document.querySelector('.stage-line');
    
    if (firstCircle && lastCircle && row && line) {
      const firstOffset = firstCircle.getBoundingClientRect().top + firstCircle.offsetHeight / 2;
      const lastOffset = lastCircle.getBoundingClientRect().top + lastCircle.offsetHeight / 2;
      const rowOffset = row.getBoundingClientRect().top;
      
      const lineHeight = lastOffset - firstOffset;
      
      line.style.top = `${firstOffset - rowOffset}px`;
      line.style.height = `${lineHeight}px`;
    }
  }
  
  updateLineHeight();
  window.addEventListener('resize', updateLineHeight);
  
  // Mobile menu
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
      this.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    
    document.querySelectorAll('.menu-item a').forEach(link => {
      link.addEventListener('click', function() {
        menuToggle.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }
});
  
// Lazy loading images
function loadImage(img) {
  const src = img.dataset.src;
  if (src) {
    img.src = src;
    img.addEventListener('load', function() {
      img.classList.add('loaded');
    });
    img.removeAttribute('data-src');
  }
}

function lazyLoadVisibleImages() {
  document.querySelectorAll('.lazy-image[data-src]').forEach(img => {
    const rect = img.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
    if (inViewport) {
      loadImage(img);
    }
  });
}

// При загрузке страницы
lazyLoadVisibleImages();

// При скролле с throttle для оптимизации
window.addEventListener('scroll', throttle(lazyLoadVisibleImages, 50));

// Если изображения находятся в табах — загружаем при активации
document.querySelectorAll('.tabs-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const tabId = this.dataset.tab;
    
    // Обновляем активные классы
    document.querySelectorAll('.tabs-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    
    document.querySelectorAll('.tabs-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    
    // Загружаем изображения внутри активного таба
    document.querySelectorAll(`#${tabId} .lazy-image[data-src]`).forEach(img => {
      loadImage(img);
    });
  });
});  