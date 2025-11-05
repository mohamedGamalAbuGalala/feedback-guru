import html2canvas from 'html2canvas';

export async function captureScreenshot(): Promise<string> {
  try {
    const canvas = await html2canvas(document.body, {
      allowTaint: true,
      useCORS: true,
      logging: false,
      scale: window.devicePixelRatio > 1 ? 1 : 1, // Optimize for performance
      width: window.innerWidth,
      height: document.documentElement.scrollHeight,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      scrollY: -window.scrollY,
      scrollX: -window.scrollX,
    });

    // Convert to base64 with compression
    return canvas.toDataURL('image/jpeg', 0.8); // 80% quality for smaller size
  } catch (error) {
    console.error('[FeedbackGuru] Screenshot capture failed:', error);
    throw new Error('Failed to capture screenshot');
  }
}
