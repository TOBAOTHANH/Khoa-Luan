import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import styles from '../../styles/styles'
import EventCard from "./EventCard";

const Events = () => {
  const { allEvents, isLoading } = useSelector((state) => state.events);

  return (
    <div>
      {
        !isLoading && (
          <div className={`${styles.section}`}>
            <div className="mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  <h1 className={`${styles.heading} text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
                    🎉 Sự Kiện Đang Diễn Ra
                  </h1>
                  <div className="w-12 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
                </div>
              </div>
              <p className="text-center text-gray-600 text-lg">Khuyến mãi đặc biệt dành cho bạn</p>
            </div>

            <div className="w-full grid">
              {
                allEvents.length !== 0 && (
                  <EventCard data={allEvents && allEvents[0]} />
                )
              }
              <h4 className="text-center text-gray-500 py-8">{
                allEvents?.length === 0 && (
                  'Đang cập nhật sự kiện...'
                )
              }

              </h4>
            </div>

          </div>
        )
      }
    </div>
  )
}

export default Events