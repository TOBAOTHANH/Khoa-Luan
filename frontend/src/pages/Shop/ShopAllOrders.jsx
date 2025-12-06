import React from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import AllOrders from "../../components/Shop/AllOrders";
import DashboardSideBar from '../../components/Shop/Layout/DashboardSidebar';

const ShopAllOrders = () => {
  return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            <DashboardHeader />
            <div className="flex justify-between w-full">
                <div className="w-[80px] 800px:w-[330px]">
                  <DashboardSideBar active={2} />
                </div>
                <div className="w-full justify-center flex">
                   <AllOrders />
                </div>
              </div>
        </div>
  )
}

export default ShopAllOrders