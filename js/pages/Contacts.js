// Contacts Page

const ContactsPage = {
  searchQuery: '',

  render() {
    const contacts = this.getFilteredContacts();

    const contactCards = contacts.length > 0
      ? contacts.map(contact => ContactCard.render(contact)).join('')
      : `
        <div class="empty-state">
          <div class="empty-state-icon">👥</div>
          <h3 class="empty-state-title">No contacts found</h3>
          <p>Add contacts to keep track of people in your job search network.</p>
          <button class="btn btn-primary mt-4" onclick="ContactForm.openNew()">+ Add Your First Contact</button>
        </div>
      `;

    return `
      <div class="page-header">
        <h1 class="page-title">Contacts</h1>
        <button class="btn btn-primary" onclick="ContactForm.openNew()">+ Add Contact</button>
      </div>

      <div class="search-filters">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            class="form-input"
            placeholder="Search contacts..."
            value="${this.searchQuery}"
            oninput="ContactsPage.handleSearch(this.value)"
          >
        </div>
      </div>

      <div class="contact-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem;">
        ${contactCards}
      </div>
    `;
  },

  init() {
    // Subscribe to data changes
    State.subscribe('contacts', () => this.refresh());
  },

  refresh() {
    if (State.get('currentPage') === 'contacts') {
      document.getElementById('page-content').innerHTML = this.render();
    }
  },

  handleSearch(value) {
    this.searchQuery = value;
    this.refresh();
  },

  getFilteredContacts() {
    let contacts = State.get('contacts');

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      contacts = contacts.filter(c =>
        c.name.toLowerCase().includes(query) ||
        (c.company && c.company.toLowerCase().includes(query)) ||
        (c.role && c.role.toLowerCase().includes(query)) ||
        (c.email && c.email.toLowerCase().includes(query))
      );
    }

    return contacts;
  }
};

window.ContactsPage = ContactsPage;
