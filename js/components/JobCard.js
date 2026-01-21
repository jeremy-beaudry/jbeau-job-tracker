// Job Card Component

const JobCard = {
  statusLabels: {
    interested: 'Interested',
    applied: 'Applied',
    phone_screen: 'Phone Screen',
    interview: 'Interview',
    offer: 'Offer',
    accepted: 'Accepted',
    rejected: 'Rejected'
  },

  remoteLabels: {
    onsite: 'On-site',
    hybrid: 'Hybrid',
    remote: 'Remote'
  },

  render(job) {
    const salary = this.formatSalary(job.salary);
    const appliedDate = job.appliedDate ? this.formatDate(job.appliedDate) : null;
    const statusLabel = this.statusLabels[job.status] || job.status;
    const remoteLabel = this.remoteLabels[job.remote] || job.remote;

    return `
      <div class="job-card" data-job-id="${job.id}" onclick="JobCard.handleClick('${job.id}')">
        <div class="job-card-header">
          <div>
            <div class="job-card-company">${this.escapeHtml(job.company)}</div>
            <div class="job-card-role">${this.escapeHtml(job.role)}</div>
          </div>
          <span class="badge badge-${job.status}">${statusLabel}</span>
        </div>
        <div class="job-card-meta">
          ${job.location ? `<span class="job-card-meta-item">📍 ${this.escapeHtml(job.location)}</span>` : ''}
          ${salary ? `<span class="job-card-meta-item">💰 ${salary}</span>` : ''}
          <span class="job-card-meta-item">🏢 ${remoteLabel}</span>
        </div>
        <div class="job-card-footer">
          <span class="job-card-date">${appliedDate ? `Applied ${appliedDate}` : 'Not yet applied'}</span>
          <div class="job-card-actions" onclick="event.stopPropagation()">
            <button class="btn btn-secondary btn-sm" onclick="JobForm.openEdit('${job.id}')">Edit</button>
            <button class="btn btn-secondary btn-sm btn-icon" onclick="JobCard.showStatusMenu(event, '${job.id}')">▼</button>
          </div>
        </div>
      </div>
    `;
  },

  handleClick(jobId) {
    JobsPage.showDetail(jobId);
  },

  showStatusMenu(event, jobId) {
    event.stopPropagation();
    const button = event.currentTarget;
    const existingMenu = document.querySelector('.dropdown-menu.show');
    if (existingMenu) {
      existingMenu.remove();
    }

    const menu = document.createElement('div');
    menu.className = 'dropdown-menu show';
    menu.style.position = 'fixed';
    menu.style.top = `${button.getBoundingClientRect().bottom + 4}px`;
    menu.style.left = `${button.getBoundingClientRect().left}px`;

    const statuses = Object.entries(this.statusLabels);
    menu.innerHTML = statuses.map(([key, label]) => `
      <button class="dropdown-item" onclick="JobCard.updateStatus('${jobId}', '${key}')">${label}</button>
    `).join('') + `
      <hr style="margin: 0.25rem 0; border: none; border-top: 1px solid var(--gray-200);">
      <button class="dropdown-item danger" onclick="JobCard.confirmDelete('${jobId}')">Delete</button>
    `;

    document.body.appendChild(menu);

    // Close menu on outside click
    const closeMenu = (e) => {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
  },

  updateStatus(jobId, status) {
    State.updateJob(jobId, { status });
    document.querySelector('.dropdown-menu.show')?.remove();
  },

  confirmDelete(jobId) {
    document.querySelector('.dropdown-menu.show')?.remove();
    const job = StorageService.getJob(jobId);
    Modal.confirm(
      'Delete Job',
      `Are you sure you want to delete "${job.role} at ${job.company}"?`,
      () => State.deleteJob(jobId)
    );
  },

  formatSalary(salary) {
    if (!salary || (!salary.min && !salary.max)) return null;

    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salary.currency || 'USD',
      maximumFractionDigits: 0
    });

    if (salary.min && salary.max) {
      return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
    }
    return formatter.format(salary.min || salary.max);
  },

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

window.JobCard = JobCard;
