export interface ConsoleLog {
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: number;
  args?: any[];
}

class ConsoleCapture {
  private logs: ConsoleLog[] = [];
  private maxLogs = 50; // Keep last 50 logs
  private originalConsole: {
    log: typeof console.log;
    info: typeof console.info;
    warn: typeof console.warn;
    error: typeof console.error;
    debug: typeof console.debug;
  };

  constructor() {
    this.originalConsole = {
      log: console.log.bind(console),
      info: console.info.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      debug: console.debug.bind(console),
    };

    this.interceptConsole();
  }

  private interceptConsole(): void {
    const self = this;

    ['log', 'info', 'warn', 'error', 'debug'].forEach((level) => {
      const originalMethod = (console as any)[level];

      (console as any)[level] = function (...args: any[]) {
        // Call original method
        originalMethod.apply(console, args);

        // Store log
        self.addLog(level as ConsoleLog['level'], args);
      };
    });
  }

  private addLog(level: ConsoleLog['level'], args: any[]): void {
    try {
      // Convert arguments to strings safely
      const message = args
        .map((arg) => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        })
        .join(' ');

      const log: ConsoleLog = {
        level,
        message: message.substring(0, 500), // Limit message length
        timestamp: Date.now(),
        args: args.map((arg) => {
          // Sanitize args to prevent circular references
          if (typeof arg === 'object' && arg !== null) {
            try {
              return JSON.parse(JSON.stringify(arg));
            } catch {
              return String(arg);
            }
          }
          return arg;
        }),
      };

      this.logs.push(log);

      // Keep only last N logs
      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }
    } catch (error) {
      // Silently fail if logging fails
      this.originalConsole.error('[FeedbackGuru] Console capture error:', error);
    }
  }

  public getLogs(): ConsoleLog[] {
    return [...this.logs];
  }

  public clear(): void {
    this.logs = [];
  }

  public restore(): void {
    console.log = this.originalConsole.log;
    console.info = this.originalConsole.info;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
    console.debug = this.originalConsole.debug;
  }
}

// Singleton instance
let consoleCapture: ConsoleCapture | null = null;

export function initConsoleCapture(): void {
  if (!consoleCapture) {
    consoleCapture = new ConsoleCapture();
  }
}

export function getConsoleLogs(): ConsoleLog[] {
  return consoleCapture?.getLogs() || [];
}

export function clearConsoleLogs(): void {
  consoleCapture?.clear();
}
