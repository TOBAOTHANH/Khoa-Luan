import axios from "axios";
import React, { useEffect, useState } from "react";
import { server } from "../../server";

const CountDown = ({ data }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  // Format ngày kết thúc theo tiếng Việt
  const formattedDate = new Date(data.Finish_Date).toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Khi hết thời gian, xóa event
    if (
      typeof timeLeft.days === "undefined" &&
      typeof timeLeft.hours === "undefined" &&
      typeof timeLeft.minutes === "undefined" &&
      typeof timeLeft.seconds === "undefined"
    ) {
      axios.delete(`${server}/event/delete-shop-event/${data._id}`);
    }

    return () => clearTimeout(timer);
  });

  function calculateTimeLeft() {
    const difference = +new Date(data.Finish_Date) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }

  // Map nhãn tiếng Việt
  const labelMap = {
    days: "ngày",
    hours: "giờ",
    minutes: "phút",
    seconds: "giây",
  };

  const timerComponents = Object.keys(timeLeft).map((interval) => {
    if (!timeLeft[interval]) {
      return null;
    }

    return (
      <span className="text-[25px] text-[#475ad2]" key={interval}>
        {timeLeft[interval]} {labelMap[interval]}{" "}
      </span>
    );
  });

  return (
    <div className="text-center">
      {/* Hiển thị ngày kết thúc */}
      <p className="text-[#475ad2] text-[25px] mb-2">
        Kết thúc vào: {formattedDate}
      </p>

      {/* Hiển thị countdown */}
      {timerComponents.length ? (
        timerComponents
      ) : (
        <span className="text-[red] text-[25px]">Đã hết thời gian</span>
      )}
    </div>
  );
};

export default CountDown;
