import React from "react";
import { useSelector } from "react-redux";
import EventCard from "../components/Events/EventCard";
import Header from "../components/Layout/Header";
import Loader from "../components/Layout/Loader";

const EventsPage = () => {
  const { allEvents, isLoading } = useSelector((state) => state.events);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <Header activeHeading={4} />
          {allEvents && allEvents.length > 0 ? (
            allEvents.map((event, index) => (
              <EventCard key={event.id || index} active={index === 0} data={event} />
            ))
          ) : (
            <p className="text-center mt-4">No events available</p>
          )}
        </div>
      )}
    </>
  );
};

export default EventsPage;
