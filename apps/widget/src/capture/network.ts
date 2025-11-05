export interface NetworkLog {
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  timestamp: number;
  duration?: number;
  error?: string;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
}

class NetworkCapture {
  private logs: NetworkLog[] = [];
  private maxLogs = 30; // Keep last 30 requests
  private originalFetch: typeof fetch;
  private originalXHR: typeof XMLHttpRequest;

  constructor() {
    this.originalFetch = window.fetch.bind(window);
    this.originalXHR = window.XMLHttpRequest;

    this.interceptFetch();
    this.interceptXHR();
  }

  private interceptFetch(): void {
    const self = this;

    window.fetch = async function (...args: Parameters<typeof fetch>) {
      const startTime = Date.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      const options = typeof args[0] === 'string' ? args[1] : args[0];
      const method = options?.method || 'GET';

      let log: NetworkLog = {
        method,
        url,
        timestamp: startTime,
      };

      try {
        const response = await self.originalFetch(...args);
        const duration = Date.now() - startTime;

        log = {
          ...log,
          status: response.status,
          statusText: response.statusText,
          duration,
        };

        // Only log failed requests or slow requests
        if (!response.ok || duration > 1000) {
          self.addLog(log);
        }

        return response;
      } catch (error: any) {
        log = {
          ...log,
          error: error.message || 'Network error',
          duration: Date.now() - startTime,
        };

        self.addLog(log);
        throw error;
      }
    };
  }

  private interceptXHR(): void {
    const self = this;
    const OriginalXHR = this.originalXHR;

    (window as any).XMLHttpRequest = function () {
      const xhr = new OriginalXHR();
      const startTime = Date.now();
      let log: Partial<NetworkLog> = {
        timestamp: startTime,
      };

      // Intercept open
      const originalOpen = xhr.open;
      xhr.open = function (method: string, url: string, ...args: any[]) {
        log.method = method;
        log.url = url;
        return originalOpen.apply(xhr, [method, url, ...args]);
      };

      // Intercept send
      const originalSend = xhr.send;
      xhr.send = function (...args: any[]) {
        xhr.addEventListener('load', function () {
          const duration = Date.now() - startTime;
          log = {
            ...log,
            status: xhr.status,
            statusText: xhr.statusText,
            duration,
          };

          // Only log failed requests or slow requests
          if (xhr.status >= 400 || duration > 1000) {
            self.addLog(log as NetworkLog);
          }
        });

        xhr.addEventListener('error', function () {
          log = {
            ...log,
            error: 'XHR Error',
            duration: Date.now() - startTime,
          };
          self.addLog(log as NetworkLog);
        });

        return originalSend.apply(xhr, args);
      };

      return xhr;
    };

    // Copy static properties
    Object.setPrototypeOf(window.XMLHttpRequest, OriginalXHR);
    (window.XMLHttpRequest as any).prototype = OriginalXHR.prototype;
  }

  private addLog(log: NetworkLog): void {
    try {
      // Don't log Feedback Guru's own API calls
      if (log.url.includes('/api/feedback') || log.url.includes('feedbackguru')) {
        return;
      }

      this.logs.push(log);

      // Keep only last N logs
      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }
    } catch (error) {
      console.error('[FeedbackGuru] Network capture error:', error);
    }
  }

  public getLogs(): NetworkLog[] {
    return [...this.logs];
  }

  public clear(): void {
    this.logs = [];
  }

  public restore(): void {
    window.fetch = this.originalFetch;
    window.XMLHttpRequest = this.originalXHR;
  }
}

// Singleton instance
let networkCapture: NetworkCapture | null = null;

export function initNetworkCapture(): void {
  if (!networkCapture) {
    networkCapture = new NetworkCapture();
  }
}

export function getNetworkLogs(): NetworkLog[] {
  return networkCapture?.getLogs() || [];
}

export function clearNetworkLogs(): void {
  networkCapture?.clear();
}
