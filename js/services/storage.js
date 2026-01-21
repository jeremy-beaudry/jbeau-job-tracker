// Storage Service - localStorage abstraction for easy future migration

const StorageService = {
  KEYS: {
    JOBS: 'jobtracker_jobs',
    CONTACTS: 'jobtracker_contacts',
    ACTIVITY: 'jobtracker_activity'
  },

  // Generic CRUD operations
  getAll(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Error reading ${key}:`, e);
      return [];
    }
  },

  setAll(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(`Error writing ${key}:`, e);
      return false;
    }
  },

  getById(key, id) {
    const items = this.getAll(key);
    return items.find(item => item.id === id) || null;
  },

  create(key, item) {
    const items = this.getAll(key);
    const newItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.unshift(newItem);
    this.setAll(key, items);
    return newItem;
  },

  update(key, id, updates) {
    const items = this.getAll(key);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.setAll(key, items);
    return items[index];
  },

  delete(key, id) {
    const items = this.getAll(key);
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length === items.length) return false;
    this.setAll(key, filtered);
    return true;
  },

  // Helper functions
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  // Jobs specific
  getJobs() {
    return this.getAll(this.KEYS.JOBS);
  },

  getJob(id) {
    return this.getById(this.KEYS.JOBS, id);
  },

  createJob(job) {
    const now = new Date().toISOString();
    const initialStatus = job.status || 'interested';

    // Initialize status history with the creation event
    const statusHistory = [{
      status: initialStatus,
      date: now,
      note: 'Job added'
    }];

    const newJob = this.create(this.KEYS.JOBS, {
      company: '',
      role: '',
      salary: { min: null, max: null, currency: 'USD' },
      location: '',
      remote: 'onsite',
      status: initialStatus,
      description: '',
      url: '',
      appliedDate: null,
      notes: '',
      contactIds: [],
      documents: [],
      statusHistory,
      ...job,
      statusHistory // Ensure statusHistory isn't overwritten by spread
    });
    this.logActivity('added', 'job', newJob);
    return newJob;
  },

  updateJob(id, updates) {
    const oldJob = this.getJob(id);
    if (!oldJob) return null;

    // If status is changing, add to status history
    if (updates.status && oldJob.status !== updates.status) {
      const statusHistory = oldJob.statusHistory || [];
      statusHistory.push({
        status: updates.status,
        date: new Date().toISOString(),
        note: updates.statusNote || null
      });
      updates.statusHistory = statusHistory;
      delete updates.statusNote; // Don't store this separately
    }

    const updatedJob = this.update(this.KEYS.JOBS, id, updates);
    if (updatedJob && oldJob && oldJob.status !== updatedJob.status) {
      this.logActivity('status', 'job', updatedJob, { from: oldJob.status, to: updatedJob.status });
    } else if (updatedJob) {
      this.logActivity('updated', 'job', updatedJob);
    }
    return updatedJob;
  },

  // Add a status change with optional note and custom date
  addStatusToHistory(jobId, status, date = null, note = null) {
    const job = this.getJob(jobId);
    if (!job) return null;

    const statusHistory = job.statusHistory || [];
    statusHistory.push({
      status,
      date: date || new Date().toISOString(),
      note
    });

    // Sort by date
    statusHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

    return this.update(this.KEYS.JOBS, jobId, {
      status,
      statusHistory
    });
  },

  // Update a specific status history entry
  updateStatusHistory(jobId, index, updates) {
    const job = this.getJob(jobId);
    if (!job || !job.statusHistory || !job.statusHistory[index]) return null;

    const statusHistory = [...job.statusHistory];
    statusHistory[index] = { ...statusHistory[index], ...updates };

    // Sort by date after update
    statusHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

    return this.update(this.KEYS.JOBS, jobId, { statusHistory });
  },

  // Delete a specific status history entry
  deleteStatusHistory(jobId, index) {
    const job = this.getJob(jobId);
    if (!job || !job.statusHistory || !job.statusHistory[index]) return null;
    if (job.statusHistory.length <= 1) return null; // Don't delete the last entry

    const statusHistory = [...job.statusHistory];
    statusHistory.splice(index, 1);

    // Update job status to the latest in history after deletion
    const latestStatus = statusHistory[statusHistory.length - 1].status;

    return this.update(this.KEYS.JOBS, jobId, {
      statusHistory,
      status: latestStatus
    });
  },

  deleteJob(id) {
    return this.delete(this.KEYS.JOBS, id);
  },

  // Contacts specific
  getContacts() {
    return this.getAll(this.KEYS.CONTACTS);
  },

  getContact(id) {
    return this.getById(this.KEYS.CONTACTS, id);
  },

  createContact(contact) {
    const newContact = this.create(this.KEYS.CONTACTS, {
      name: '',
      email: '',
      phone: '',
      company: '',
      role: '',
      linkedIn: '',
      notes: '',
      communications: [],
      ...contact
    });
    this.logActivity('added', 'contact', newContact);
    return newContact;
  },

  updateContact(id, updates) {
    const updated = this.update(this.KEYS.CONTACTS, id, updates);
    if (updated) {
      this.logActivity('updated', 'contact', updated);
    }
    return updated;
  },

  deleteContact(id) {
    // Also remove contact from any linked jobs
    const jobs = this.getJobs();
    jobs.forEach(job => {
      if (job.contactIds && job.contactIds.includes(id)) {
        this.update(this.KEYS.JOBS, job.id, {
          contactIds: job.contactIds.filter(cid => cid !== id)
        });
      }
    });
    return this.delete(this.KEYS.CONTACTS, id);
  },

  addCommunication(contactId, communication) {
    const contact = this.getContact(contactId);
    if (!contact) return null;

    const newComm = {
      id: this.generateId(),
      date: new Date().toISOString(),
      type: 'note',
      notes: '',
      ...communication
    };

    const communications = [...(contact.communications || []), newComm];
    return this.update(this.KEYS.CONTACTS, contactId, { communications });
  },

  // Activity log
  logActivity(type, entityType, entity, extra = {}) {
    const activities = this.getAll(this.KEYS.ACTIVITY);
    const activity = {
      id: this.generateId(),
      type,
      entityType,
      entityId: entity.id,
      entityName: entityType === 'job' ? `${entity.role} at ${entity.company}` : entity.name,
      timestamp: new Date().toISOString(),
      ...extra
    };
    activities.unshift(activity);
    // Keep only last 50 activities
    this.setAll(this.KEYS.ACTIVITY, activities.slice(0, 50));
    return activity;
  },

  getActivities(limit = 10) {
    return this.getAll(this.KEYS.ACTIVITY).slice(0, limit);
  },

  // Analytics
// Export/Import functionality
  exportData() {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      jobs: this.getAll(this.KEYS.JOBS),
      contacts: this.getAll(this.KEYS.CONTACTS),
      activity: this.getAll(this.KEYS.ACTIVITY)
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);

          // Validate the data structure
          if (!data.jobs || !data.contacts) {
            reject(new Error('Invalid backup file format'));
            return;
          }

          // Import the data
          this.setAll(this.KEYS.JOBS, data.jobs);
          this.setAll(this.KEYS.CONTACTS, data.contacts);
          if (data.activity) {
            this.setAll(this.KEYS.ACTIVITY, data.activity);
          }

          resolve({
            jobs: data.jobs.length,
            contacts: data.contacts.length
          });
        } catch (err) {
          reject(new Error('Failed to parse backup file'));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  getJobStats() {
    const jobs = this.getJobs();
    const total = jobs.length;

    const byStatus = {
      interested: 0,
      applied: 0,
      phone_screen: 0,
      interview: 0,
      offer: 0,
      accepted: 0,
      rejected: 0
    };

    // Track jobs that have ever reached "applied" or beyond (using status history)
    let totalApplied = 0;
    let gotResponse = 0;

    jobs.forEach(job => {
      if (byStatus.hasOwnProperty(job.status)) {
        byStatus[job.status]++;
      }

      // Check if this job has ever been applied to by looking at status history
      const history = job.statusHistory || [];
      const hasApplied = history.some(entry =>
        ['applied', 'phone_screen', 'interview', 'offer', 'accepted', 'rejected'].includes(entry.status)
      );

      if (hasApplied) {
        totalApplied++;

        // Check if they got a response (moved beyond "applied")
        const hasResponse = history.some(entry =>
          ['phone_screen', 'interview', 'offer', 'accepted'].includes(entry.status)
        );

        if (hasResponse) {
          gotResponse++;
        }
      }
    });

    const activeJobs = total - byStatus.rejected - byStatus.accepted;
    const responseRate = totalApplied > 0
      ? Math.round((gotResponse / totalApplied) * 100)
      : 0;

    return {
      total,
      activeJobs,
      responseRate,
      byStatus,
      totalApplied,
      gotResponse
    };
  }
};

// Make available globally
window.StorageService = StorageService;
