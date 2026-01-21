// Recent Activity Component

const RecentActivity = {
  render() {
    const activities = StorageService.getActivities(8);

    const activityItems = activities.map(activity => {
      const icon = this.getIcon(activity.type);
      const text = this.getText(activity);
      const time = this.formatTime(activity.timestamp);

      return `
        <div class="activity-item">
          <div class="activity-icon ${activity.type}">${icon}</div>
          <div class="activity-content">
            <div class="activity-text">${text}</div>
            <div class="activity-time">${time}</div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Recent Activity</h3>
        </div>
        <div class="card-body">
          ${activities.length > 0 ? `
            <div class="activity-list">
              ${activityItems}
            </div>
          ` : `
            <div class="empty-state">
              <p class="text-muted">No activity yet. Start tracking jobs to see your activity here.</p>
            </div>
          `}
        </div>
      </div>
    `;
  },

  getIcon(type) {
    const icons = {
      added: '+',
      updated: '✎',
      status: '→'
    };
    return icons[type] || '•';
  },

  getText(activity) {
    const name = this.escapeHtml(activity.entityName);

    switch (activity.type) {
      case 'added':
        return `Added <strong>${name}</strong>`;
      case 'updated':
        return `Updated <strong>${name}</strong>`;
      case 'status':
        const fromLabel = JobCard.statusLabels[activity.from] || activity.from;
        const toLabel = JobCard.statusLabels[activity.to] || activity.to;
        return `<strong>${name}</strong> moved from ${fromLabel} to ${toLabel}`;
      default:
        return `${activity.type} ${name}`;
    }
  },

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

window.RecentActivity = RecentActivity;
