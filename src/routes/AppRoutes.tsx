import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignInPage from '../features/auth/pages/SignInPage';
import LibraryPage from "../features/library/pages/LibraryPage";
import AdminRoute from './AdminRoute';
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage';
import AdminReportsPage from '../features/admin/pages/AdminReportsPage';
import AdminContentPage from '../features/admin/pages/AdminContentPage';
import AdminUsersPage from '../features/admin/pages/AdminUsersPage';
import MessagesPage from '../features/conversation/pages/MessagesPage';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/library"      element={<LibraryPage />} />
        <Route path="/me/sets"      element={<LibraryPage />} />
        <Route path="/me/likes"     element={<LibraryPage />} />
        <Route path="/library/albums"    element={<LibraryPage />} />
        <Route path="/me/stations"  element={<LibraryPage />} />
        <Route path="/me/following" element={<LibraryPage />} />
        <Route path="/me/history"   element={<LibraryPage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminRoute>
              <AdminReportsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/content"
          element={
            <AdminRoute>
              <AdminContentPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/messages/:conversationId" element={<MessagesPage />} />
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
