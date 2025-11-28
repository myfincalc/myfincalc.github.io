// main.js
// Global UI effects, animations & shared functionality

// ---- Smooth Scrolling for Navbar Buttons ----
document.querySelectorAll("a[href^='#']").forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

// ---- Scroll Reveal Animation (Fade + Move) ----
const revealElements = document.querySelectorAll(".reveal");

function revealOnScroll() {
  const windowHeight = window.innerHeight;

  revealElements.forEach(el => {
    const elementTop = el.getBoundingClientRect().top;
    if (elementTop < windowHeight - 100) {
      el.classList.add("active-reveal");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

// ---- Floating Button Hover Effects ----
const floatButtons = document.querySelectorAll(".float-btn");

floatButtons.forEach(btn => {
  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "scale(1.1)";
    btn.style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "scale(1)";
    btn.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
  });
});

// ---- Mobile Menu Toggle ----
const menuBtn = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuBtn && navMenu) {
  menuBtn.addEventListener("click", () => {
    navMenu.classList.toggle("show-menu");
  });
}

// ---- Dynamic Date / Time Auto Fill ----
function updateDateTimeFields() {
  const now = new Date();
  const localDate = now.toLocaleDateString();
  const localTime = now.toLocaleTimeString();

  const dtFields = document.querySelectorAll(".auto-datetime");
  dtFields.forEach(f => {
    f.value = `${localDate} ${localTime}`;
  });
}
setInterval(updateDateTimeFields, 1000);

// ---- GPS Location Capture ----
window.vfcGPS = {
  latitude: null,
  longitude: null,
  place: "",

  init() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        this.latitude = pos.coords.latitude;
        this.longitude = pos.coords.longitude;

        // Reverse lookup using OpenStreetMap
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.latitude}&lon=${this.longitude}`)
          .then(res => res.json())
          .then(data => {
            this.place = data.address.city || data.address.town || data.address.village || "Unknown";
          })
          .catch(() => (this.place = "Unknown"));
      });
    }
  },
};

// Initialize GPS immediately
vfcGPS.init();

// ---- Auto Attach Place Name to PDF Reports ----
window.addEventListener("load", () => {
  const placeFields = document.querySelectorAll(".auto-place");
  placeFields.forEach(f => {
    f.value = vfcGPS.place;
  });
});

// ---- Navbar Highlight on Scroll ----
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (pageYOffset >= sectionTop - 200) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(a => {
    a.classList.remove("active");
    if (a.getAttribute("href") === `#${current}`) {
      a.classList.add("active");
    }
  });
});

// ---- Page Load Animation ----
window.addEventListener("load", () => {
  document.body.classList.add("page-loaded");
});