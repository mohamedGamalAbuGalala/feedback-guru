export interface TriggerButtonConfig {
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor: string;
  buttonText: string;
  onClick: () => void;
}

export class TriggerButton {
  private element: HTMLElement;
  private config: TriggerButtonConfig;

  constructor(config: TriggerButtonConfig) {
    this.config = config;
    this.element = this.create();
    document.body.appendChild(this.element);
  }

  private create(): HTMLElement {
    const button = document.createElement('button');
    button.id = 'fg-trigger-button';
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 5C2 3.89543 2.89543 3 4 3H16C17.1046 3 18 3.89543 18 5V13C18 14.1046 17.1046 15 16 15H11L7 18V15H4C2.89543 15 2 14.1046 2 13V5Z" fill="currentColor"/>
      </svg>
      <span>${this.config.buttonText}</span>
    `;

    this.applyStyles(button);
    button.addEventListener('click', this.config.onClick);

    return button;
  }

  private applyStyles(button: HTMLElement): void {
    const positions = {
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;',
    };

    button.style.cssText = `
      position: fixed;
      ${positions[this.config.position]}
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: ${this.config.primaryColor};
      color: white;
      border: none;
      border-radius: 24px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.2s ease;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.05)';
      button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    });
  }

  public hide(): void {
    this.element.style.display = 'none';
  }

  public show(): void {
    this.element.style.display = 'flex';
  }

  public destroy(): void {
    this.element.remove();
  }
}
