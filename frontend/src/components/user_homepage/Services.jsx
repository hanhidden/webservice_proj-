
import React from 'react';
import { FileTextIcon, SearchIcon, LockIcon } from 'lucide-react'; // example icons

export default function Services() {
  return (
    <section className="bg-[#e9e7e3] py-16 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-[#0d1b2a] mb-6">
          Our Services
        </h2>
        <p className="text-lg text-gray-700 mb-8">
          We offer a comprehensive set of tools to report, track, and analyze human rights violations while ensuring data security and user anonymity.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition duration-300">
            <FileTextIcon className="h-12 w-12 text-[#0d1b2a] mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Incident Reporting</h3>
            <p className="text-gray-600">
              Submit reports securely with photos, videos, and geolocation data for thorough documentation.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition duration-300">
            <SearchIcon className="h-12 w-12 text-[#0d1b2a] mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Case Tracking</h3>
            <p className="text-gray-600">
              Track the status of cases, from initial report to resolution, with updates on investigation progress.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition duration-300">
            <LockIcon className="h-12 w-12 text-[#0d1b2a] mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Data Privacy</h3>
            <p className="text-gray-600">
              Role-based access controls and encryption keep sensitive victim and witness data protected.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
