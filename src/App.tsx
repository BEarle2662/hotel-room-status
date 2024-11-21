import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import RoomDetailsPage from './pages/RoomDetailsPage';
import TaskLogsPage from './pages/TaskLogsPage';
import Navigation from './components/Navigation';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/room/:id" element={<RoomDetailsPage />} />
            <Route path="/logs" element={<TaskLogsPage />} />
          </Routes>
        </main>
        <Toaster position="bottom-center" />
      </div>
    </BrowserRouter>
  );
}

export default App;