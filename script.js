const revealElements = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  }
);

revealElements.forEach(element => observer.observe(element));

// Configure each plan checkout URL here when payment platform is ready.
const CHECKOUT_LINKS = {
  'td-quadrimestral': 'https://pay.kiwify.com.br/lN2ro8c',
  'td-semestral': ' https://pay.kiwify.com.br/9r9nYLl',
  'td-anual': 'https://pay.kiwify.com.br/Y9hK6ya',
  't-mensal': 'https://pay.kiwify.com.br/yvT0okE',
  't-trimestral': 'https://pay.kiwify.com.br/ZcnthD9',
  't-semestral': 'https://pay.kiwify.com.br/8hdzCp2',
};

const buyButtons = document.querySelectorAll('.buy-btn');

buyButtons.forEach(button => {
  button.addEventListener('click', event => {
    // If the anchor has a valid href (not '#'), let it open that URL.
    const href = button.getAttribute('href');
    if (href && href !== '#') {
      // allow normal navigation in a new tab to preserve existing behavior
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }

    event.preventDefault();
    const planId = button.dataset.planId;
    const checkoutUrl = CHECKOUT_LINKS[planId];

    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    alert('Checkout deste plano ainda nao configurado. Preencha o URL no arquivo script.js.');
  });
});

// Antes/Depois slider navigation (supports multiple sliders)
(() => {
  const wrappers = document.querySelectorAll('.slider-wrapper');
  if (!wrappers.length) return;

  const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  const overlay = document.createElement('div');
  overlay.className = 'image-overlay';
  overlay.innerHTML = `
    <button class="close-btn" aria-label="Fechar imagem ampliada">Fechar</button>
    <img alt="Imagem ampliada" />
  `;
  document.body.appendChild(overlay);

  const overlayImage = overlay.querySelector('img');
  const closeBtn = overlay.querySelector('.close-btn');
  let modalOpen = false;
  let currentInstance = null;

  const closeOverlay = () => {
    overlay.classList.remove('visible', 'interactive');
    overlayImage.src = '';
    modalOpen = false;
    document.body.style.overflow = '';
  };

  const openOverlay = (src, interactive) => {
    overlayImage.src = src;
    overlay.classList.add('visible');
    overlay.classList.toggle('interactive', interactive);
    modalOpen = interactive;
    document.body.style.overflow = interactive ? 'hidden' : '';
  };

  wrappers.forEach(wrapper => {
    const sliderTrack = wrapper.querySelector('.slider-track');
    const sliderBtnPrev = wrapper.querySelector('.slider-btn-prev');
    const sliderBtnNext = wrapper.querySelector('.slider-btn-next');
    const indicators = wrapper.querySelectorAll('.indicator');
    const sliderImages = wrapper.querySelectorAll('.slider-item img');

    if (!sliderTrack || !sliderBtnPrev || !sliderBtnNext) return;

    let currentSlide = 0;
    const totalSlides = wrapper.querySelectorAll('.slider-item').length;

    const updateSlider = (slideIndex) => {
      currentSlide = (slideIndex + totalSlides) % totalSlides;
      const offset = -currentSlide * 100;
      sliderTrack.style.transform = `translateX(${offset}%)`;

      indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
      });
    };

    const nextSlide = () => updateSlider(currentSlide + 1);
    const prevSlide = () => updateSlider(currentSlide - 1);

    sliderBtnNext.addEventListener('click', () => {
      nextSlide();
      currentInstance = { nextSlide, prevSlide, updateSlider };
    });
    sliderBtnPrev.addEventListener('click', () => {
      prevSlide();
      currentInstance = { nextSlide, prevSlide, updateSlider };
    });

    indicators.forEach(indicator => {
      indicator.addEventListener('click', (e) => {
        const slideIndex = parseInt(e.target.dataset.slide, 10);
        updateSlider(slideIndex);
        currentInstance = { nextSlide, prevSlide, updateSlider };
      });
    });

    sliderImages.forEach(image => {
      const slide = image.closest('.slider-item');

      slide?.addEventListener('mouseenter', () => {
        if (isTouchDevice) return;
        openOverlay(image.src, false);
        currentInstance = { nextSlide, prevSlide, updateSlider };
      });

      slide?.addEventListener('mouseleave', () => {
        if (isTouchDevice) return;
        if (!modalOpen) closeOverlay();
      });

      image.addEventListener('click', event => {
        event.preventDefault();
        openOverlay(image.src, isTouchDevice);
        currentInstance = { nextSlide, prevSlide, updateSlider };
      });
    });

    // init
    updateSlider(0);
  });

  closeBtn.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', event => {
    if (event.target === overlay && modalOpen) {
      closeOverlay();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOpen) {
      closeOverlay();
      return;
    }
    if (!currentInstance) return;
    if (e.key === 'ArrowRight') {
      currentInstance.nextSlide();
    } else if (e.key === 'ArrowLeft') {
      currentInstance.prevSlide();
    }
  });
})();
