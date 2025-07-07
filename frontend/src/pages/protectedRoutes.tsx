import { Navigate } from "react-router-dom";
import React from "react";

interface ProtectedRouteProps {
  allowedTypes: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedTypes, children }) => {
  let effectiveUserType = JSON.parse(localStorage.getItem("user") || '{}')?.userType;
  if (!effectiveUserType || !allowedTypes.includes(effectiveUserType)) {
    return <Navigate to="/not-found" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
