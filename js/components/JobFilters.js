// Job Filters Component

const JobFilters = {
  render() {
    const filters = State.get('filters');

    return `
      <div class="search-filters">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            class="form-input"
            placeholder="Search jobs..."
            value="${filters.search}"
            oninput="JobFilters.handleSearch(this.value)"
          >
        </div>
        <div class="filter-group">
          <button class="filter-chip ${filters.status === 'all' ? 'active' : ''}" onclick="JobFilters.setStatus('all')">All</button>
          <button class="filter-chip ${filters.status === 'interested' ? 'active' : ''}" onclick="JobFilters.setStatus('interested')">Interested</button>
          <button class="filter-chip ${filters.status === 'applied' ? 'active' : ''}" onclick="JobFilters.setStatus('applied')">Applied</button>
          <button class="filter-chip ${filters.status === 'phone_screen' ? 'active' : ''}" onclick="JobFilters.setStatus('phone_screen')">Phone Screen</button>
          <button class="filter-chip ${filters.status === 'interview' ? 'active' : ''}" onclick="JobFilters.setStatus('interview')">Interview</button>
          <button class="filter-chip ${filters.status === 'offer' ? 'active' : ''}" onclick="JobFilters.setStatus('offer')">Offer</button>
        </div>
      </div>
    `;
  },

  handleSearch(value) {
    State.setFilter('search', value);
  },

  setStatus(status) {
    State.setFilter('status', status);
  },

  setRemote(remote) {
    State.setFilter('remote', remote);
  }
};

window.JobFilters = JobFilters;
