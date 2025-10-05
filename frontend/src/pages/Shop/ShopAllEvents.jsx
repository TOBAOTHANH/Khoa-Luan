import React from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSidebar'
import AllEvents from '../../components/Shop/AllEvents'


const ShopAllEvent = () => {
  return (
    <div>
    <DashboardHeader />

    <div className="flex justify-between w-ful">
    <div className="w-[80px] 800px:w-[330px]">
      <DashboardSideBar active = {5} />
    </div>
        <div className="w-full justify-center flex">
           <AllEvents />
        </div>
  </div>
</div>
  )
}

export default ShopAllEvent