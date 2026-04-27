import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignInPage from '../features/auth/pages/SignInPage';
import LibraryPage from "../features/library/pages/LibraryPage";
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/library"      element={<LibraryPage />} />
        <Route path="/me/sets"      element={<LibraryPage />} />
        <Route path="/me/likes"     element={<LibraryPage />} />
        <Route path="/me/albums"    element={<LibraryPage />} />
        <Route path="/me/stations"  element={<LibraryPage />} />
        <Route path="/me/following" element={<LibraryPage />} />
        <Route path="/me/history"   element={<LibraryPage />} />
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;