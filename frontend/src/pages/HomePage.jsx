import React from 'react'
import Header from '../components/Layout/Header'
import Hero from '../components/Route/Hero/Hero'
import Categories from '../components/Route/Categories/Categories'
import BestDeals from '../components/Route/BestDeals/BestDeals'
import FeaturedProduct from '../components/Route/FeaturedProduct/FeaturedProduct'
import Events from "../components/Events/Events";
import Sponsored from '../components/Route/Sponsored'
import Footer from '../components/Layout/Footer'
import AdPopup from '../components/Layout/AdPopup'

const HomePage = () => {
  return (
    <div className="bg-gradient-to-b from-gray-50 via-white to-gray-50 min-h-screen">
      <AdPopup/>
      <Header activeHeading = {1} />
      <div className="bg-gradient-to-b from-white to-gray-50">
        <Hero/>
      </div>
      <div className="bg-white py-8">
        <Categories/>
      </div>
      <div className="bg-gradient-to-b from-gray-50 to-white py-12">
        <BestDeals/>
      </div>
      <div className="bg-white py-12">
        <Events/>
      </div>
      <div className="bg-gradient-to-b from-gray-50 to-white py-12">
        <FeaturedProduct/>
      </div>
      <div className="bg-white py-12">
        <Sponsored/>
      </div>
      <Footer/>
    </div>
  )
}

export default HomePage
