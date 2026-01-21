// Token expiration handler utility

export const handleApiError = (error: any, logout?: () => void) => {
  console.error('API Error:', error);

  // Check if the error message indicates token expiration
  if (error.message && (
    error.message.includes('Token expired') ||
    error.message.includes('Authentication failed') ||
    error.message.includes('Access token required') ||
    error.message.includes('Session expired')
  )) {
    console.log('Token expired, redirecting to login...');

    // Clear localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('payflow_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // If logout function is provided, use it; otherwise redirect directly
    if (logout) {
      logout();
    } else {
      window.location.href = '/login';
    }

    return true; // Indicates token expiration was handled
  }

  return false; // Not a token expiration error
};

// Helper to check API response for token expiration
export const checkTokenExpiration = (response: Response) => {
  if (response.status === 401) {
    console.log('401 Unauthorized - Token likely expired');
    return true;
  }
  return false;
};