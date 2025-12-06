import React from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSidebar'
import AllProducts from '../../components/Shop/AllProducts.jsx'

const ShopAllProducts = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
    <DashboardHeader />

    <div className="flex justify-between w-full">
    <div className="w-[80px] 800px:w-[330px]">
      <DashboardSideBar active={3} />
    </div>
        <div className="w-full justify-center flex">
           <AllProducts />
        </div>
  </div>
</div>
  )
}

export default ShopAllProducts