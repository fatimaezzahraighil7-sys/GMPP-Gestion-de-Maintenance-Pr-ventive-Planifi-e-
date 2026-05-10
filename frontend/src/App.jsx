import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/layout/PrivateRoute';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/auth/ProfilePage';
import MachineListPage from './pages/machines/MachineListPage';
import MachineDetailPage from './pages/machines/MachineDetailPage';
import MachineFormPage from './pages/machines/MachineFormPage';
import MachineEditPage from './pages/machines/MachineEditPage';
import InterventionListPage from './pages/interventions/InterventionListPage';
import InterventionDetailPage from './pages/interventions/InterventionDetailPage';
import InterventionFormPage from './pages/interventions/InterventionFormPage';
import InterventionEditPage from './pages/interventions/InterventionEditPage';
import PlanningPage from './pages/planning/PlanningPage';
import MonPlanningPage from './pages/planning/MonPlanningPage';
import KanbanPage from './pages/planning/KanbanPage';
import RapportPage from './pages/rapports/RapportPage';
import TechnicienListPage from './pages/techniciens/TechnicienListPage';
import TechnicienFormPage from './pages/techniciens/TechnicienFormPage';
import TechnicienEditPage from './pages/techniciens/TechnicienEditPage';
import UtilisateurPage from './pages/utilisateurs/UtilisateurPage';
import PointMaintenancePage from './pages/pointsmaintenance/PointMaintenancePage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Machines */}
        <Route path="machines" element={<MachineListPage />} />
        <Route path="machines/new" element={<PrivateRoute roles={['ADMIN', 'RESPONSABLE_MAINTENANCE']}><MachineFormPage /></PrivateRoute>} />
        <Route path="machines/:id/edit" element={<PrivateRoute roles={['ADMIN', 'RESPONSABLE_MAINTENANCE']}><MachineEditPage /></PrivateRoute>} />
        <Route path="machines/:id" element={<MachineDetailPage />} />

        {/* Interventions */}
        <Route path="interventions" element={<InterventionListPage />} />
        <Route path="interventions/new" element={<PrivateRoute roles={['ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE']}><InterventionFormPage /></PrivateRoute>} />
        <Route path="interventions/:id/edit" element={<PrivateRoute roles={['ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE']}><InterventionEditPage /></PrivateRoute>} />
        <Route path="interventions/:id" element={<InterventionDetailPage />} />

        {/* Planning */}
        <Route path="kanban" element={<PrivateRoute roles={['ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE']}><KanbanPage /></PrivateRoute>} />
        <Route path="planning" element={<PlanningPage />} />
        <Route path="mon-planning" element={<PrivateRoute roles={['TECHNICIEN', 'CHEF_EQUIPE']}><MonPlanningPage /></PrivateRoute>} />

        {/* Rapports */}
        <Route path="rapports" element={<PrivateRoute roles={['ADMIN', 'RESPONSABLE_MAINTENANCE']}><RapportPage /></PrivateRoute>} />

        {/* Points de Maintenance */}
        <Route path="points-maintenance" element={<PointMaintenancePage />} />

        {/* Techniciens */}
        <Route path="techniciens" element={<PrivateRoute roles={['ADMIN', 'RESPONSABLE_MAINTENANCE', 'CHEF_EQUIPE']}><TechnicienListPage /></PrivateRoute>} />
        <Route path="techniciens/new" element={<PrivateRoute roles={['ADMIN']}><TechnicienFormPage /></PrivateRoute>} />
        <Route path="techniciens/:id/edit" element={<PrivateRoute roles={['ADMIN', 'RESPONSABLE_MAINTENANCE']}><TechnicienEditPage /></PrivateRoute>} />

        {/* Utilisateurs (Admin only) */}
        <Route path="utilisateurs" element={<PrivateRoute roles={['ADMIN']}><UtilisateurPage /></PrivateRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
