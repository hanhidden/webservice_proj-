import React, { useRef } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import AboutUs from '../components/AboutUs';
import Services from '../components/Services';
import IncidentForm from '../components/IncidentForm';
import Footer from '../components/Footer';


export default function UserDashboard() {
  const reportRef = useRef(null);

  const scrollToReport = () => {
    reportRef.current.scrollIntoView({ behavior: 'smooth' });
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
