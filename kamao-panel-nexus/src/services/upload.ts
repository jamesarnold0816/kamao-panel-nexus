import api from './api';

export interface UploadResponse {
  url: string;
  filename: string;
  success: boolean;
}

// Get the API base URL for constructing image URLs
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const uploadService = {
  /**
   * Upload a file to the server
   * 
   * @param file The file to upload
   * @param type The type of upload (avatar, product, etc.)
   * @returns Promise with the uploaded file URL
   */
  uploadFile: async (file: File, type: 'avatar' | 'product' = 'product'): Promise<UploadResponse> => {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      // Add a timestamp to prevent caching
      formData.append('timestamp', Date.now().toString());
      
      // Make the actual API call to upload the file
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // If the API doesn't return the full URL, construct it
      let imageUrl = response.data.url;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${API_BASE_URL}${imageUrl}`;
      }
      
      return {
        url: imageUrl,
        filename: response.data.filename || file.name,
        success: true
      };
    } catch (error) {
      console.error('Upload error:', error);
      
      // Fallback to local URLs for development/testing if server fails
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using fallback local URL for development');
        const objectUrl = URL.createObjectURL(file);
        return {
          url: objectUrl,
          filename: file.name,
          success: true
        };
      }
      
      throw error;
    }
  },
  
  /**
   * Get the full URL for an image path
   * @param path The image path from the server
   * @returns The full URL to the image
   */
  getImageUrl: (path: string): string => {
    if (!path) return '';
    if (path.startsWith('blob:') || path.startsWith('http')) return path;
    return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  },
  
  /**
   * Clean up object URLs to prevent memory leaks
   * Only needed for local object URLs
   */
  revokeUrl: (url: string) => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
};

export default uploadService; 