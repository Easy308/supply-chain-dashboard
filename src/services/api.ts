const API_BASE = '/api';

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '请求失败');
  }

  return data;
}

export const authApi = {
  register: (username: string, email: string, password: string) =>
    request<{ success: boolean; token: string; user: { id: number; username: string; email: string } }>(
      '/auth/register',
      { method: 'POST', body: { username, email, password } }
    ),

  login: (email: string, password: string) =>
    request<{ success: boolean; token: string; user: { id: number; username: string; email: string } }>(
      '/auth/login',
      { method: 'POST', body: { email, password } }
    ),

  me: () =>
    request<{ success: boolean; user: { id: number; username: string; email: string } }>(
      '/auth/me'
    ),
};

export const recordsApi = {
  getAll: (params?: { month?: string; type?: string; category?: string; search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.month) searchParams.set('month', params.month);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return request<{ success: boolean; records: any[]; total: number; page: number; limit: number }>(
      `/records${query ? `?${query}` : ''}`
    );
  },

  create: (data: { type: string; amount: number; category: string; note?: string; date: string }) =>
    request<{ success: boolean; record: any }>(
      '/records',
      { method: 'POST', body: data }
    ),

  update: (id: number, data: { type?: string; amount?: number; category?: string; note?: string; date?: string }) =>
    request<{ success: boolean; record: any }>(
      `/records/${id}`,
      { method: 'PUT', body: data }
    ),

  delete: (id: number) =>
    request<{ success: boolean; message: string }>(
      `/records/${id}`,
      { method: 'DELETE' }
    ),
};

export const statsApi = {
  getSummary: (month?: string) =>
    request<{ success: boolean; month: string; income: number; expense: number; balance: number; budget: number; budgetUsed: number }>(
      `/stats/summary${month ? `?month=${month}` : ''}`
    ),

  getTrend: (month?: string) =>
    request<{ success: boolean; trend: any[]; byCategory: any[] }>(
      `/stats/trend${month ? `?month=${month}` : ''}`
    ),
};

export const categoriesApi = {
  getAll: (type?: string) =>
    request<{ success: boolean; categories: { id: number; name: string; icon: string; type: string }[] }>(
      `/categories${type ? `?type=${type}` : ''}`
    ),
};

export const budgetApi = {
  get: (month?: string) =>
    request<{ success: boolean; budget: { month: string; amount: number } }>(
      `/budget${month ? `?month=${month}` : ''}`
    ),

  set: (month: string, amount: number) =>
    request<{ success: boolean; budget: any }>(
      '/budget',
      { method: 'PUT', body: { month, amount } }
    ),
};
