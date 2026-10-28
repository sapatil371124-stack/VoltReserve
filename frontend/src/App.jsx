import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VehicleProvider } from './context/VehicleContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { VehicleStatusModal } from './components/VehicleStatusModal';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FindStationsPage } from './pages/FindStationsPage';
import { StationDetailsPage } from './pages/StationDetailsPage';
import { CompareStationsPage } from './pages/CompareStationsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

function App() {
  return (
    <AuthProvider>
      <VehicleProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-[#F5F0E8] text-[#2D211A] font-sans">
            <Navbar />
            <VehicleStatusModal />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/stations" element={<FindStationsPage />} />
                <Route path="/stations/:id" element={<StationDetailsPage />} />
                <Route path="/compare" element={<CompareStationsPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />

                {/* Protected User Driver Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/booking/confirm"
                  element={
                    <ProtectedRoute>
                      <BookingConfirmationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/booking/confirmation"
                  element={
                    <ProtectedRoute>
                      <BookingConfirmationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/booking/confirmation/:id"
                  element={
                    <ProtectedRoute>
                      <BookingConfirmationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vehicles"
                  element={
                    <ProtectedRoute>
                      <VehiclesPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </VehicleProvider>
    </AuthProvider>
  );
}

export default App;
