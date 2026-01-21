// Modal Component

const Modal = {
  overlay: null,
  container: null,

  init() {
    this.overlay = document.getElementById('modal-overlay');
    this.container = document.getElementById('modal-container');

    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.overlay.classList.contains('hidden')) {
        this.close();
      }
    });
  },

  open(content) {
    this.container.innerHTML = content;
    this.overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Focus first input if exists
    const firstInput = this.container.querySelector('input, select, textarea');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  },

  close() {
    this.overlay.classList.add('hidden');
    document.body.style.overflow = '';
    this.container.innerHTML = '';
  },

  confirm(title, message, onConfirm) {
    const content = `
      <div class="modal-header">
        <h2 class="modal-title">Confirm</h2>
        <button class="modal-close" onclick="Modal.close()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="confirm-dialog">
          <div class="confirm-dialog-icon">!</div>
          <h3>${title}</h3>
          <p>${message}</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-danger" id="confirm-btn">Delete</button>
      </div>
    `;

    this.open(content);

    document.getElementById('confirm-btn').addEventListener('click', () => {
      onConfirm();
      this.close();
    });
  }
};

window.Modal = Modal;
