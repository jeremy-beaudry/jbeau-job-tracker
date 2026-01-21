// Pipeline Chart Component (CSS-based bar chart)

const PipelineChart = {
  stages: [
    { key: 'interested', label: 'Interested' },
    { key: 'applied', label: 'Applied' },
    { key: 'phone_screen', label: 'Phone Screen' },
    { key: 'interview', label: 'Interview' },
    { key: 'offer', label: 'Offer' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'rejected', label: 'Rejected' }
  ],

  render() {
    const stats = StorageService.getJobStats();
    const maxCount = Math.max(...Object.values(stats.byStatus), 1);

    const bars = this.stages.map(stage => {
      const count = stats.byStatus[stage.key] || 0;
      const percentage = (count / maxCount) * 100;

      return `
        <div class="pipeline-bar">
          <span class="pipeline-label">${stage.label}</span>
          <div class="pipeline-track">
            <div class="pipeline-fill ${stage.key}" style="width: ${percentage}%"></div>
          </div>
          <span class="pipeline-count">${count}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Application Pipeline</h3>
        </div>
        <div class="card-body">
          <div class="pipeline-chart">
            ${stats.total > 0 ? bars : `
              <div class="empty-state">
                <p class="text-muted">No jobs tracked yet. Add your first job to see the pipeline.</p>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }
};

window.PipelineChart = PipelineChart;
