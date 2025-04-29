import React from "react";
import "./CircularLoader.css"; // Import the CSS file for styling

interface CircularLoaderProps {
  size?: string | number;
}

const CircularLoader: React.FC<CircularLoaderProps> = ({ size }) => {
  const loaderSize = size ?? "40px";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{ height: loaderSize, width: loaderSize }}
        className="circular-loader"
      ></div>
    </div>
  );
};

export default CircularLoader;
