export const STATUS_COLORS = {
  PREVENTIVE: 'secondary',
  PLANIFIEE: 'info',
  EN_COURS: 'warning',
  TERMINEE: 'success',
  ANNULEE: 'default',
  EN_RETARD: 'error',
};

export const STATUS_LABELS = {
  PREVENTIVE: 'Préventive',
  PLANIFIEE: 'Planifiée',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
  EN_RETARD: 'En retard',
};

export const MACHINE_STATUS_COLORS = {
  EN_SERVICE: 'success',
  EN_MAINTENANCE: 'warning',
  HORS_SERVICE: 'error',
  EN_REPARATION: 'info',
};

export const MACHINE_STATUS_LABELS = {
  EN_SERVICE: 'En service',
  EN_MAINTENANCE: 'En maintenance',
  HORS_SERVICE: 'Hors service',
  EN_REPARATION: 'En réparation',
};

export const MACHINE_TYPE_LABELS = {
  HYDRAULIQUE: 'Hydraulique',
  PNEUMATIQUE: 'Pneumatique',
  ELECTRIQUE: 'Électrique',
  CNC: 'CNC',
};

export const ROLE_LABELS = {
  ADMIN: 'Administrateur',
  RESPONSABLE_MAINTENANCE: 'Responsable Maintenance',
  CHEF_EQUIPE: "Chef d'Équipe",
  TECHNICIEN: 'Technicien',
};

export const FREQUENCE_LABELS = {
  QUOTIDIENNE: 'Quotidienne',
  HEBDOMADAIRE: 'Hebdomadaire',
  MENSUELLE: 'Mensuelle',
  TRIMESTRIELLE: 'Trimestrielle',
  SEMESTRIELLE: 'Semestrielle',
  ANNUELLE: 'Annuelle',
  PAR_HEURES: 'Par heures',
};

export const OPERATION_LABELS = {
  GRAISSAGE: 'Graissage',
  VIDANGE_HUILE: "Vidange d'huile",
  VERIFICATION_COURROIE: 'Vérification courroie',
  VERIFICATION_ROULEMENT: 'Vérification roulement',
  CONTROLE_FILTRES: 'Contrôle filtres',
  SERRAGE_VISSERIE: 'Serrage visserie',
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};
