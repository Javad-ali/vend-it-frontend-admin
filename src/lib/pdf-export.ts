/**
 * Download a PDF blob with the given filename
 */
export const downloadPdf = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Fetch and download a PDF from an API endpoint
 */
export const fetchAndDownloadPdf = async (
  url: string,
  filename: string,
  options?: RequestInit
) => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Include cookies for authentication
    });

    if (!response.ok) {
      throw new Error(`Failed to generate PDF: ${response.statusText}`);
    }

    const blob = await response.blob();
    downloadPdf(blob, filename);
    
    return { success: true };
  } catch (error: any) {
    console.error('PDF download error:', error);
    return { success: false, error: error.message };
  }
};
