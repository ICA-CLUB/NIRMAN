// Default configuration
const defaultConfig = {
  event_title: "NIRMAAN",
  // Add other default configuration properties here
};

// Function to handle data changes
function onDataChanged(data) {
  // Handle data changes here
  console.log('Data changed:', data);
}

function initThemeToggle() {
  const themeToggleBtn = document.getElementById('themeToggle');
  if (!themeToggleBtn) return;

  const themeIcon = themeToggleBtn.querySelector('.theme-icon');

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  };

  const savedTheme = localStorage.getItem('theme');
  const initialTheme = savedTheme || 'dark';
  if (!savedTheme) {
    localStorage.setItem('theme', initialTheme);
  }
  applyTheme(initialTheme);

  themeToggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
  });
}

// Initialize SDKs
function initializeSdks() {
  // Mobile menu toggle functionality
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Navbar scroll effect
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Close mobile menu if open
        if (navLinks && navLinks.classList.contains('active')) {
          navLinks.classList.remove('active');
        }
        
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Adjust for fixed header
          behavior: 'smooth'
        });
      }
    });
  });

  // Add animation classes on scroll
  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-down, .fade-in-left, .fade-in-right');
    
    elements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (elementTop < windowHeight - 100) {
        element.classList.add('animate');
      }
    });
  };

  // Initial check
  animateOnScroll();
  
  // Check on scroll
  window.addEventListener('scroll', animateOnScroll);

  // Theme toggle
  initThemeToggle();

  // Initialize other SDKs or libraries here
  // For example, if you're using any third-party libraries
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeSdks();
  
  // Add any other initialization code here
  console.log('NIRMAAN Hackathon website initialized');
});