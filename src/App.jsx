import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MainLayout from "./layouts/MainLayout";
import DriverDashboard from "./pages/driver/DriverDashboard";
import Login from "./pages/customer/Login";
import Signup from "./pages/customer/Signup";
import BookRide from "./pages/customer/BookRide";
import RideTracking from "./pages/customer/RideTracking";
import RideRequest from "./pages/driver/RideRequest";
import DriverLogin from "./pages/driver/DriverLogin";
import DriverSignup from "./pages/driver/DriverSignup";
import DriverProfile from "./pages/driver/DriverProfile";
import DriverOrders from "./pages/driver/DriverOrders";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersList from "./pages/admin/UsersList";
import DriversList from "./pages/admin/DriversList";
import BookingsList from "./pages/admin/BookingsList";
import DriverPayment from "./pages/driver/DriverPayment";




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />

        <Route
          path="/cab/book"
          element={
            <MainLayout>
              <BookRide />
            </MainLayout>
          }
        />

        <Route
          path="/cab/track/:bookingId"
          element={
            <MainLayout>
              <RideTracking />
            </MainLayout>
          }
        />

        {/* 🔥 DRIVER WITHOUT MainLayout */}
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />
<Route path="/driver/login" element={<DriverLogin />} />
        <Route path="/driver/request" element={<RideRequest />} />
        
        <Route path="/driver/signup" element={<DriverSignup />} />
        <Route path="/driver/orders" element={<DriverOrders />} />
        <Route path="/driver/profile" element={<DriverProfile />} />
       <Route path="/admin/login" element={<AdminLogin />} />
<Route path="/admin/dashboard" element={<AdminDashboard />} />
<Route path="/admin/users" element={<UsersList />} />
<Route path="/admin/drivers" element={<DriversList />} />
<Route path="/admin/bookings" element={<BookingsList />} />
<Route path="/driver/payment" element={<DriverPayment />} />
 

      </Routes>
    </BrowserRouter>
  );
}

export default App;
