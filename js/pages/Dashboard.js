// Dashboard Page

const DashboardPage = {
  render() {
    return `
      <div class="page-header">
        <h1 class="page-title">Dashboard</h1>
        <button class="btn btn-primary" onclick="JobForm.openNew()">+ Add Job</button>
      </div>

      ${StatsCards.render()}

      <div class="dashboard-grid">
        ${PipelineChart.render()}
        ${RecentActivity.render()}
      </div>
    `;
  },

  init() {
    // Subscribe to data changes
    State.subscribe('jobs', () => this.refresh());
    State.subscribe('activities', () => this.refresh());
  },

  refresh() {
    if (State.get('currentPage') === 'dashboard') {
      document.getElementById('page-content').innerHTML = this.render();
    }
  }
};

window.DashboardPage = DashboardPage;
