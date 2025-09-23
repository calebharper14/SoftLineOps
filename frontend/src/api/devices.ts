export const fetchDevices = async (token: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/devices`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch devices');
    
    const data = await response.json();
    return data.devices || [];
  } catch (error) {
    console.error('Error fetching devices:', error);
    throw error;
  }
};

export const createDevice = async (token: string, deviceData: any) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/devices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: deviceData.name,
        ipAddress: deviceData.ipAddress || '0.0.0.0',
        macAddress: deviceData.macAddress || '00:00:00:00:00:00',
        os: deviceData.os,
        deviceType: deviceData.deviceType,
        location: deviceData.location
      })
    });
    
    if (!response.ok) throw new Error('Failed to create device');
    
    const data = await response.json();
    return data.device;
  } catch (error) {
    console.error('Error creating device:', error);
    throw error;
  }
};

export const updateDevice = async (token: string, deviceId: string, deviceData: any) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/devices/${deviceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: deviceData.name,
        status: deviceData.status,
        os: deviceData.os,
        deviceType: deviceData.deviceType,
        location: deviceData.location
      })
    });
    
    if (!response.ok) throw new Error('Failed to update device');
    
    const data = await response.json();
    return data.device;
  } catch (error) {
    console.error('Error updating device:', error);
    throw error;
  }
};