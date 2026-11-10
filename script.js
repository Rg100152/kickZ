const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
const finePointer = window.matchMedia('(pointer: fine)').matches;
const money = (value) => '$' + value.toFixed(2);

const toast = $('#toast');
let toastTimer;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

window.addEventListener('load', () => {
  const preloader = $('#preloader');
  if (preloader) {
    setTimeout(() => preloader.classList.add('hidden'), 450);
  }
});

if (finePointer) {
  const dot = $('.cursor-dot');
  const outline = $('.cursor-outline');
  let mouseX = 0;
  let mouseY = 0;
  let outlineX = 0;
  let outlineY = 0;

  window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    if (dot) {
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    }
  });

  function animateCursor() {
    outlineX += (mouseX - outlineX) * 0.16;
    outlineY += (mouseY - outlineY) * 0.16;
    if (outline) {
      outline.style.left = outlineX + 'px';
      outline.style.top = outlineY + 'px';
    }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const interactive = 'a, button, .product-card, .category-card, input, textarea';
  document.addEventListener('mouseover', (event) => {
    if (event.target.closest(interactive) && outline) {
      outline.classList.add('hovered');
    }
  });
  document.addEventListener('mouseout', (event) => {
    if (event.target.closest(interactive) && outline) {
      outline.classList.remove('hovered');
    }
  });
}

const navbar = $('#navbar');
const progressBar = $('#progress-bar');

function handleScroll() {
  const scrollTop = window.scrollY;
  if (navbar) {
    navbar.classList.toggle('scrolled', scrollTop > 40);
  }
  if (progressBar) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (max > 0 ? (scrollTop / max) * 100 : 0) + '%';
  }
}

window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

const hamburger = $('#hamburger');
const navLinks = $('#navLinks');
const navOverlay = $('#navOverlay');

function closeMenu() {
  if (navLinks) navLinks.classList.remove('open');
  if (hamburger) hamburger.classList.remove('active');
  if (navOverlay) navOverlay.classList.remove('show');
}

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    if (navOverlay) navOverlay.classList.toggle('show', isOpen);
  });
  $$('.nav-links a').forEach((link) => link.addEventListener('click', closeMenu));
  if (navOverlay) navOverlay.addEventListener('click', closeMenu);
}

const revealElements = $$('.reveal');

if ('IntersectionObserver' in window && revealElements.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('visible'));
}

const heroShoe = $('#heroShoe');
const heroSection = $('.hero');

if (heroShoe && heroSection && finePointer) {
  heroSection.addEventListener('mousemove', (event) => {
    const rect = heroSection.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    heroShoe.style.transform = `rotateY(${x * 16}deg) rotateX(${-y * 16}deg) scale(1.03)`;
  });
  heroSection.addEventListener('mouseleave', () => {
    heroShoe.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
  });
}

const CART_KEY = 'kickz-cart';
let cart = [];

try {
  const stored = JSON.parse(localStorage.getItem(CART_KEY));
  if (Array.isArray(stored)) cart = stored;
} catch (error) {
  cart = [];
}

const cartDrawer = $('#cartDrawer');
const cartItemsEl = $('#cartItems');
const cartCountEl = $('#cartCount');
const cartTotalEl = $('#cartTotal');

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    return;
  }
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (cartCountEl) cartCountEl.textContent = count;
  if (cartTotalEl) cartTotalEl.textContent = money(total);
  if (!cartItemsEl) return;

  if (!cart.length) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty. Time to find your pair.</p>';
    return;
  }

  cartItemsEl.innerHTML = cart
    .map((item, index) => {
      const qtyLabel = item.qty > 1 ? ' \u00d7 ' + item.qty : '';
      return (
        '<div class="cart-item">' +
        '<img src="' + item.img + '" alt="' + item.name + '">' +
        '<div class="cart-item-info">' +
        '<h4>' + item.name + qtyLabel + '</h4>' +
        '<p>' + money(item.price * item.qty) + '</p>' +
        '</div>' +
        '<button class="cart-item-remove" data-remove="' + index + '" aria-label="Remove item">&times;</button>' +
        '</div>'
      );
    })
    .join('');

  $$('.cart-item-remove', cartItemsEl).forEach((button) => {
    button.addEventListener('click', () => {
      cart.splice(Number(button.dataset.remove), 1);
      saveCart();
      renderCart();
    });
  });
}

function addItem(name, price, img) {
  const existing = cart.find((item) => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, img, qty: 1 });
  }
  saveCart();
  renderCart();
  showToast(name + ' added to cart');
}

document.addEventListener('click', (event) => {
  const addButton = event.target.closest('[data-add]');
  if (!addButton) return;
  const card = addButton.closest('.product-card');
  if (!card) return;
  const name = card.querySelector('h3').textContent.trim();
  const price = parseFloat(card.querySelector('.price').textContent.replace(/[^0-9.]/g, '')) || 0;
  const img = card.querySelector('img').getAttribute('src');
  addItem(name, price, img);
});

function openCart() {
  if (!cartDrawer) return;
  cartDrawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  if (!cartDrawer) return;
  cartDrawer.classList.remove('open');
  document.body.style.overflow = '';
}

const cartButton = $('#cartBtn');
if (cartButton) cartButton.addEventListener('click', openCart);
$$('[data-close-cart]').forEach((element) => element.addEventListener('click', closeCart));

const checkoutButton = $('#checkoutBtn');
if (checkoutButton) {
  checkoutButton.addEventListener('click', () => {
    if (!cart.length) {
      showToast('Your cart is empty');
      return;
    }
    showToast('Order placed! This is a demo checkout.');
    cart = [];
    saveCart();
    renderCart();
    closeCart();
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeCart();
    closeMenu();
  }
});

$$('[data-newsletter]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    showToast('Subscribed! Welcome to KICKZ.');
    form.reset();
  });
});

const contactForm = $('#contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    showToast('Message sent! We will get back to you soon.');
    contactForm.reset();
  });
}

const filterButtons = $$('.filter-btn');
const shopCards = $$('[data-category]');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    shopCards.forEach((card) => {
      const matches = filter === 'all' || card.dataset.category === filter;
      card.style.display = matches ? '' : 'none';
      if (matches) card.classList.add('visible');
    });
  });
});

renderCart();
