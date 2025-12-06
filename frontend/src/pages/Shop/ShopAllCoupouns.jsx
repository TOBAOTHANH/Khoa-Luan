import React from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSidebar'
import AllCoupouns from '../../components/Shop/AllCoupouns'

const ShopAllCoupouns = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
    <DashboardHeader />

    <div className="flex justify-between w-full">
    <div className="w-[80px] 800px:w-[330px] flex-shrink-0">
      {/* Sidebar is fixed, this div is just for spacing */}
    </div>
    <DashboardSideBar active={9} />
        <div className="w-full justify-center flex ml-0">
           <AllCoupouns />
        </div>
  </div>
</div>
  )
}

export default ShopAllCoupouns