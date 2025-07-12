"use client";

import NavigationBar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const DashboardLayout = ({ children }) => {
  const { status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      <div className="mt-[120px]">{children}</div>
    </div>
  );
};

export default DashboardLayout;
