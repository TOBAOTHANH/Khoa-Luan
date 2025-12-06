import React from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSidebar'
import AllReviews from '../../components/Shop/AllReviews'

const ShopDashboardReviews = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <DashboardHeader />
      <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <DashboardSideBar active={13} />
        </div>
        <div className="w-full">
          <AllReviews />
        </div>
      </div>
    </div>
  )
}

export default ShopDashboardReviews

