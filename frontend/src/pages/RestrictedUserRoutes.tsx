import React from "react";
import { Navigate } from "react-router-dom";

interface RestrictToUsersOnlyProps {
  user: { userType: string } | null;
  children: React.ReactNode;
}

const RestrictToUsersOnly: React.FC<RestrictToUsersOnlyProps> = ({ user, children }) => {
  if (!user || user.userType !== "User") {
    return <Navigate to="/not-found" replace />;
  }
  return <>{children}</>;
};

export default RestrictToUsersOnly;
