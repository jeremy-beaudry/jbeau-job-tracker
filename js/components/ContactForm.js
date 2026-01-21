// Contact Form Component

const ContactForm = {
  currentContactId: null,

  openNew() {
    this.currentContactId = null;
    this.open({
      name: '',
      email: '',
      phone: '',
      company: '',
      role: '',
      linkedIn: '',
      notes: ''
    });
  },

  openEdit(contactId) {
    this.currentContactId = contactId;
    const contact = StorageService.getContact(contactId);
    if (contact) {
      this.open(contact);
    }
  },

  open(contact) {
    const isEdit = !!this.currentContactId;

    const content = `
      <div class="modal-header">
        <h2 class="modal-title">${isEdit ? 'Edit Contact' : 'Add New Contact'}</h2>
        <button class="modal-close" onclick="Modal.close()">&times;</button>
      </div>
      <form id="contact-form" onsubmit="ContactForm.handleSubmit(event)">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="name">Name *</label>
            <input type="text" id="name" class="form-input" value="${ContactCard.escapeHtml(contact.name)}" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="company">Company</label>
              <input type="text" id="company" class="form-input" value="${ContactCard.escapeHtml(contact.company)}">
            </div>
            <div class="form-group">
              <label class="form-label" for="role">Role/Title</label>
              <input type="text" id="role" class="form-input" value="${ContactCard.escapeHtml(contact.role)}" placeholder="e.g. Hiring Manager">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <input type="email" id="email" class="form-input" value="${ContactCard.escapeHtml(contact.email)}">
            </div>
            <div class="form-group">
              <label class="form-label" for="phone">Phone</label>
              <input type="tel" id="phone" class="form-input" value="${ContactCard.escapeHtml(contact.phone)}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="linkedIn">LinkedIn URL</label>
            <input type="url" id="linkedIn" class="form-input" value="${ContactCard.escapeHtml(contact.linkedIn)}" placeholder="https://linkedin.com/in/...">
          </div>

          <div class="form-group">
            <label class="form-label" for="notes">Notes</label>
            <textarea id="notes" class="form-textarea" placeholder="How did you meet? Any notes about this contact...">${ContactCard.escapeHtml(contact.notes)}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Contact'}</button>
        </div>
      </form>
    `;

    Modal.open(content);
  },

  handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const contactData = {
      name: form.querySelector('#name').value.trim(),
      company: form.querySelector('#company').value.trim(),
      role: form.querySelector('#role').value.trim(),
      email: form.querySelector('#email').value.trim(),
      phone: form.querySelector('#phone').value.trim(),
      linkedIn: form.querySelector('#linkedIn').value.trim(),
      notes: form.querySelector('#notes').value.trim()
    };

    if (this.currentContactId) {
      State.updateContact(this.currentContactId, contactData);
    } else {
      State.addContact(contactData);
    }

    Modal.close();
  }
};

window.ContactForm = ContactForm;
