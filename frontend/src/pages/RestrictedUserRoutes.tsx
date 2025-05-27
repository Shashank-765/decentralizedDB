import React from "react";
import { Navigate } from "react-router-dom";

interface RestrictToUsersOnlyProps {
  user: { userType: string } | null;
  children: React.ReactNode;
}

const RestrictToUsersOnly: React.FC<RestrictToUsersOnlyProps> = ({ user, children }) => {
  let userType = user?.userType;

  // Fallback to localStorage if user is not available
  if (!userType) {
    const userString = localStorage.getItem("user");
    const userObj = userString ? JSON.parse(userString) : null;
    userType = userObj?.userType || null;
  }

  if (userType !== "User") {
    return <Navigate to="/not-found" replace />;
  }

  return <>{children}</>;
};


export default RestrictToUsersOnly;
