export const fetchIssues = async (token: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/issues`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch issues');
    
    const data = await response.json();
    return data.issues || [];
  } catch (error) {
    console.error('Error fetching issues:', error);
    throw error;
  }
};

export const createIssue = async (token: string, issueData: any) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: issueData.title,
        description: issueData.description,
        priority: issueData.priority,
        category: issueData.category,
        deviceId: issueData.deviceId || null,
        tags: issueData.tags || []
      })
    });
    
    if (!response.ok) throw new Error('Failed to create issue');
    
    const data = await response.json();
    return data.issue;
  } catch (error) {
    console.error('Error creating issue:', error);
    throw error;
  }
};

export const updateIssue = async (token: string, issueId: string, issueData: any) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/issues/${issueId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: issueData.title,
        description: issueData.description,
        priority: issueData.priority,
        status: issueData.status,
        category: issueData.category,
        assignedTo: issueData.assignedTo?.id || null
      })
    });
    
    if (!response.ok) throw new Error('Failed to update issue');
    
    const data = await response.json();
    return data.issue;
  } catch (error) {
    console.error('Error updating issue:', error);
    throw error;
  }
};