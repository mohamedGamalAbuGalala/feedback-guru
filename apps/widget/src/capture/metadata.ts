export interface Metadata {
  url: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
}

export function captureMetadata(): Metadata {
  const ua = navigator.userAgent;
  const browserInfo = detectBrowser(ua);
  const osInfo = detectOS(ua);

  return {
    url: window.location.href,
    browser: browserInfo.name,
    browserVersion: browserInfo.version,
    os: osInfo.name,
    osVersion: osInfo.version,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    userAgent: ua,
  };
}

function detectBrowser(ua: string): { name: string; version: string } {
  let name = 'Unknown';
  let version = 'Unknown';

  if (ua.includes('Firefox/')) {
    name = 'Firefox';
    version = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Edg/')) {
    name = 'Edge';
    version = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Chrome/')) {
    name = 'Chrome';
    version = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    name = 'Safari';
    version = ua.match(/Version\/(\d+\.\d+)/)?.[1] || 'Unknown';
  }

  return { name, version };
}

function detectOS(ua: string): { name: string; version: string } {
  let name = 'Unknown';
  let version = 'Unknown';

  if (ua.includes('Windows NT')) {
    name = 'Windows';
    const match = ua.match(/Windows NT (\d+\.\d+)/);
    if (match) {
      const ntVersion = match[1];
      version = {
        '10.0': '10',
        '6.3': '8.1',
        '6.2': '8',
        '6.1': '7',
      }[ntVersion] || ntVersion;
    }
  } else if (ua.includes('Mac OS X')) {
    name = 'macOS';
    version = ua.match(/Mac OS X (\d+[._]\d+[._]\d+)/)?.[1]?.replace(/_/g, '.') || 'Unknown';
  } else if (ua.includes('Linux')) {
    name = 'Linux';
  } else if (ua.includes('Android')) {
    name = 'Android';
    version = ua.match(/Android (\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
    name = 'iOS';
    version = ua.match(/OS (\d+[._]\d+)/)?.[1]?.replace(/_/g, '.') || 'Unknown';
  }

  return { name, version };
}
