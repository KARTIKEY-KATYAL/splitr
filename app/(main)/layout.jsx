"use client";

import { Authenticated } from "convex/react";
import React from "react";
import { MainNavigation } from "@/components/main-navigation";

const MainLayout = ({ children }) => {
  return (
    <Authenticated>
      <MainNavigation />
      <div className="container mx-auto mt-6 mb-20 px-4">{children}</div>
    </Authenticated>
  );
};

export default MainLayout;
