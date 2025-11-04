export interface FeedbackData {
  apiKey: string;
  category: string;
  priority: string;
  description: string;
  name?: string;
  email?: string;
  url: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  screenWidth?: number;
  screenHeight?: number;
  userAgent?: string;
  screenshots?: string[];
}

export interface SubmitResult {
  success: boolean;
  id?: string;
  error?: string;
}

// Detect API URL from script src or use default
function getApiUrl(): string {
  const scripts = document.querySelectorAll('script');
  for (const script of Array.from(scripts)) {
    if (script.src && script.src.includes('widget.js')) {
      const url = new URL(script.src);
      return url.origin.replace(':3001', ':3000'); // Widget on 3001, API on 3000 in dev
    }
  }

  // Default to same origin in production
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3000';
  }

  return window.location.origin;
}

export async function submitFeedback(data: FeedbackData): Promise<SubmitResult> {
  const apiUrl = getApiUrl();

  try {
    const response = await fetch(`${apiUrl}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || `Server error: ${response.status}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      id: result.id,
    };
  } catch (error: any) {
    console.error('[FeedbackGuru] API error:', error);
    return {
      success: false,
      error: error.message || 'Network error',
    };
  }
}
