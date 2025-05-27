import { Navigate } from "react-router-dom";
import React from "react";

interface ProtectedRouteProps {
  user: { userType: string } | null;
  allowedTypes: string[];
  children: React.ReactNode;
}



const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, allowedTypes, children }) => {

let effectiveUserType = user?.userType;

  if (!effectiveUserType) {
    const userString = localStorage.getItem("user");
    const userObj = userString ? JSON.parse(userString) : null;
    effectiveUserType = userObj?.userType || null;
  }

  if (!effectiveUserType || !allowedTypes.includes(effectiveUserType)) {
    return <Navigate to="/not-found" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
