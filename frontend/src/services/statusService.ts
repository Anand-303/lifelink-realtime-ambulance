import api from './api';

export const statusService = {
  /**
   * Check if the backend API is online
   * @returns Promise with connection status
   */
  checkApiStatus: async (): Promise<{ status: string; message: string }> => {
    try {
      const response = await api.get('/status');
      return response.data;
    } catch (error) {
      return { status: 'error', message: 'Unable to connect to the server' };
    }
  },
};

export default statusService;