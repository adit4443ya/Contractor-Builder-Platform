import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import BuilderDashboard from "@/pages/builder/Dashboard";
import BuilderProjects from "@/pages/builder/Projects";
import BuilderProjectDetail from "@/pages/builder/ProjectDetail";
import NewProject from "@/pages/builder/NewProject";
import ContractorDashboard from "@/pages/contractor/Dashboard";
import ContractorProjects from "@/pages/contractor/Projects";
import ContractorProjectDetail from "@/pages/contractor/ProjectDetail";
import ContractorBids from "@/pages/contractor/Bids";
import ContractorProfile from "@/pages/contractor/Profile";
import { Toaster } from "@/components/ui/sonner";

const ProtectedRoute = ({ children, allowedType }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedType && user.user_type !== allowedType) {
    return <Navigate to={`/${user.user_type}/dashboard`} />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Builder Routes */}
          <Route
            path="/builder/dashboard"
            element={
              <ProtectedRoute allowedType="builder">
                <BuilderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/builder/projects"
            element={
              <ProtectedRoute allowedType="builder">
                <BuilderProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/builder/projects/new"
            element={
              <ProtectedRoute allowedType="builder">
                <NewProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/builder/projects/:projectId"
            element={
              <ProtectedRoute allowedType="builder">
                <BuilderProjectDetail />
              </ProtectedRoute>
            }
          />
          
          {/* Contractor Routes */}
          <Route
            path="/contractor/dashboard"
            element={
              <ProtectedRoute allowedType="contractor">
                <ContractorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contractor/projects"
            element={
              <ProtectedRoute allowedType="contractor">
                <ContractorProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contractor/projects/:projectId"
            element={
              <ProtectedRoute allowedType="contractor">
                <ContractorProjectDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contractor/bids"
            element={
              <ProtectedRoute allowedType="contractor">
                <ContractorBids />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contractor/profile"
            element={
              <ProtectedRoute allowedType="contractor">
                <ContractorProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;