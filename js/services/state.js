// State Management - Simple pub/sub pattern for reactive updates

const State = {
  listeners: {},
  data: {
    jobs: [],
    contacts: [],
    activities: [],
    currentPage: 'dashboard',
    filters: {
      search: '',
      status: 'all',
      remote: 'all'
    }
  },

  // Initialize state from storage
  init() {
    this.data.jobs = StorageService.getJobs();
    this.data.contacts = StorageService.getContacts();
    this.data.activities = StorageService.getActivities(10);
  },

  // Subscribe to state changes
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
    return () => {
      this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
    };
  },

  // Notify listeners of state change
  notify(key) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(callback => callback(this.data[key]));
    }
    // Also notify 'all' listeners
    if (this.listeners['all']) {
      this.listeners['all'].forEach(callback => callback(this.data));
    }
  },

  // Get state
  get(key) {
    return key ? this.data[key] : this.data;
  },

  // Set state
  set(key, value) {
    this.data[key] = value;
    this.notify(key);
  },

  // Jobs actions
  refreshJobs() {
    this.data.jobs = StorageService.getJobs();
    this.data.activities = StorageService.getActivities(10);
    this.notify('jobs');
    this.notify('activities');
  },

  addJob(jobData) {
    const job = StorageService.createJob(jobData);
    this.refreshJobs();
    return job;
  },

  updateJob(id, updates) {
    const job = StorageService.updateJob(id, updates);
    this.refreshJobs();
    return job;
  },

  deleteJob(id) {
    StorageService.deleteJob(id);
    this.refreshJobs();
  },

  getFilteredJobs() {
    let jobs = [...this.data.jobs];
    const { search, status, remote } = this.data.filters;

    if (search) {
      const searchLower = search.toLowerCase();
      jobs = jobs.filter(job =>
        job.company.toLowerCase().includes(searchLower) ||
        job.role.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower)
      );
    }

    if (status && status !== 'all') {
      jobs = jobs.filter(job => job.status === status);
    }

    if (remote && remote !== 'all') {
      jobs = jobs.filter(job => job.remote === remote);
    }

    return jobs;
  },

  // Contacts actions
  refreshContacts() {
    this.data.contacts = StorageService.getContacts();
    this.data.activities = StorageService.getActivities(10);
    this.notify('contacts');
    this.notify('activities');
  },

  addContact(contactData) {
    const contact = StorageService.createContact(contactData);
    this.refreshContacts();
    return contact;
  },

  updateContact(id, updates) {
    const contact = StorageService.updateContact(id, updates);
    this.refreshContacts();
    return contact;
  },

  deleteContact(id) {
    StorageService.deleteContact(id);
    this.refreshContacts();
    this.refreshJobs(); // Jobs may have had this contact linked
  },

  addCommunication(contactId, commData) {
    StorageService.addCommunication(contactId, commData);
    this.refreshContacts();
  },

  // Navigation
  navigate(page) {
    this.data.currentPage = page;
    this.notify('currentPage');
  },

  // Filters
  setFilter(key, value) {
    this.data.filters[key] = value;
    this.notify('filters');
  },

  clearFilters() {
    this.data.filters = {
      search: '',
      status: 'all',
      remote: 'all'
    };
    this.notify('filters');
  }
};

// Make available globally
window.State = State;
