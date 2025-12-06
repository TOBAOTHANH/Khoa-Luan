import React from "react";
import ShopSettings from "../../components/Shop/ShopSettings.jsx";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSidebar";

const ShopSettingsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <DashboardHeader />
      <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <DashboardSideBar active={11} />
        </div>
        <ShopSettings />
      </div>
    </div>
  );
};

export default ShopSettingsPage;
