import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PositionsList from "./pages/PositionsList.jsx";
import PositionDetail from "./pages/PositionDetail.jsx";
import CvList from "./pages/CvList.jsx";
import CvEditor from "./pages/CvEditor.jsx";

import { RedirectToSignIn } from "@clerk/clerk-react";

import { Toaster } from "react-hot-toast";

import { UserProfileProvider } from "./context/UserProfileContext.jsx";
import ApiAuthSync from "./components/auth/ApiAuthSync.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import DashboardLayout from "./layout/DashboardLayout.jsx";
import Profile from "./pages/Profile.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import AttributeLibrary from "./pages/AttributeLibrary.jsx";


const App = () => {
  return (
      <UserProfileProvider>
        <ApiAuthSync />
        <BrowserRouter>
          <Toaster />
          <Routes>
            <Route path="/" element={<Landing />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout/>
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="positions" element={<PositionsList />} />
              <Route path="positions/:id" element={<PositionDetail />} />
              <Route path="cvs" element={<CvList />} />
              <Route path="cvs/:id" element={<CvEditor />} />
              <Route path="profile" element={<Profile />} />
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="search" element={<SearchResults />} />
              <Route path="attributes" element={<AttributeLibrary />} />
            </Route>

            <Route path="/*" element={<RedirectToSignIn />} />
          </Routes>
        </BrowserRouter>
      </UserProfileProvider>
  );
};

export default App;