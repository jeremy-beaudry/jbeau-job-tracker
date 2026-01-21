// Contact Card Component

const ContactCard = {
  render(contact) {
    const initials = this.getInitials(contact.name);
    const linkedJobs = this.getLinkedJobs(contact.id);
    const lastComm = contact.communications?.length > 0
      ? contact.communications[contact.communications.length - 1]
      : null;

    return `
      <div class="contact-card" data-contact-id="${contact.id}">
        <div class="contact-card-header">
          <div class="contact-avatar">${initials}</div>
          <div class="contact-info">
            <h3>${this.escapeHtml(contact.name)}</h3>
            <p>${this.escapeHtml(contact.role)}${contact.company ? ` at ${this.escapeHtml(contact.company)}` : ''}</p>
          </div>
        </div>
        <div class="contact-card-details">
          ${contact.email ? `<span>✉️ <a href="mailto:${this.escapeHtml(contact.email)}">${this.escapeHtml(contact.email)}</a></span>` : ''}
          ${contact.phone ? `<span>📱 ${this.escapeHtml(contact.phone)}</span>` : ''}
          ${contact.linkedIn ? `<span>💼 <a href="${this.escapeHtml(contact.linkedIn)}" target="_blank">LinkedIn Profile</a></span>` : ''}
        </div>
        <div class="contact-card-footer">
          <span class="contact-linked-jobs">
            ${linkedJobs.length > 0 ? `Linked to ${linkedJobs.length} job${linkedJobs.length > 1 ? 's' : ''}` : 'No linked jobs'}
          </span>
          <div class="job-card-actions">
            <button class="btn btn-secondary btn-sm" onclick="ContactForm.openEdit('${contact.id}')">Edit</button>
            <button class="btn btn-secondary btn-sm" onclick="ContactCard.showDetail('${contact.id}')">View</button>
          </div>
        </div>
      </div>
    `;
  },

  showDetail(contactId) {
    const contact = StorageService.getContact(contactId);
    if (!contact) return;

    const linkedJobs = this.getLinkedJobs(contactId);
    const initials = this.getInitials(contact.name);

    const content = `
      <div class="modal-header">
        <h2 class="modal-title">Contact Details</h2>
        <button class="modal-close" onclick="Modal.close()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="contact-card-header mb-4">
          <div class="contact-avatar" style="width: 64px; height: 64px; font-size: 1.5rem;">${initials}</div>
          <div class="contact-info">
            <h3 style="font-size: 1.25rem;">${this.escapeHtml(contact.name)}</h3>
            <p>${this.escapeHtml(contact.role)}${contact.company ? ` at ${this.escapeHtml(contact.company)}` : ''}</p>
          </div>
        </div>

        <div class="job-detail-section">
          <h3>Contact Info</h3>
          <div class="contact-card-details">
            ${contact.email ? `<span>✉️ <a href="mailto:${this.escapeHtml(contact.email)}">${this.escapeHtml(contact.email)}</a></span>` : ''}
            ${contact.phone ? `<span>📱 ${this.escapeHtml(contact.phone)}</span>` : ''}
            ${contact.linkedIn ? `<span>💼 <a href="${this.escapeHtml(contact.linkedIn)}" target="_blank">LinkedIn Profile</a></span>` : ''}
          </div>
        </div>

        ${contact.notes ? `
          <div class="job-detail-section">
            <h3>Notes</h3>
            <p>${this.escapeHtml(contact.notes)}</p>
          </div>
        ` : ''}

        ${linkedJobs.length > 0 ? `
          <div class="job-detail-section">
            <h3>Linked Jobs</h3>
            <div class="linked-contacts">
              ${linkedJobs.map(job => `
                <span class="linked-contact-chip">${this.escapeHtml(job.role)} at ${this.escapeHtml(job.company)}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="job-detail-section">
          <h3>Communication History</h3>
          ${contact.communications?.length > 0 ? `
            <div class="comm-log">
              ${contact.communications.map(comm => `
                <div class="comm-log-item">
                  <span class="comm-log-date">${this.formatDate(comm.date)}</span>
                  <span class="comm-log-type">${this.escapeHtml(comm.type)}</span>
                  <span class="comm-log-notes">${this.escapeHtml(comm.notes)}</span>
                </div>
              `).join('')}
            </div>
          ` : '<p class="text-muted">No communication logged yet</p>'}
          <button class="btn btn-secondary btn-sm mt-2" onclick="ContactCard.showAddComm('${contactId}')">+ Add Communication</button>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-danger" onclick="ContactCard.confirmDelete('${contactId}')">Delete Contact</button>
        <button class="btn btn-secondary" onclick="Modal.close()">Close</button>
      </div>
    `;

    Modal.open(content);
  },

  showAddComm(contactId) {
    const content = `
      <div class="modal-header">
        <h2 class="modal-title">Log Communication</h2>
        <button class="modal-close" onclick="Modal.close()">&times;</button>
      </div>
      <form id="comm-form" onsubmit="ContactCard.handleAddComm(event, '${contactId}')">
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="commType">Type</label>
              <select id="commType" class="form-select">
                <option value="email">Email</option>
                <option value="call">Phone Call</option>
                <option value="meeting">Meeting</option>
                <option value="linkedin">LinkedIn</option>
                <option value="note">Note</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="commDate">Date</label>
              <input type="date" id="commDate" class="form-input" value="${new Date().toISOString().split('T')[0]}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="commNotes">Notes</label>
            <textarea id="commNotes" class="form-textarea" placeholder="What was discussed?" required></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="ContactCard.showDetail('${contactId}')">Cancel</button>
          <button type="submit" class="btn btn-primary">Add Communication</button>
        </div>
      </form>
    `;

    Modal.open(content);
  },

  handleAddComm(event, contactId) {
    event.preventDefault();
    const form = event.target;

    State.addCommunication(contactId, {
      type: form.querySelector('#commType').value,
      date: form.querySelector('#commDate').value,
      notes: form.querySelector('#commNotes').value.trim()
    });

    this.showDetail(contactId);
  },

  confirmDelete(contactId) {
    const contact = StorageService.getContact(contactId);
    Modal.confirm(
      'Delete Contact',
      `Are you sure you want to delete "${contact.name}"? This will also remove them from any linked jobs.`,
      () => {
        State.deleteContact(contactId);
        Modal.close();
      }
    );
  },

  getLinkedJobs(contactId) {
    const jobs = StorageService.getJobs();
    return jobs.filter(job => job.contactIds?.includes(contactId));
  },

  getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  },

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

window.ContactCard = ContactCard;
