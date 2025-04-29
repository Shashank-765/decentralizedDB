import { Navigate } from "react-router-dom";
import React from "react";

interface ProtectedRouteProps {
  user: { userType: string } | null;
  allowedTypes: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, allowedTypes, children }) => {
  if (!user || !allowedTypes.includes(user.userType)) {
    return <Navigate to="/not-found" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
