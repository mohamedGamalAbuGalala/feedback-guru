import { captureScreenshot } from '../capture/screenshot';

export interface FeedbackModalConfig {
  primaryColor: string;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
}

export class FeedbackModal {
  private config: FeedbackModalConfig;
  private overlay: HTMLElement;
  private container: HTMLElement;
  private screenshotCanvas: HTMLCanvasElement | null = null;
  private screenshotData: string | null = null;

  constructor(config: FeedbackModalConfig) {
    this.config = config;
    this.overlay = this.createOverlay();
    this.container = this.createModal();
    this.overlay.appendChild(this.container);
    document.body.appendChild(this.overlay);
  }

  private createOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'fg-modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 1000000;
      background: rgba(0, 0, 0, 0.5);
      display: none;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(4px);
      animation: fg-fade-in 0.2s ease;
    `;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.config.onClose();
      }
    });

    return overlay;
  }

  private createModal(): HTMLElement {
    const modal = document.createElement('div');
    modal.id = 'fg-modal';
    modal.innerHTML = this.getModalHTML();
    this.applyModalStyles(modal);
    this.attachEventListeners(modal);
    return modal;
  }

  private getModalHTML(): string {
    return `
      <div class="fg-modal-header">
        <h2>Send us your feedback</h2>
        <button type="button" class="fg-close" aria-label="Close">×</button>
      </div>
      <form class="fg-modal-body" id="fg-feedback-form">
        <div class="fg-form-group">
          <label>What type of feedback?</label>
          <div class="fg-category-buttons">
            <button type="button" class="fg-category-btn" data-category="BUG">
              🐛 Bug
            </button>
            <button type="button" class="fg-category-btn" data-category="FEATURE_REQUEST">
              ✨ Feature
            </button>
            <button type="button" class="fg-category-btn" data-category="IMPROVEMENT">
              💡 Improvement
            </button>
            <button type="button" class="fg-category-btn" data-category="OTHER">
              💬 Other
            </button>
          </div>
          <input type="hidden" name="category" value="BUG" required>
        </div>

        <div class="fg-form-group">
          <label>Priority</label>
          <select name="priority" class="fg-input">
            <option value="LOW">Low</option>
            <option value="MEDIUM" selected>Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div class="fg-form-group">
          <label>Description *</label>
          <textarea
            name="description"
            class="fg-textarea"
            placeholder="Describe the issue or your suggestion..."
            rows="4"
            required
            minlength="10"
          ></textarea>
        </div>

        <div class="fg-form-row">
          <div class="fg-form-group">
            <label>Name (optional)</label>
            <input type="text" name="name" class="fg-input" placeholder="Your name">
          </div>
          <div class="fg-form-group">
            <label>Email (optional)</label>
            <input type="email" name="email" class="fg-input" placeholder="your@email.com">
          </div>
        </div>

        <div class="fg-form-group">
          <div class="fg-screenshot-section">
            <button type="button" class="fg-btn-secondary" id="fg-take-screenshot">
              📸 Take Screenshot
            </button>
            <div id="fg-screenshot-preview" style="display: none;">
              <canvas id="fg-screenshot-canvas"></canvas>
              <button type="button" class="fg-btn-remove" id="fg-remove-screenshot">×</button>
            </div>
          </div>
        </div>

        <div class="fg-modal-footer">
          <button type="button" class="fg-btn-secondary" id="fg-cancel">
            Cancel
          </button>
          <button type="submit" class="fg-btn-primary">
            Send Feedback
          </button>
        </div>

