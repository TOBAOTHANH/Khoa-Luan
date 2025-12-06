import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Layout/Header";
import styles from "../styles/styles";
import Loader from "../components/Layout/Loader";
import ProfileSideBar from "../components/Profile/ProfileSidebar";
import ProfileContent from "../components/Profile/ProfileContent";
import { useSelector } from "react-redux";

const ProfilePage = () => {
  const { loading } = useSelector((state) => state.user);
  const [searchParams] = useSearchParams();
  const [active, setActive] = useState(1);

  useEffect(() => {
    const activeParam = searchParams.get('active');
    if (activeParam) {
      setActive(parseInt(activeParam));
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {loading ? (
        <Loader />
      ) : (
        <>
          <Header />
          <div className={`${styles.section} flex items-start gap-6 py-8 px-4`}>
            <div className="w-[80px] 800px:w-[280px] sticky top-20">
              <ProfileSideBar active={active} setActive={setActive} />
            </div>
            <div className="flex-1">
              <ProfileContent active={active} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
