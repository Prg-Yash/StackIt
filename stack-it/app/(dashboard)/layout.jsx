import NavigationBar from "@/components/Navbar";
import React from "react";

const layout = ({ children }) => {
  return (
    <div>
      <NavigationBar />
      {children}
    </div>
  );
};

export default layout;
