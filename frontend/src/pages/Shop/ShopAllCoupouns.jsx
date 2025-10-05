import React from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSidebar'
import AllCoupouns from '../../components/Shop/AllCoupouns'

const ShopAllCoupouns = () => {
  return (
    <div>
    <DashboardHeader />

    <div className="flex justify-between w-ful">
    <div className="w-[80px] 800px:w-[330px]">
      <DashboardSideBar active = {9} />
    </div>
        <div className="w-full justify-center flex">
           <AllCoupouns />
        </div>
  </div>
</div>
  )
}

export default ShopAllCoupouns