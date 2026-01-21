// Jobs Page

const JobsPage = {
  render() {
    const jobs = State.getFilteredJobs();

    const jobCards = jobs.length > 0
      ? jobs.map(job => JobCard.render(job)).join('')
      : `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <h3 class="empty-state-title">No jobs found</h3>
          <p>Add your first job opportunity to get started tracking your applications.</p>
          <button class="btn btn-primary mt-4" onclick="JobForm.openNew()">+ Add Your First Job</button>
        </div>
      `;

    return `
      <div class="page-header">
        <h1 class="page-title">Jobs</h1>
        <button class="btn btn-primary" onclick="JobForm.openNew()">+ Add Job</button>
      </div>

      ${JobFilters.render()}

      <div class="job-list">
        ${jobCards}
      </div>
    `;
  },

  init() {
    // Subscribe to data changes
    State.subscribe('jobs', () => this.refresh());
    State.subscribe('filters', () => this.refresh());
  },

  refresh() {
    if (State.get('currentPage') === 'jobs') {
      document.getElementById('page-content').innerHTML = this.render();
    }
  },

  showDetail(jobId) {
    const job = StorageService.getJob(jobId);
    if (!job) return;

    const contacts = (job.contactIds || [])
      .map(id => StorageService.getContact(id))
      .filter(c => c);

    const salary = JobCard.formatSalary(job.salary);
    const statusLabel = JobCard.statusLabels[job.status] || job.status;
    const remoteLabel = JobCard.remoteLabels[job.remote] || job.remote;

    const content = `
      <div class="modal-header">
        <h2 class="modal-title">Job Details</h2>
        <button class="modal-close" onclick="Modal.close()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="job-detail-header">
          <div class="job-detail-company">${JobCard.escapeHtml(job.company)}</div>
          <div class="job-detail-role">${JobCard.escapeHtml(job.role)}</div>
          <div class="job-detail-meta">
            <span class="badge badge-${job.status}">${statusLabel}</span>
            ${job.location ? `<span>📍 ${JobCard.escapeHtml(job.location)}</span>` : ''}
            ${salary ? `<span>💰 ${salary}</span>` : ''}
            <span>🏢 ${remoteLabel}</span>
          </div>
        </div>

        ${job.url ? `
          <div class="job-detail-section">
            <h3>Job Posting</h3>
            <p><a href="${JobCard.escapeHtml(job.url)}" target="_blank">${JobCard.escapeHtml(job.url)}</a></p>
          </div>
        ` : ''}

        ${job.description ? `
          <div class="job-detail-section">
            <h3>Description</h3>
            <p>${JobCard.escapeHtml(job.description)}</p>
          </div>
        ` : ''}

        ${job.notes ? `
          <div class="job-detail-section">
            <h3>Notes</h3>
            <p>${JobCard.escapeHtml(job.notes)}</p>
          </div>
        ` : ''}

        ${contacts.length > 0 ? `
          <div class="job-detail-section">
            <h3>Linked Contacts</h3>
            <div class="linked-contacts">
              ${contacts.map(c => `
                <span class="linked-contact-chip" onclick="Modal.close(); setTimeout(() => ContactCard.showDetail('${c.id}'), 100)">
                  <span class="avatar-sm">${ContactCard.getInitials(c.name)}</span>
                  ${ContactCard.escapeHtml(c.name)}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="job-detail-section">
          <h3>Timeline</h3>
          ${this.renderTimeline(job)}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-danger" onclick="JobCard.confirmDelete('${job.id}')">Delete</button>
        <button class="btn btn-secondary" onclick="Modal.close()">Close</button>
        <button class="btn btn-primary" onclick="Modal.close(); JobForm.openEdit('${job.id}')">Edit</button>
      </div>
    `;

    Modal.open(content);
  },

  // Parse date string as local time to avoid timezone issues
  parseLocalDate(dateStr) {
    // If it's an ISO string with time, extract just the date part
    const datePart = dateStr.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day);
  },

  renderTimeline(job) {
    const statusHistory = job.statusHistory || [];

    // If no history, show legacy format
    if (statusHistory.length === 0) {
      return `
        <p class="text-muted text-sm">
          Added: ${new Date(job.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          ${job.appliedDate ? `<br>Applied: ${new Date(job.appliedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}
        </p>
      `;
    }

    const timelineItems = statusHistory.map((entry, index) => {
      const statusLabel = JobCard.statusLabels[entry.status] || entry.status;
      const date = this.parseLocalDate(entry.date);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const isLatest = index === statusHistory.length - 1;

      return `
        <div class="timeline-item ${isLatest ? 'timeline-item-current' : ''}">
          <div class="timeline-marker ${entry.status}"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <span class="timeline-status">${statusLabel}</span>
              <span class="timeline-date">${formattedDate}</span>
              <button class="btn btn-sm timeline-edit-btn" onclick="event.stopPropagation(); JobsPage.editTimelineEntry('${job.id}', ${index})">Edit</button>
            </div>
            ${entry.note ? `<p class="timeline-note">${JobCard.escapeHtml(entry.note)}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="timeline">
        ${timelineItems}
      </div>
      <button class="btn btn-secondary btn-sm mt-2" onclick="JobsPage.addTimelineEntry('${job.id}')">+ Add Status Update</button>
    `;
  },

  addTimelineEntry(jobId) {
    const job = StorageService.getJob(jobId);
    if (!job) return;

    const content = `
      <div class="modal-header">
        <h2 class="modal-title">Add Status Update</h2>
        <button class="modal-close" onclick="JobsPage.showDetail('${jobId}')">&times;</button>
      </div>
      <form id="timeline-form" onsubmit="JobsPage.handleAddTimeline(event, '${jobId}')">
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="timelineStatus">Status</label>
              <select id="timelineStatus" class="form-select" required>
                <option value="interested">Interested</option>
                <option value="applied">Applied</option>
                <option value="phone_screen">Phone Screen</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="timelineDate">Date</label>
              <input type="date" id="timelineDate" class="form-input" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="timelineNote">Note (optional)</label>
            <textarea id="timelineNote" class="form-textarea" placeholder="Any details about this status change..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="JobsPage.showDetail('${jobId}')">Cancel</button>
          <button type="submit" class="btn btn-primary">Add Update</button>
        </div>
      </form>
    `;

    Modal.open(content);
  },

  handleAddTimeline(event, jobId) {
    event.preventDefault();
    const form = event.target;

    const status = form.querySelector('#timelineStatus').value;
    const date = form.querySelector('#timelineDate').value;
    const note = form.querySelector('#timelineNote').value.trim();

    // Store as ISO string but with time set to noon to avoid timezone edge cases
    const dateWithTime = date + 'T12:00:00';
    StorageService.addStatusToHistory(jobId, status, dateWithTime, note || null);
    State.refreshJobs();
    this.showDetail(jobId);
  },

  editTimelineEntry(jobId, index) {
    const job = StorageService.getJob(jobId);
    if (!job || !job.statusHistory || !job.statusHistory[index]) return;

    const entry = job.statusHistory[index];
    // Extract date part directly to avoid timezone conversion
    const entryDate = entry.date.split('T')[0];
    const canDelete = job.statusHistory.length > 1;

    const content = `
      <div class="modal-header">
        <h2 class="modal-title">Edit Status Entry</h2>
        <button class="modal-close" onclick="JobsPage.showDetail('${jobId}')">&times;</button>
      </div>
      <form id="timeline-edit-form" onsubmit="JobsPage.handleEditTimeline(event, '${jobId}', ${index})">
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="timelineStatus">Status</label>
              <select id="timelineStatus" class="form-select" required>
                <option value="interested" ${entry.status === 'interested' ? 'selected' : ''}>Interested</option>
                <option value="applied" ${entry.status === 'applied' ? 'selected' : ''}>Applied</option>
                <option value="phone_screen" ${entry.status === 'phone_screen' ? 'selected' : ''}>Phone Screen</option>
                <option value="interview" ${entry.status === 'interview' ? 'selected' : ''}>Interview</option>
                <option value="offer" ${entry.status === 'offer' ? 'selected' : ''}>Offer</option>
                <option value="accepted" ${entry.status === 'accepted' ? 'selected' : ''}>Accepted</option>
                <option value="rejected" ${entry.status === 'rejected' ? 'selected' : ''}>Rejected</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="timelineDate">Date</label>
              <input type="date" id="timelineDate" class="form-input" value="${entryDate}" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="timelineNote">Note (optional)</label>
            <textarea id="timelineNote" class="form-textarea" placeholder="Any details about this status change...">${JobCard.escapeHtml(entry.note || '')}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          ${canDelete ? `<button type="button" class="btn btn-danger" onclick="JobsPage.confirmDeleteTimelineEntry('${jobId}', ${index})">Delete</button>` : ''}
          <button type="button" class="btn btn-secondary" onclick="JobsPage.showDetail('${jobId}')">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </div>
      </form>
    `;

    Modal.open(content);
  },

  confirmDeleteTimelineEntry(jobId, index) {
    const job = StorageService.getJob(jobId);
    if (!job || !job.statusHistory || !job.statusHistory[index]) return;

    const entry = job.statusHistory[index];
    const statusLabel = JobCard.statusLabels[entry.status] || entry.status;

    Modal.confirm(
      'Delete Status Entry',
      `Are you sure you want to delete the "${statusLabel}" status from the timeline?`,
      () => {
        StorageService.deleteStatusHistory(jobId, index);
        State.refreshJobs();
        this.showDetail(jobId);
      }
    );
  },

  handleEditTimeline(event, jobId, index) {
    event.preventDefault();
    const form = event.target;

    const status = form.querySelector('#timelineStatus').value;
    const date = form.querySelector('#timelineDate').value;
    const note = form.querySelector('#timelineNote').value.trim();

    // Store as ISO string but with time set to noon to avoid timezone edge cases
    const dateWithTime = date + 'T12:00:00';
    StorageService.updateStatusHistory(jobId, index, {
      status,
      date: dateWithTime,
      note: note || null
    });

    // Update the current job status to the latest in history
    const job = StorageService.getJob(jobId);
    if (job && job.statusHistory && job.statusHistory.length > 0) {
      const latestStatus = job.statusHistory[job.statusHistory.length - 1].status;
      if (job.status !== latestStatus) {
        StorageService.update(StorageService.KEYS.JOBS, jobId, { status: latestStatus });
      }
    }

    State.refreshJobs();
    this.showDetail(jobId);
  }
};

window.JobsPage = JobsPage;
