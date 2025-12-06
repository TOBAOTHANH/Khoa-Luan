import React from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSidebar";
import DashboardHero from "../../components/Shop/DashboardHero.jsx";

const ShopDashboardPage = () => {
  return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
          <DashboardHeader />
          <div className="flex items-start justify-between w-full relative">
            <div className="w-[80px] 800px:w-[330px] self-start">
              <DashboardSideBar active={1} />
            </div>
            <DashboardHero />
          </div>
        </div>
  );
};

export default ShopDashboardPage;
