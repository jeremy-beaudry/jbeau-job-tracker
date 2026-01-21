// Stats Cards Component

const StatsCards = {
  render() {
    const stats = StorageService.getJobStats();
    const contacts = StorageService.getContacts();

    return `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-label">Total Jobs</span>
            <div class="stat-card-icon blue">📋</div>
          </div>
          <div class="stat-card-value">${stats.total}</div>
          <div class="stat-card-change text-muted">All tracked opportunities</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-label">Active Pipeline</span>
            <div class="stat-card-icon green">🎯</div>
          </div>
          <div class="stat-card-value">${stats.activeJobs}</div>
          <div class="stat-card-change text-muted">Excluding rejected/accepted</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-label">Response Rate</span>
            <div class="stat-card-icon yellow">📊</div>
          </div>
          <div class="stat-card-value">${stats.responseRate}%</div>
          <div class="stat-card-change text-muted">From applications sent</div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-label">Contacts</span>
            <div class="stat-card-icon purple">👥</div>
          </div>
          <div class="stat-card-value">${contacts.length}</div>
          <div class="stat-card-change text-muted">People in your network</div>
        </div>
      </div>
    `;
  }
};

window.StatsCards = StatsCards;
