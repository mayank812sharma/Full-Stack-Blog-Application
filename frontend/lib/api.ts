import axios from 'axios';
type ID = string;

type Params = Record<string, any>;

type AnyData = Record<string, any>;
type LikeResponse = {
  liked: boolean;
  likeCount: number;
};

type SaveResponse = {
  saved: boolean;
};
type CreateBlogResponse = {
  blog: {
    status: string;
    slug: string;
  };
};
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor - attach token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    
    // Auto-logout on 401
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject({ message, status: error.response?.status });
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
// export const authApi = {
//   register: (data) => apiClient.post('/auth/register', data),
//   login: (data) => apiClient.post('/auth/login', data),
//   getMe: () => apiClient.get('/auth/me'),
//   changePassword: (data) => apiClient.put('/auth/change-password', data),
// };

export const authApi = {
  register: (data: AnyData) => apiClient.post('/auth/register', data),
  login: (data: AnyData) => apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
  changePassword: (data: AnyData) =>
    apiClient.put('/auth/change-password', data),
};

// ─── Blogs ────────────────────────────────────────────────────────────────────
// export const blogsApi = {
//   getAll: (params) => apiClient.get('/blogs', { params }),
//   getFeatured: () => apiClient.get('/blogs/featured'),
//   getBySlug: (slug) => apiClient.get(`/blogs/${slug}`),
//   getMyBlogs: (params) => apiClient.get('/blogs/me', { params }),
//   getSaved: (params) => apiClient.get('/blogs/saved', { params }),
//   create: (data) => apiClient.post('/blogs', data),
//   update: (id, data) => apiClient.put(`/blogs/${id}`, data),
//   delete: (id) => apiClient.delete(`/blogs/${id}`),
//   like: (id) => apiClient.post(`/blogs/${id}/like`),
//   save: (id) => apiClient.post(`/blogs/${id}/save`),
// };

export const blogsApi = {
  getAll: (params?: Params) => apiClient.get('/blogs', { params }),
  getFeatured: () => apiClient.get('/blogs/featured'),
  getBySlug: (slug: string) => apiClient.get(`/blogs/${slug}`),
  getMyBlogs: (params?: Params) => apiClient.get('/blogs/me', { params }),
  getSaved: (params?: Params) => apiClient.get('/blogs/saved', { params }),

  // create: (data: AnyData) => apiClient.post('/blogs', data),
  // create: (data: AnyData) =>
  // apiClient.post<CreateBlogResponse>('/blogs', data),
  create: async (data: AnyData): Promise<CreateBlogResponse> => {
  return apiClient.post('/blogs', data);
},
  update: (id: ID, data: AnyData) =>
    apiClient.put(`/blogs/${id}`, data),
  delete: (id: ID) => apiClient.delete(`/blogs/${id}`),

  // like: (id: ID) => apiClient.post(`/blogs/${id}/like`),
  // save: (id: ID) => apiClient.post(`/blogs/${id}/save`),
  like: (id: ID) =>
  apiClient.post<LikeResponse>(`/blogs/${id}/like`),

save: (id: ID) =>
  apiClient.post<SaveResponse>(`/blogs/${id}/save`),
};

// ─── Comments ─────────────────────────────────────────────────────────────────
// export const commentsApi = {
//   getAll: (blogId, params) => apiClient.get(`/comments/${blogId}`, { params }),
//   create: (blogId, data) => apiClient.post(`/comments/${blogId}`, data),
//   update: (id, data) => apiClient.put(`/comments/${id}`, data),
//   delete: (id) => apiClient.delete(`/comments/${id}`),
//   like: (id) => apiClient.post(`/comments/${id}/like`),
// };

export const commentsApi = {
  getAll: (blogId: ID, params?: Params) =>
    apiClient.get(`/comments/${blogId}`, { params }),

  create: (blogId: ID, data: AnyData) =>
    apiClient.post(`/comments/${blogId}`, data),

  update: (id: ID, data: AnyData) =>
    apiClient.put(`/comments/${id}`, data),

  delete: (id: ID) => apiClient.delete(`/comments/${id}`),

  like: (id: ID) => apiClient.post(`/comments/${id}/like`),
};

// ─── Categories ───────────────────────────────────────────────────────────────
// export const categoriesApi = {
//   getAll: () => apiClient.get('/categories'),
//   getBySlug: (slug) => apiClient.get(`/categories/${slug}`),
// };

export const categoriesApi = {
  getAll: () => apiClient.get('/categories'),
  getBySlug: (slug: string) =>
    apiClient.get(`/categories/${slug}`),
};

// ─── Users ────────────────────────────────────────────────────────────────────
// export const usersApi = {
//   getProfile: (username) => apiClient.get(`/users/${username}`),
//   updateProfile: (data) => apiClient.put('/users/profile', data),
//   follow: (id) => apiClient.post(`/users/${id}/follow`),
// };

export const usersApi = {
  getProfile: (username: string) =>
    apiClient.get(`/users/${username}`),

  updateProfile: (data: AnyData) =>
    apiClient.put('/users/profile', data),

  follow: (id: ID) =>
    apiClient.post(`/users/${id}/follow`),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
// export const adminApi = {
//   getStats: () => apiClient.get('/admin/stats'),
//   getUsers: (params) => apiClient.get('/admin/users', { params }),
//   toggleUserActive: (id) => apiClient.patch(`/admin/users/${id}/toggle-active`),
//   updateUserRole: (id, role) => apiClient.patch(`/admin/users/${id}/role`, { role }),
//   getBlogs: (params) => apiClient.get('/admin/blogs', { params }),
//   toggleFeature: (id) => apiClient.patch(`/admin/blogs/${id}/feature`),
//   deleteBlog: (id) => apiClient.delete(`/admin/blogs/${id}`),
// };

export const adminApi = {
  getStats: () => apiClient.get('/admin/stats'),

  getUsers: (params?: Params) =>
    apiClient.get('/admin/users', { params }),

  toggleUserActive: (id: ID) =>
    apiClient.patch(`/admin/users/${id}/toggle-active`),

  updateUserRole: (id: ID, role: string) =>
    apiClient.patch(`/admin/users/${id}/role`, { role }),

  getBlogs: (params?: Params) =>
    apiClient.get('/admin/blogs', { params }),

  toggleFeature: (id: ID) =>
    apiClient.patch(`/admin/blogs/${id}/feature`),

  deleteBlog: (id: ID) =>
    apiClient.delete(`/admin/blogs/${id}`),
};

export default apiClient;
