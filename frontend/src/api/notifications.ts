const API_URL = import.meta.env.VITE_API_URL;

export const fetchNotifications = async (token: string) => {
  try {
    const response = await fetch(`${API_URL}/notifications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching notifications: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const createNotification = async (token: string, data: any) => {
  try {
    const response = await fetch(`${API_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Error creating notification: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};