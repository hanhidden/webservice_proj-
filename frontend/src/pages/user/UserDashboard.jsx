import React, { useRef } from "react";
import Header from "../../components/user_homepage/Header";
import HeroSection from "../../components/user_homepage/HeroSection";
import AboutUs from "../../components/user_homepage/AboutUs";
import Services from "../../components/user_homepage/Services";
import IncidentForm from "../../components/user_homepage/IncidentForm";
import Footer from "../../components/user_homepage/Footer";

export default function UserDashboard() {
  const reportRef = useRef(null);

  const scrollToReport = () => {
    reportRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <Header scrollToReport={scrollToReport} />
      <HeroSection />
      <AboutUs />
      <IncidentForm reportRef={reportRef} />
      <Services />

      <Footer />
    </div>
  );
}
