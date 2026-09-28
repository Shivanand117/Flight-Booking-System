
import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-container">

                <div className="footer-main">
                    <div className="footer-brand">
                        <h2>✈ Flight Booking System</h2>
                        <p>
                            Plan your journey with ease. Search flights,
                            select seats and manage your bookings
                            in one convenient place.
                        </p>
                    </div>

                    <div className="footer-links">
                        <h3>Quick Links</h3>
                        <Link to="/">Home</Link>
                        <Link to="/flights">Flights</Link>
                        <Link to="/bookings">My Bookings</Link>
                    </div>

                    <div className="footer-about">
                        <h3>About</h3>
                        <p>
                            A flight booking application built to
                            simplify flight search and booking
                            management.
                        </p>
                    </div>
                </div>

                <div className="footer-disclaimer">
                    <strong>Demo Application:</strong>
                    <p>
                        Flight schedules and fares are sample data.
                        Payments and refunds are simulated.
                        No actual tickets are issued and no real
                        transactions are processed.
                    </p>
                </div>

                <div className="footer-bottom">
                    <p>
                        © {new Date().getFullYear()} Flight Booking
                        System. All rights reserved.
                    </p>
                    <span>Built with React and Spring Boot</span>
                </div>

            </div>
        </footer>
    );
}

export default Footer;