import React from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSidebar'
import EditProduct from '../../components/Shop/EditProduct'

const ShopEditProduct = () => {
  return (
    <div>
        <DashboardHeader />

        <div className="flex items-center justify-between w-ful">
        <div className="w-[80px] 800px:w-[330px]">
          <DashboardSideBar active = {3} />
        </div>
            <div className="w-full justify-center flex">
                <EditProduct />
            </div>
      </div>
    </div>
  )
}

export default ShopEditProduct

