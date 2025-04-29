import React from "react";

const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen flex-col">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600">The page you're looking for doesn’t exist.</p>
    </div>
  );
};

export default NotFound;
