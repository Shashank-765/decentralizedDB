import { Navigate } from "react-router-dom";
import React from "react";

interface ProtectedRouteProps {
  user: { userType: string } | null;
  allowedTypes: string[];
  children: React.ReactNode;
}



const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, allowedTypes, children }) => {

let userString = localStorage.getItem("user");
let userObj = userString ? JSON.parse(userString) : null;
let userType = userObj ? userObj.userType : null;
  if (!userType || !allowedTypes.includes(userType)) {
    return <Navigate to="/not-found" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
