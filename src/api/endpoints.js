import api from './client';

export const auth = {
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
};

export const parts = {
  list: (params) => api.get('/parts', { params }).then((r) => r.data),
  get: (id) => api.get(`/parts/${id}`).then((r) => r.data),
  create: (data) => api.post('/parts', data).then((r) => r.data),
  update: (id, data) => api.put(`/parts/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/parts/${id}`),
  lowStock: () => api.get('/parts/low-stock').then((r) => r.data),
};

export const vendors = {
  list: () => api.get('/vendors').then((r) => r.data),
  create: (data) => api.post('/vendors', data).then((r) => r.data),
  update: (id, data) => api.put(`/vendors/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/vendors/${id}`),
};

export const purchases = {
  list: () => api.get('/purchases').then((r) => r.data),
  create: (data) => api.post('/purchases', data).then((r) => r.data),
};

export const staff = {
  list: () => api.get('/staff').then((r) => r.data),
  create: (data) => api.post('/staff', data).then((r) => r.data),
  update: (id, data) => api.put(`/staff/${id}`, data).then((r) => r.data),
  resetPassword: (id, newPassword) =>
    api.post(`/staff/${id}/reset-password`, { newPassword }),
  remove: (id) => api.delete(`/staff/${id}`),
};

export const customers = {
  search: (query, vehicleNumber) =>
    api.get('/customers/search', { params: { query, vehicleNumber } }).then((r) => r.data),
  get: (id) => api.get(`/customers/${id}`).then((r) => r.data),
  create: (data) => api.post('/customers', data).then((r) => r.data),
  me: () => api.get('/customers/me').then((r) => r.data),
  updateMe: (data) => api.put('/customers/me', data).then((r) => r.data),
  myVehicles: () => api.get('/customers/me/vehicles').then((r) => r.data),
  addMyVehicle: (data) => api.post('/customers/me/vehicles', data).then((r) => r.data),
  updateMyVehicle: (vid, data) => api.put(`/customers/me/vehicles/${vid}`, data).then((r) => r.data),
  deleteMyVehicle: (vid) => api.delete(`/customers/me/vehicles/${vid}`),
  vehicles: (id) => api.get(`/customers/${id}/vehicles`).then((r) => r.data),
};

export const sales = {
  list: () => api.get('/sales').then((r) => r.data),
  mine: () => api.get('/sales/me').then((r) => r.data),
  byCustomer: (id) => api.get(`/sales/customer/${id}`).then((r) => r.data),
  get: (id) => api.get(`/sales/${id}`).then((r) => r.data),
  create: (data) => api.post('/sales', data).then((r) => r.data),
  email: (id) => api.post(`/sales/${id}/email`),
  pay: (id, amount) => api.post(`/sales/${id}/payment`, { amount }).then((r) => r.data),
};

export const appointments = {
  list: () => api.get('/appointments').then((r) => r.data),
  mine: () => api.get('/appointments/me').then((r) => r.data),
  create: (data) => api.post('/appointments', data).then((r) => r.data),
  setStatus: (id, status) => api.put(`/appointments/${id}/status`, { status }).then((r) => r.data),
  remove: (id) => api.delete(`/appointments/${id}`),
};

export const reviews = {
  visible: () => api.get('/reviews').then((r) => r.data),
  all: () => api.get('/reviews/all').then((r) => r.data),
  create: (data) => api.post('/reviews', data).then((r) => r.data),
  setVisibility: (id, visible) => api.put(`/reviews/${id}/visibility`, { visible }).then((r) => r.data),
  remove: (id) => api.delete(`/reviews/${id}`),
};

export const partRequests = {
  list: () => api.get('/part-requests').then((r) => r.data),
  mine: () => api.get('/part-requests/me').then((r) => r.data),
  create: (data) => api.post('/part-requests', data).then((r) => r.data),
  respond: (id, data) => api.put(`/part-requests/${id}/respond`, data).then((r) => r.data),
};

export const notifications = {
  list: () => api.get('/notifications').then((r) => r.data),
  unreadCount: () => api.get('/notifications/unread-count').then((r) => r.data),
  markRead: (id) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

export const reports = {
  adminDashboard: () => api.get('/reports/admin/dashboard').then((r) => r.data),
  staffDashboard: () => api.get('/reports/staff/dashboard').then((r) => r.data),
  customerDashboard: () => api.get('/reports/customer/dashboard').then((r) => r.data),
  financial: (range = 'monthly') =>
    api.get('/reports/financial', { params: { range } }).then((r) => r.data),
  topSpenders: (top = 10) =>
    api.get('/reports/customers/top-spenders', { params: { top } }).then((r) => r.data),
  regulars: (minInvoices = 3) =>
    api.get('/reports/customers/regulars', { params: { minInvoices } }).then((r) => r.data),
  pendingCredits: () => api.get('/reports/customers/pending-credits').then((r) => r.data),
};
