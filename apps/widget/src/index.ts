import { FeedbackModal } from './ui/modal';
import { TriggerButton } from './ui/button';
import { captureMetadata } from './capture/metadata';
import { submitFeedback } from './api/client';
import { initConsoleCapture, getConsoleLogs } from './capture/console';
import { initNetworkCapture, getNetworkLogs } from './capture/network';

export interface FeedbackGuruConfig {
  apiKey: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor?: string;
  buttonText?: string;
  language?: string;
  captureConsole?: boolean; // Default: true
  captureNetwork?: boolean; // Default: true
}

class FeedbackGuru {
  private config: FeedbackGuruConfig;
  private button: TriggerButton | null = null;
  private modal: FeedbackModal | null = null;
  private isInitialized = false;

  constructor() {
    this.config = {
      apiKey: '',
      position: 'bottom-right',
      primaryColor: '#6366f1',
      buttonText: 'Feedback',
      language: 'en',
      captureConsole: true,
      captureNetwork: true,
    };
  }

  public init(config: FeedbackGuruConfig): void {
    if (this.isInitialized) {
      console.warn('[FeedbackGuru] Already initialized');
      return;
    }

    if (!config.apiKey) {
      console.error('[FeedbackGuru] API key is required');
      return;
    }

    this.config = { ...this.config, ...config };
    this.isInitialized = true;

    // Initialize console and network capture
    if (this.config.captureConsole !== false) {
      initConsoleCapture();
    }
    if (this.config.captureNetwork !== false) {
      initNetworkCapture();
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.render());
    } else {
      this.render();
    }
  }

  private render(): void {
    // Create trigger button
    this.button = new TriggerButton({
      position: this.config.position!,
      primaryColor: this.config.primaryColor!,
      buttonText: this.config.buttonText!,
      onClick: () => this.open(),
    });

    // Create modal (but don't show it yet)
    this.modal = new FeedbackModal({
      primaryColor: this.config.primaryColor!,
      onSubmit: (data) => this.handleSubmit(data),
      onClose: () => this.close(),
    });
  }

  public open(): void {
    if (!this.modal) {
      console.error('[FeedbackGuru] Not initialized');
      return;
    }
    this.modal.show();
    if (this.button) {
      this.button.hide();
    }
  }

  public close(): void {
    if (!this.modal) return;
    this.modal.hide();
    if (this.button) {
      this.button.show();
    }
  }

  private async handleSubmit(formData: any): Promise<void> {
    try {
      // Capture metadata
      const metadata = captureMetadata();

      // Capture console logs
      const consoleLogs = this.config.captureConsole !== false ? getConsoleLogs() : [];

      // Capture network logs
      const networkLogs = this.config.captureNetwork !== false ? getNetworkLogs() : [];

      // Prepare feedback data
      const feedbackData = {
        apiKey: this.config.apiKey,
        ...formData,
        ...metadata,
        consoleLogs: consoleLogs.length > 0 ? consoleLogs : undefined,
        networkLogs: networkLogs.length > 0 ? networkLogs : undefined,
      };

      // Submit to API
      const result = await submitFeedback(feedbackData);

      if (result.success) {
        // Show success message
        this.modal?.showSuccess();

        // Close modal after 2 seconds
        setTimeout(() => {
          this.close();
          this.modal?.reset();
        }, 2000);
      } else {
        this.modal?.showError(result.error || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('[FeedbackGuru] Submission error:', error);
      this.modal?.showError('An error occurred. Please try again.');
    }
  }

  public destroy(): void {
    this.button?.destroy();
    this.modal?.destroy();
    this.isInitialized = false;
  }
}

// Global instance
const instance = new FeedbackGuru();

// Expose to window
declare global {
  interface Window {
    FeedbackGuru: any;
    fg: any;
  }
}

// Queue system for early calls
const queue: any[] = [];
if (typeof window !== 'undefined') {
  window.fg = function (...args: any[]) {
    if (args[0] === 'init') {
      instance.init(args[1]);
    } else if (args[0] === 'open') {
      instance.open();
    } else if (args[0] === 'close') {
      instance.close();
    } else {
      queue.push(args);
    }
  };

  // Process queued calls
  if ((window as any).fg && (window as any).fg.q) {
    (window as any).fg.q.forEach((args: any) => {
      window.fg(...args);
    });
  }

  window.FeedbackGuru = instance;
}

export default FeedbackGuru;
