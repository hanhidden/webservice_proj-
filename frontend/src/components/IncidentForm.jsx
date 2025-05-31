


// import React from 'react';

// export default function IncidentForm({ reportRef, bgImage }) {
//   return (
//     <section
//       ref={reportRef}
//       className="relative py-16 px-4 text-[#0d1b2a] overflow-hidden"
//     >
//       {/* Blurred background image */}
//       <div
//         className="absolute inset-0 bg-cover bg-center filter blur-sm opacity-70"
//         style={{ backgroundImage: `url(${bgImage})` }}
//         aria-hidden="true"
//       ></div>

    
//       {/* Container for the content */}
//       <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-10">
//         {/* Left side text */}
//         <div className="md:w-1/2 text-center md:text-left">
//           <h2 className="text-4xl font-bold mb-4">Fill Out a Report</h2>
//           <p className="text-lg mb-6">
//             Help us document incidents of human rights violations by submitting a detailed report. Your input is crucial for seeking justice.
//           </p>
//           <p className="text-base">
//             Ensure you provide as much information as possible to aid investigations.
//           </p>
//         </div>

//         {/* Right side form */}
//         <div className="md:w-1/2 bg-white shadow-lg rounded-lg p-6 w-full">
//           <h3 className="text-2xl font-semibold mb-4 text-center">
//             File an Incident Report
//           </h3>
//           <form>
//             <label className="block mb-2 font-medium">Incident Title</label>
//             <input
//               type="text"
//               placeholder="Enter incident title"
//               className="w-full border border-gray-400 rounded-md px-3 py-2 mb-4"
//             />
//             <label className="block mb-2 font-medium">Description</label>
//             <textarea
//               placeholder="Describe the incident..."
//               className="w-full border border-gray-400 rounded-md px-3 py-2 mb-4"
//             />
//             <label className="block mb-2 font-medium">Date</label>
//             <input
//               type="date"
//               className="w-full border border-gray-400 rounded-md px-3 py-2 mb-4"
//             />
//             <button
//               type="submit"
//               className="bg-[#fbbf24] hover:bg-yellow-500 text-[#0d1b2a] font-semibold px-4 py-2 rounded-lg w-full"
//             >
//               Submit Report
//             </button>
//           </form>
//         </div>
//       </div>
//     </section>
//   );
// }


import React from 'react';
import bgImage from '../assets/images/img4.jpg';

export default function IncidentForm({ reportRef }) {
  return (
    <section
      ref={reportRef}
      className="relative py-16 px-4 text-[#0d1b2a] overflow-hidden"
    >
      {/* Blurred background image */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm opacity-70 z-0"
        style={{ backgroundImage: `url(${bgImage})` }}
        aria-hidden="true"
      ></div>

      {/* Container for the content */}
      <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-10">
        {/* Left side text */}
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-4xl font-bold mb-4 text-slate-100 font-poppins">Fill Out a Report</h2>
          <p className="text-lg mb-6  text-slate-100">
            Help us document incidents of human rights violations by submitting a detailed report. Your input is crucial for seeking justice.
          </p>
          <p className="text-base  text-slate-100">
            Ensure you provide as much information as possible to aid investigations.
          </p>
        </div>

        {/* Right side form */}
        <div className="md:w-1/2 bg-white shadow-lg rounded-lg p-6 w-full">
          <h3 className="text-2xl font-semibold mb-4 text-center">
            File an Incident Report
          </h3>
          <form>
            <label className="block mb-2 font-medium">Incident Title</label>
            <input
              type="text"
              placeholder="Enter incident title"
              className="w-full border border-gray-400 rounded-md px-3 py-2 mb-4"
            />
            <label className="block mb-2 font-medium">Description</label>
            <textarea
              placeholder="Describe the incident..."
              className="w-full border border-gray-400 rounded-md px-3 py-2 mb-4"
            />
            <label className="block mb-2 font-medium">Date</label>
            <input
              type="date"
              className="w-full border border-gray-400 rounded-md px-3 py-2 mb-4"
            />
            <button
              type="submit"
              className="bg-[#fbbf24] hover:bg-yellow-500 text-[#0d1b2a] font-semibold px-4 py-2 rounded-lg w-full"
            >
              Submit Report
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
