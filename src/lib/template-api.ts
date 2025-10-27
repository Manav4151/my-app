const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const templateApi = {
  // Get all templates
  getTemplates: async () => {
    const response = await fetch(`${API_URL}/api/templates`, {
      credentials: 'include'
    });
    return response.json();
  },

  // Create new template
  createTemplate: async (templateData: {
    name: string;
    description?: string;
    mapping: Record<string, string>;
    expectedHeaders: string[];
  }) => {
    const response = await fetch(`${API_URL}/api/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(templateData)
    });
    return response.json();
  },

  // Get specific template
  getTemplate: async (id: string) => {
    const response = await fetch(`${API_URL}/api/templates/${id}`, {
      credentials: 'include'
    });
    return response.json();
  },

  // Update template
  updateTemplate: async (id: string, templateData: any) => {
    const response = await fetch(`${API_URL}/api/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(templateData)
    });
    return response.json();
  },

  // Delete template
  deleteTemplate: async (id: string) => {
    const response = await fetch(`${API_URL}/api/templates/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return response.json();
  }
};