        <div class="fg-message" id="fg-message" style="display: none;"></div>
      </form>
    `;
  }

  private applyModalStyles(modal: HTMLElement): void {
    // Inject CSS
    if (!document.getElementById('fg-styles')) {
      const style = document.createElement('style');
      style.id = 'fg-styles';
      style.textContent = this.getStyles();
      document.head.appendChild(style);
    }

    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: fg-slide-up 0.3s ease;
    `;
  }

  private getStyles(): string {
    return `
      @keyframes fg-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes fg-slide-up {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      #fg-modal {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .fg-modal-header {
        padding: 24px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .fg-modal-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #111827;
      }

      .fg-close {
        background: none;
        border: none;
        font-size: 32px;
        line-height: 1;
        cursor: pointer;
        color: #6b7280;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: all 0.2s;
      }

      .fg-close:hover {
        background: #f3f4f6;
        color: #111827;
      }

      .fg-modal-body {
        padding: 24px;
      }

      .fg-form-group {
        margin-bottom: 20px;
      }

      .fg-form-group label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }

      .fg-category-buttons {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }

      .fg-category-btn {
        padding: 12px;
        border: 2px solid #e5e7eb;
        background: white;
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
      }

      .fg-category-btn:hover {
        border-color: ${this.config.primaryColor};
        background: ${this.config.primaryColor}10;
      }

      .fg-category-btn.active {
        border-color: ${this.config.primaryColor};
        background: ${this.config.primaryColor};
        color: white;
      }

      .fg-input, .fg-textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        font-family: inherit;
        transition: all 0.2s;
      }

      .fg-input:focus, .fg-textarea:focus {
        outline: none;
        border-color: ${this.config.primaryColor};
        box-shadow: 0 0 0 3px ${this.config.primaryColor}20;
      }

      .fg-form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .fg-screenshot-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      #fg-screenshot-preview {
        position: relative;
        border: 2px dashed #d1d5db;
        border-radius: 8px;
        padding: 8px;
      }

      #fg-screenshot-canvas {
        width: 100%;
        height: auto;
        display: block;
        border-radius: 4px;
      }

      .fg-btn-remove {
        position: absolute;
        top: 16px;
        right: 16px;
        background: #ef4444;
        color: white;
        border: none;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        line-height: 1;
        transition: all 0.2s;
      }

      .fg-btn-remove:hover {
        background: #dc2626;
        transform: scale(1.1);
      }

      .fg-modal-footer {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 24px;
      }

      .fg-btn-primary, .fg-btn-secondary {
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
      }

      .fg-btn-primary {
        background: ${this.config.primaryColor};
        color: white;
      }

      .fg-btn-primary:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      .fg-btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .fg-btn-secondary {
        background: white;
        border: 1px solid #d1d5db;
        color: #374151;
      }

      .fg-btn-secondary:hover {
        background: #f9fafb;
      }

      .fg-message {
        padding: 12px;
        border-radius: 6px;
        margin-top: 16px;
        font-size: 14px;
      }

      .fg-message.success {
        background: #d1fae5;
        color: #065f46;
        border: 1px solid #6ee7b7;
      }

      .fg-message.error {
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #fca5a5;
      }

      @media (max-width: 640px) {
        .fg-form-row {
          grid-template-columns: 1fr;
        }
        .fg-category-buttons {
          grid-template-columns: 1fr;
        }
      }
    `;
  }

  private attachEventListeners(modal: HTMLElement): void {
    // Close button
    const closeBtn = modal.querySelector('.fg-close') as HTMLElement;
    closeBtn?.addEventListener('click', () => this.config.onClose());

    const cancelBtn = modal.querySelector('#fg-cancel') as HTMLElement;
    cancelBtn?.addEventListener('click', () => this.config.onClose());

    // Category buttons
    const categoryBtns = modal.querySelectorAll('.fg-category-btn');
    const categoryInput = modal.querySelector('[name="category"]') as HTMLInputElement;

    categoryBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        categoryBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        categoryInput.value = (btn as HTMLElement).dataset.category || 'BUG';
      });
    });

    // Set first category as active
    if (categoryBtns.length > 0) {
      categoryBtns[0].classList.add('active');
    }

    // Screenshot button
    const screenshotBtn = modal.querySelector('#fg-take-screenshot') as HTMLElement;
    screenshotBtn?.addEventListener('click', () => this.takeScreenshot());

    // Remove screenshot button
    const removeBtn = modal.querySelector('#fg-remove-screenshot') as HTMLElement;
    removeBtn?.addEventListener('click', () => this.removeScreenshot());

    // Form submission
    const form = modal.querySelector('#fg-feedback-form') as HTMLFormElement;
    form?.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  private async takeScreenshot(): Promise<void> {
    try {
      this.overlay.style.display = 'none';
      await new Promise((resolve) => setTimeout(resolve, 100));

      const screenshot = await captureScreenshot();
      this.screenshotData = screenshot;

      this.overlay.style.display = 'flex';

      const preview = this.container.querySelector('#fg-screenshot-preview') as HTMLElement;
      const canvas = this.container.querySelector('#fg-screenshot-canvas') as HTMLCanvasElement;

      if (canvas && preview) {
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          preview.style.display = 'block';
        };
        img.src = screenshot;
      }
    } catch (error) {
      console.error('[FeedbackGuru] Screenshot error:', error);
      this.overlay.style.display = 'flex';
      alert('Failed to capture screenshot. Please try again.');
    }
  }

  private removeScreenshot(): void {
    this.screenshotData = null;
    const preview = this.container.querySelector('#fg-screenshot-preview') as HTMLElement;
    if (preview) {
      preview.style.display = 'none';
    }
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const submitBtn = form.querySelector('[type="submit"]') as HTMLButtonElement;
    const formData = new FormData(form);

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    // Prepare data
    const data: any = {
      category: formData.get('category'),
      priority: formData.get('priority'),
      description: formData.get('description'),
      name: formData.get('name'),
      email: formData.get('email'),
      url: window.location.href,
    };

    // Add screenshot if available
    if (this.screenshotData) {
      data.screenshots = [this.screenshotData];
    }

    try {
      await this.config.onSubmit(data);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Feedback';
    }
  }

  public show(): void {
    this.overlay.style.display = 'flex';
  }

  public hide(): void {
    this.overlay.style.display = 'none';
  }

  public showSuccess(): void {
    const message = this.container.querySelector('#fg-message') as HTMLElement;
    if (message) {
      message.textContent = '✓ Feedback sent successfully! Thank you.';
      message.className = 'fg-message success';
      message.style.display = 'block';
    }
  }

  public showError(error: string): void {
    const message = this.container.querySelector('#fg-message') as HTMLElement;
    if (message) {
      message.textContent = `✗ ${error}`;
      message.className = 'fg-message error';
      message.style.display = 'block';
    }
  }

  public reset(): void {
    const form = this.container.querySelector('#fg-feedback-form') as HTMLFormElement;
    form?.reset();
    this.removeScreenshot();
    const message = this.container.querySelector('#fg-message') as HTMLElement;
    if (message) {
      message.style.display = 'none';
    }
  }

  public destroy(): void {
    this.overlay.remove();
  }
}
