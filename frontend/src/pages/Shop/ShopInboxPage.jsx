import React from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSidebar'
import DashboardMessages from '../../components/Shop/DashboardMessages'

const ShopInboxPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
          <DashboardHeader />
          <div className="flex items-start justify-between w-full">
            <div className="w-[80px] 800px:w-[330px] flex-shrink-0">
              {/* Sidebar is fixed, this div is just for spacing */}
            </div>
            <DashboardSideBar active={8} />
            <DashboardMessages />
          </div>
        </div>
  )
}

export default ShopInboxPage