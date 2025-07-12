import NavigationBar from "@/components/Navbar";
import React from "react";

const layout = ({ children }) => {
  return (
    <div>
      <NavigationBar />
      <div className="mt-[120px]">
      {children}
      </div>
    </div>
  );
};

export default layout;
