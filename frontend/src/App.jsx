
// import './App.css'

// export default function App() {
//   return (
//     <h1 className="text-4xl font-bold underline bg-gray-500">
//       Hello world!
//     </h1>
//   )
// }
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserDashboard from './pages/UserDashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UserDashboard />} />
      {/* Add more routes for other roles (admin, writer) as needed */}
    </Routes>
  );
}
