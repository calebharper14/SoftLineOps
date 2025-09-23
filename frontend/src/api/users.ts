const API_URL = import.meta.env.VITE_API_URL;

export const fetchUsers = async (token: string) => {
  try {
    const response = await fetch(`${API_URL}/api/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch users');
    
    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const createUser = async (token: string, userData: any) => {
  try {
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) throw new Error('Failed to create user');
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (token: string, userId: string, userData: any) => {
  try {
    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) throw new Error('Failed to update user');
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const getUserById = async (token: string, userId: string) => {
  try {
    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch user');
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};