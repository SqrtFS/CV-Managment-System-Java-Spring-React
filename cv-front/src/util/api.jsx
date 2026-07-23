import axios from "axios";

const BASE_URL = "http://localhost:8080/api/v1.0";

const client = axios.create({ baseURL: BASE_URL });


let getTokenFn = null;
export const setupApiAuth = (getToken) => {
  getTokenFn = getToken;
};

client.interceptors.request.use(async (config) => {
  if (getTokenFn) {
    const token = await getTokenFn();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  users: {
    me: () => client.get("/users/me"),
    getAll: () => client.get("/users"),
    create: (dto) => client.post("/users", dto),
    update: (clerkId, dto) => client.put(`/users/${clerkId}`, dto),
    delete: (clerkId) => client.delete(`/users/${clerkId}`),
    block: (clerkId) => client.patch(`/users/${clerkId}/block`),
    unblock: (clerkId) => client.patch(`/users/${clerkId}/unblock`),
    changeRole: (clerkId, role) =>
      client.put(`/users/${clerkId}/role`, null, { params: { role } }),
  },

  profileValues: {
    getByClerkId: (clerkId) => client.get(`/profile-values/user/${clerkId}`),
    save: (clerkId, dto) => client.post(`/profile-values/user/${clerkId}`, dto),
    remove: (clerkId, attributeId) =>
      client.delete(`/profile-values/user/${clerkId}/attribute/${attributeId}`),
  },

  attributes: {
    getAll: () => client.get("/attributes"),
    getById: (id) => client.get(`/attributes/${id}`),
    create: (dto) => client.post("/attributes", dto),
    update: (id, dto) => client.put(`/attributes/${id}`, dto),
    delete: (id) => client.delete(`/attributes/${id}`),
    search: (categoryId, prefix) =>
      client.get("/attributes/search", { params: { categoryId, prefix } }),
    recentlyUsed: (limit = 10) =>
      client.get("/attributes/recently-used", { params: { limit } }),
    markUsed: (id) => client.post(`/attributes/${id}/mark-used`),
    getCategories: () => client.get("/attributes/categories"),
    createCategory: (dto) => client.post("/attributes/categories", dto),
    updateCategory: (id, dto) => client.put(`/attributes/categories/${id}`, dto),
    deleteCategory: (id) => client.delete(`/attributes/categories/${id}`),
  },

  positions: {
    getAll: (params) => client.get("/positions", { params }),
    getLatest: () => client.get("/positions/latest"),
    getById: (id) => client.get(`/positions/${id}`),
    create: (dto) => client.post("/positions", dto),
    duplicate: (id) => client.post(`/positions/${id}/duplicate`),
    update: (id, dto) => client.put(`/positions/${id}`, dto),
    delete: (id) => client.delete(`/positions/${id}`),
    setAttributes: (id, dto) => client.put(`/positions/${id}/attributes`, dto),
    setAccessRules: (id, dto) => client.put(`/positions/${id}/access-rules`, dto),
    setProjectTags: (id, dto) => client.put(`/positions/${id}/project-tags`, dto),
    checkAccess: (id) => client.get(`/positions/${id}/access-check`),
  },

  discussions: {
    list: (positionId) => client.get(`/positions/${positionId}/discussion`),
    post: (positionId, content) =>
      client.post(`/positions/${positionId}/discussion`, { content }),
  },

  projects: {
    getMine: () => client.get("/projects"),
    getById: (id) => client.get(`/projects/${id}`),
    create: (dto) => client.post("/projects", dto),
    update: (id, dto) => client.put(`/projects/${id}`, dto),
    delete: (id) => client.delete(`/projects/${id}`),
    autocompleteTags: (prefix) =>
      client.get("/projects/tags/autocomplete", { params: { prefix } }),
  },

  cvs: {
    getMine: () => client.get("/cvs"),
    getById: (id) => client.get(`/cvs/${id}`),
    create: (positionId) => client.post("/cvs", null, { params: { positionId } }),
    editAttribute: (cvId, attributeId, payload) =>
      client.put(`/cvs/${cvId}/attributes/${attributeId}`, payload),
    setProjects: (cvId, projectIds) =>
      client.put(`/cvs/${cvId}/projects`, { projectIds }),
    publish: (id) => client.post(`/cvs/${id}/publish`),
    delete: (id) => client.delete(`/cvs/${id}`),
    like: (id) => client.post(`/cvs/${id}/like`),
    unlike: (id) => client.delete(`/cvs/${id}/like`),
  },

  search: {
    positions: (q) => client.get("/search/positions", { params: { q } }),
    cvs: (q) => client.get("/search/cvs", { params: { q } }),
  },

  mainPage: {
    stats: () => client.get("/main-page/stats"),
    tagCloud: () => client.get("/main-page/tag-cloud"),
    latestPositions: () => client.get("/main-page/latest-positions"),
    popularPositions: () => client.get("/main-page/popular-positions"),
  },
};

export default client;