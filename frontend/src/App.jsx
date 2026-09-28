
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Flights from "./pages/Flights";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import Bookings from "./pages/Bookings";
import AnnouncementTicker from "./components/AnnouncementTicker";

import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <div className="app-layout">
                <Navbar />
                <AnnouncementTicker />

                <main className="app-main">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/flights" element={<Flights />} />
                        <Route
                            path="/booking/:flightId"
                            element={<Booking />}
                        />
                        <Route
                            path="/payment/:bookingId"
                            element={<Payment />}
                        />
                        <Route
                            path="/confirmation/:bookingId"
                            element={<Confirmation />}
                        />
                        <Route
                            path="/bookings"
                            element={<Bookings />}
                        />
                    </Routes>
                </main>

                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;