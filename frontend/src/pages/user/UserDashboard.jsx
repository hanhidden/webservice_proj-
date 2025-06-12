//import React, { useRef } from "react";
import Header from "../../components/user_homepage/Header";
import HeroSection from "../../components/user_homepage/HeroSection";
import AboutUs from "../../components/user_homepage/AboutUs";
import Services from "../../components/user_homepage/Services";
import Footer from "../../components/user_homepage/Footer";

export default function UserDashboard() {
  

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <Header />
      <HeroSection />
      <AboutUs />
      
      <Services />

      <Footer />
    </div>
  );
}
