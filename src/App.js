import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import LoginOptions from './components/LoginOptions';
import UserLogin from './components/UserLogin';
import AdminLogin from './admin/AdminLogin';
import Signup from './components/Signup';

import PetsPage from './components/PetsPage';
import PetDetails from './components/PetDetails';
import AdoptBuyPage from './components/AdoptBuyPage';
import ChatPage from './components/ChatPage';
import FavoritesPage from './components/FavoritesPage';
import UserProfile from './components/UserProfile';
import AdminHome from './admin/AdminHome';
import AddPet from './admin/AddPet';
import ViewPets from './admin/ViewPets';
import EditPet from './admin/EditPet';

import Users from './admin/Users';
import Owners from './admin/Owners';
import OwnerDetails from './admin/OwnerDetails';
import Requested from './admin/Requested';
import AddPetRequest from './components/AddPetRequest';
import { FavoritesProvider } from './components/FavoritesContext';
import { AuthProvider } from './components/AuthContext';
import './App.css';
// Owner dashboard
import OwnerHome from './owner/OwnerHome';
import OwnerAddPet from './owner/AddPet';
import MyPets from './owner/MyPets';
import OwnerEditPet from './owner/EditPet';
import OwnerLogin from './owner/OwnerLogin';
import OwnerProfile from './owner/OwnerProfile';
import OwnerSignup from './owner/OwnerSignup';
import OwnerConversations from './owner/OwnerConversations';
import OwnerChat from './owner/OwnerChat';
import FullMapPage from './components/FullMapPage';
import FullMapAllPets from './components/FullMapAllPets';
import OwnerPetsPage from './components/OwnerPetsPage';
import OwnerPending from './owner/OwnerPending';
import RequireUser from './components/RequireUser';

function AppContent() {
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRedirect = (type) => {
    setShowLoginOptions(false);
    navigate(`/${type}-login`);
  };

  // Check if current page is an admin or owner page
  const isAdminPage = location.pathname.startsWith('/admin');
  const isOwnerPage = location.pathname.startsWith('/owner');
  // Treat both per-pet map and the new /fullmap route as full-map pages
  const isFullMapPage = /\/pets\/[^/]+\/map$/.test(location.pathname) || location.pathname.startsWith('/fullmap');
  // Hide navbar on login/signup pages
  const isAuthPage = ['/user-login', '/signup', '/admin-login', '/owner-login', '/owner-signup'].includes(location.pathname);

  return (
    <>
      {/* Show navbar on all pages except admin/owner dashboards, full screen map, and auth pages */}
      {!isAdminPage && !isOwnerPage && !isFullMapPage && !isAuthPage && (
        <Navbar onLoginClick={() => setShowLoginOptions(true)} />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/pets" element={<PetsPage />} />
        <Route path="/pets/:id" element={<PetDetails />} />
        <Route
          path="/pets/:id/request"
          element={(
            <RequireUser>
              <AdoptBuyPage />
            </RequireUser>
          )}
        />
        <Route path="/pets/:id/chat" element={<ChatPage />} />
        <Route path="/pets/:id/map" element={<FullMapPage />} />
        <Route path="/fullmap" element={<FullMapAllPets />} />
        <Route path="/owners/:ownerId/pets" element={<OwnerPetsPage />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/owner-login" element={<OwnerLogin />} />
        <Route path="/owner-signup" element={<OwnerSignup />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/add-pet" element={<AddPet />} />
        <Route path="/admin/view-pets" element={<ViewPets />} />
        <Route path="/admin/edit-pet/:id" element={<EditPet />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/owners" element={<Owners />} />
        <Route path="/admin/owner-details/:id" element={<OwnerDetails />} />
        <Route path="/admin/requests" element={<Requested />} />
        <Route path="/add-pet-request" element={<AddPetRequest />} />
        {/* Owner routes */}
        <Route path="/owner" element={<OwnerHome />} />
        <Route path="/owner/add-pet" element={<OwnerAddPet />} />
        <Route path="/owner/my-pets" element={<MyPets />} />
        <Route path="/owner/edit-pet/:id" element={<OwnerEditPet />} />
        <Route path="/owner/profile" element={<OwnerProfile />} />
        <Route path="/owner/messages" element={<OwnerConversations />} />
        <Route path="/owner/chat/:id" element={<OwnerChat />} />
        <Route path="/owner/pending" element={<OwnerPending />} />
      </Routes>

      {showLoginOptions && (
        <LoginOptions
          onClose={() => setShowLoginOptions(false)}
          onUserLogin={() => handleRedirect('user')}
          onOwnerLogin={() => handleRedirect('owner')}
          onAdminLogin={() => handleRedirect('admin')}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <Router>
          <AppContent />
        </Router>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;
