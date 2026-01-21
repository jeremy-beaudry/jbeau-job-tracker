// Data Manager - Export/Import functionality

const DataManager = {
  toggleMenu() {
    const menu = document.getElementById('data-menu');
    menu.classList.toggle('show');

    // Close menu when clicking outside
    const closeMenu = (e) => {
      if (!e.target.closest('#data-dropdown')) {
        menu.classList.remove('show');
        document.removeEventListener('click', closeMenu);
      }
    };

    if (menu.classList.contains('show')) {
      setTimeout(() => document.addEventListener('click', closeMenu), 0);
    }
  },

  export() {
    StorageService.exportData();
    document.getElementById('data-menu').classList.remove('show');
  },

  showImport() {
    document.getElementById('data-menu').classList.remove('show');

    const jobs = StorageService.getJobs();
    const contacts = StorageService.getContacts();
    const hasData = jobs.length > 0 || contacts.length > 0;

    if (hasData) {
      Modal.confirm(
        'Import Data',
        `You have existing data (${jobs.length} jobs, ${contacts.length} contacts). Importing will replace all current data. Are you sure you want to continue?`,
        () => {
          document.getElementById('import-file-input').click();
        }
      );
    } else {
      document.getElementById('import-file-input').click();
    }
  },

  async handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await StorageService.importData(file);

      // Refresh the app state
      State.refreshJobs();
      State.refreshContacts();

      // Show success message
      Modal.alert(
        'Import Successful',
        `Successfully imported ${result.jobs} jobs and ${result.contacts} contacts.`
      );
    } catch (error) {
      Modal.alert(
        'Import Failed',
        error.message || 'Failed to import data. Please check the file format.'
      );
    }

    // Reset file input so the same file can be selected again
    event.target.value = '';
  }
};

window.DataManager = DataManager;
