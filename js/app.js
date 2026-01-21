// Main Application

const App = {
  pages: {
    dashboard: DashboardPage,
    jobs: JobsPage,
    contacts: ContactsPage
  },

  init() {
    // Initialize modal
    Modal.init();

    // Initialize state from storage
    State.init();

    // Initialize page subscriptions
    DashboardPage.init();
    JobsPage.init();
    ContactsPage.init();

    // Set up navigation
    this.setupNavigation();

    // Render initial page
    this.navigate('dashboard');

    console.log('Job Tracker initialized!');
  },

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        this.navigate(page);
      });
    });

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      const page = e.state?.page || 'dashboard';
      this.renderPage(page);
    });
  },

  navigate(page) {
    // Update URL
    history.pushState({ page }, '', `#${page}`);

    // Render the page
    this.renderPage(page);
  },

  renderPage(page) {
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === page);
    });

    // Update state
    State.set('currentPage', page);

    // Clear filters when changing pages
    if (page !== 'jobs') {
      State.clearFilters();
    }

    // Render page content
    const pageComponent = this.pages[page];
    if (pageComponent) {
      document.getElementById('page-content').innerHTML = pageComponent.render();
    }
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();

  // Handle initial hash
  const hash = window.location.hash.slice(1);
  if (hash && App.pages[hash]) {
    App.navigate(hash);
  }
});
