// Job Form Component

const JobForm = {
  currentJobId: null,

  openNew() {
    this.currentJobId = null;
    this.open({
      company: '',
      role: '',
      salary: { min: '', max: '', currency: 'USD' },
      location: '',
      remote: 'onsite',
      status: 'interested',
      description: '',
      url: '',
      appliedDate: '',
      notes: '',
      contactIds: []
    });
  },

  openEdit(jobId) {
    this.currentJobId = jobId;
    const job = StorageService.getJob(jobId);
    if (job) {
      this.open({
        ...job,
        salary: job.salary || { min: '', max: '', currency: 'USD' },
        appliedDate: job.appliedDate ? job.appliedDate.split('T')[0] : ''
      });
    }
  },

  open(job) {
    const contacts = StorageService.getContacts();
    const isEdit = !!this.currentJobId;

    const contactOptions = contacts.map(c => `
      <option value="${c.id}" ${job.contactIds?.includes(c.id) ? 'selected' : ''}>
        ${JobCard.escapeHtml(c.name)} - ${JobCard.escapeHtml(c.company)}
      </option>
    `).join('');

    const content = `
      <div class="modal-header">
        <h2 class="modal-title">${isEdit ? 'Edit Job' : 'Add New Job'}</h2>
        <button class="modal-close" onclick="Modal.close()">&times;</button>
      </div>
      <form id="job-form" onsubmit="JobForm.handleSubmit(event)">
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="company">Company *</label>
              <input type="text" id="company" class="form-input" value="${JobCard.escapeHtml(job.company)}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="role">Role *</label>
              <input type="text" id="role" class="form-input" value="${JobCard.escapeHtml(job.role)}" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="location">Location</label>
              <input type="text" id="location" class="form-input" value="${JobCard.escapeHtml(job.location)}" placeholder="City, State">
            </div>
            <div class="form-group">
              <label class="form-label" for="remote">Work Type</label>
              <select id="remote" class="form-select">
                <option value="onsite" ${job.remote === 'onsite' ? 'selected' : ''}>On-site</option>
                <option value="hybrid" ${job.remote === 'hybrid' ? 'selected' : ''}>Hybrid</option>
                <option value="remote" ${job.remote === 'remote' ? 'selected' : ''}>Remote</option>
              </select>
            </div>
          </div>

          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label" for="salaryMin">Salary Min</label>
              <input type="number" id="salaryMin" class="form-input" value="${job.salary?.min || ''}" placeholder="50000">
            </div>
            <div class="form-group">
              <label class="form-label" for="salaryMax">Salary Max</label>
              <input type="number" id="salaryMax" class="form-input" value="${job.salary?.max || ''}" placeholder="80000">
            </div>
            <div class="form-group">
              <label class="form-label" for="currency">Currency</label>
              <select id="currency" class="form-select">
                <option value="USD" ${job.salary?.currency === 'USD' ? 'selected' : ''}>USD</option>
                <option value="EUR" ${job.salary?.currency === 'EUR' ? 'selected' : ''}>EUR</option>
                <option value="GBP" ${job.salary?.currency === 'GBP' ? 'selected' : ''}>GBP</option>
                <option value="CAD" ${job.salary?.currency === 'CAD' ? 'selected' : ''}>CAD</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="status">Status</label>
              <select id="status" class="form-select">
                <option value="interested" ${job.status === 'interested' ? 'selected' : ''}>Interested</option>
                <option value="applied" ${job.status === 'applied' ? 'selected' : ''}>Applied</option>
                <option value="phone_screen" ${job.status === 'phone_screen' ? 'selected' : ''}>Phone Screen</option>
                <option value="interview" ${job.status === 'interview' ? 'selected' : ''}>Interview</option>
                <option value="offer" ${job.status === 'offer' ? 'selected' : ''}>Offer</option>
                <option value="accepted" ${job.status === 'accepted' ? 'selected' : ''}>Accepted</option>
                <option value="rejected" ${job.status === 'rejected' ? 'selected' : ''}>Rejected</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="appliedDate">Applied Date</label>
              <input type="date" id="appliedDate" class="form-input" value="${job.appliedDate || ''}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="url">Job URL</label>
            <input type="url" id="url" class="form-input" value="${JobCard.escapeHtml(job.url)}" placeholder="https://...">
          </div>

          <div class="form-group">
            <label class="form-label" for="description">Job Description</label>
            <textarea id="description" class="form-textarea" placeholder="Paste or summarize the job description...">${JobCard.escapeHtml(job.description)}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="notes">Notes</label>
            <textarea id="notes" class="form-textarea" placeholder="Your notes about this opportunity...">${JobCard.escapeHtml(job.notes)}</textarea>
          </div>

          ${contacts.length > 0 ? `
            <div class="form-group">
              <label class="form-label" for="contacts">Linked Contacts</label>
              <select id="contacts" class="form-select" multiple style="min-height: 80px;">
                ${contactOptions}
              </select>
              <p class="text-muted text-sm mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>
          ` : ''}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Job'}</button>
        </div>
      </form>
    `;

    Modal.open(content);
  },

  handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const contactSelect = form.querySelector('#contacts');
    const selectedContacts = contactSelect
      ? Array.from(contactSelect.selectedOptions).map(opt => opt.value)
      : [];

    const jobData = {
      company: form.querySelector('#company').value.trim(),
      role: form.querySelector('#role').value.trim(),
      location: form.querySelector('#location').value.trim(),
      remote: form.querySelector('#remote').value,
      salary: {
        min: parseInt(form.querySelector('#salaryMin').value) || null,
        max: parseInt(form.querySelector('#salaryMax').value) || null,
        currency: form.querySelector('#currency').value
      },
      status: form.querySelector('#status').value,
      appliedDate: form.querySelector('#appliedDate').value || null,
      url: form.querySelector('#url').value.trim(),
      description: form.querySelector('#description').value.trim(),
      notes: form.querySelector('#notes').value.trim(),
      contactIds: selectedContacts
    };

    if (this.currentJobId) {
      State.updateJob(this.currentJobId, jobData);
    } else {
      State.addJob(jobData);
    }

    Modal.close();
  }
};

window.JobForm = JobForm;
