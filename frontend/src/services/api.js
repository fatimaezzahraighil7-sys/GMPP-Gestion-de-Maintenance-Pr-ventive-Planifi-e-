import api from '../api/axios';

export const authService = {
  login: (email, motDePasse) => api.post('/api/auth/login', { email, motDePasse }),
  refreshToken: (refreshToken) => api.post('/api/auth/refresh-token', { refreshToken }),
  logout: () => api.post('/api/auth/logout'),
};

export const machineService = {
  getAll: (params) => api.get('/api/machines', { params }),
  getById: (id) => api.get(`/api/machines/${id}`),
  create: (data) => api.post('/api/machines', data),
  update: (id, data) => api.put(`/api/machines/${id}`, data),
  delete: (id) => api.delete(`/api/machines/${id}`),
  getHistorique: (id) => api.get(`/api/machines/${id}/interventions`),
  updateStatut: (id, statut) => api.patch(`/api/machines/${id}/statut`, { statut }),
  updateCompteur: (id, compteurHoraire) => api.patch(`/api/machines/${id}/compteur`, { compteurHoraire }),
  getStats: () => api.get('/api/machines/stats'),
};

export const pointMaintenanceService = {
  getAll: (params) => api.get('/api/points-maintenance', { params }),
  getById: (id) => api.get(`/api/points-maintenance/${id}`),
  create: (data) => api.post('/api/points-maintenance', data),
  update: (id, data) => api.put(`/api/points-maintenance/${id}`, data),
  delete: (id) => api.delete(`/api/points-maintenance/${id}`),
  getRetard: () => api.get('/api/points-maintenance/retard'),
};

export const interventionService = {
  getAll: (params) => api.get('/api/interventions', { params }),
  getMesInterventions: (params) => api.get('/api/interventions/mes-interventions', { params }),
  getById: (id) => api.get(`/api/interventions/${id}`),
  planifier: (data) => api.post('/api/interventions', data),
  update: (id, data) => api.put(`/api/interventions/${id}`, data),
  delete: (id) => api.delete(`/api/interventions/${id}`),
  demarrer: (id) => api.post(`/api/interventions/${id}/demarrer`),
  terminer: (id, data) => api.post(`/api/interventions/${id}/terminer`, data),
  annuler: (id, justification) => api.post(`/api/interventions/${id}/annuler`, { justification }),
  getCalendar: (debut, fin) => api.get('/api/interventions/calendar', { params: { debut, fin } }),
  getRetard: () => api.get('/api/interventions/retard'),
  uploadPhoto: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/interventions/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  valider: (id) => api.post(`/api/interventions/${id}/valider`),
  updateStatut: (id, statut) => api.patch(`/api/interventions/${id}/statut`, { statut }),
  uploadImages: (id, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.post(`/api/interventions/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteImage: (id, imageId) => api.delete(`/api/interventions/${id}/images/${imageId}`),
};

export const planningService = {
  generer: () => api.post('/api/planning/generer'),
  getAlertes: () => api.get('/api/planning/alertes'),
  assigner: (id, technicienId) => api.post(`/api/planning/${id}/assigner`, { technicienId }),
  assignerAuto: (id) => api.post(`/api/planning/${id}/assigner-auto`),
  reprogrammer: (id, nouvelleDatePlanifiee, justification) =>
    api.put(`/api/planning/${id}/reprogrammer`, { nouvelleDatePlanifiee, justification }),
};

export const technicienService = {
  getAll: () => api.get('/api/techniciens'),
  getPlanning: (id, debut, fin) => api.get(`/api/techniciens/${id}/planning`, { params: { debut, fin } }),
  getCharge: (id) => api.get(`/api/techniciens/${id}/charge`),
};

export const utilisateurService = {
  getAll: () => api.get('/api/utilisateurs'),
  getById: (id) => api.get(`/api/utilisateurs/${id}`),
  create: (data) => api.post('/api/utilisateurs', data),
  update: (id, data) => api.put(`/api/utilisateurs/${id}`, data),
  delete: (id) => api.delete(`/api/utilisateurs/${id}`),
  activerDesactiver: (id) => api.patch(`/api/utilisateurs/${id}/activer`),
  changerMotDePasse: (id, ancienMotDePasse, nouveauMotDePasse) =>
    api.post(`/api/utilisateurs/${id}/changer-mot-de-passe`, { ancienMotDePasse, nouveauMotDePasse }),
};

export const rapportService = {
  getKPIs: (dateDebut, dateFin) => api.get('/api/rapports/kpis', { params: { dateDebut, dateFin } }),
  getPerformance: (dateDebut, dateFin) => api.get('/api/rapports/performance-techniciens', { params: { dateDebut, dateFin } }),
  getConsommation: (dateDebut, dateFin) => api.get('/api/rapports/consommation-consommables', { params: { dateDebut, dateFin } }),
  exportPDF: (dateDebut, dateFin) =>
    api.get('/api/rapports/export/pdf', { params: { dateDebut, dateFin }, responseType: 'blob' }),
  exportExcel: (dateDebut, dateFin) =>
    api.get('/api/rapports/export/excel', { params: { dateDebut, dateFin }, responseType: 'blob' }),
  exportCSV: (dateDebut, dateFin) =>
    api.get('/api/rapports/export/csv', { params: { dateDebut, dateFin }, responseType: 'blob' }),
};

export const imageService = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadMultiple: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.post('/api/images/upload-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

