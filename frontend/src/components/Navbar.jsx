import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav>
            <h2>Flight Booking System</h2>

            <div>
                <Link to="/">Home</Link>
                <Link to="/flights">Flights</Link>
                <Link to="/bookings">My Bookings</Link>
            </div>
        </nav>
    );
}

export default Navbar;