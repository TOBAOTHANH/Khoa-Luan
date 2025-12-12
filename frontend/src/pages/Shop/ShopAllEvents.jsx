import React from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSidebar'
import AllEvents from '../../components/Shop/AllEvents'


const ShopAllEvent = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
    <DashboardHeader />

    <div className="flex justify-between w-full">
    <div className="w-[80px] 800px:w-[330px] flex-shrink-0">
      {/* Sidebar is fixed, this div is just for spacing */}
    </div>
    <DashboardSideBar active={5} />
        <div className="w-full justify-center flex ml-0">
           <AllEvents />
        </div>
  </div>
</div>
  )
}

export default ShopAllEvent