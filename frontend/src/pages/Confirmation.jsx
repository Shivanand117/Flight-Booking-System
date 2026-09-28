
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../services/api";

function formatDateTime(value) {
    if (!value || typeof value !== "string" || !value.includes("T")) {
        return { date: "—", time: "—" };
    }

    const [datePart, timePart] = value.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);

    if (
        !year || !month || !day ||
        !Number.isInteger(hours) ||
        !Number.isInteger(minutes) ||
        hours < 0 || hours > 23 ||
        minutes < 0 || minutes > 59
    ) {
        return { date: datePart || "—", time: "—" };
    }

    return {
        date: new Date(year, month - 1, day).toLocaleDateString(
            "en-IN",
            {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        ),
        time: new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }
        )
    };
}

function formatDate(value) {
    if (!value) return "—";

    const datePart = String(value).split("T")[0];
    const [year, month, day] = datePart.split("-").map(Number);

    if (!year || !month || !day) return "—";

    return new Date(year, month - 1, day).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

function formatCurrency(value) {
    if (value == null || !Number.isFinite(Number(value))) {
        return "—";
    }

    return `₹${Number(value).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    })}`;
}

function formatLabel(value) {
    if (!value) return "Not available";

    return String(value)
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function Confirmation() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const paymentFromNavigation = location.state?.payment;

    useEffect(() => {
        let cancelled = false;

        const fetchBooking = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    `/bookings/${bookingId}`
                );

                if (!cancelled) {
                    setBooking(response.data || null);

                    if (!response.data) {
                        setError("Booking not found.");
                    }
                }
            } catch (err) {
                console.error("Error fetching booking:", err);

                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load booking details."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchBooking();

        return () => {
            cancelled = true;
        };
    }, [bookingId]);

    if (loading) {
        return (
            <main className="confirmation-page confirmation-modern">
                <div className="confirmation-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your booking details...</p>
                </div>
            </main>
        );
    }

    if (error || !booking) {
        return (
            <main className="confirmation-page confirmation-modern">
                <div className="confirmation-error">
                    <h2>Unable to display booking</h2>
                    <p>{error || "Booking not found."}</p>
                    <button
                        type="button"
                        onClick={() => navigate("/bookings")}
                    >
                        View My Bookings
                    </button>
                </div>
            </main>
        );
    }

    const flight = booking.flight;
    const passengers = Array.isArray(booking.passengers)
        ? booking.passengers
        : [];

    // Prefer the latest payment returned by the booking API.
    const payment = booking.payment ?? paymentFromNavigation;

    const status = booking.status || "PENDING";
    const isConfirmed = status === "CONFIRMED";
    const isCancelled = status === "CANCELLED";

    const statusClass = String(status).toLowerCase();

    const paymentStatus = payment?.paymentStatus || "NOT_AVAILABLE";
    const paymentStatusClass = String(paymentStatus).toLowerCase();

    const departure = formatDateTime(flight?.departureDateTime);
    const arrival = formatDateTime(flight?.arrivalDateTime);

    const heading = isConfirmed
        ? "Booking Confirmed!"
        : isCancelled
            ? "Booking Cancelled"
            : "Booking Details";

    const subtitle = isConfirmed
        ? "Your booking details are ready. Keep your booking reference handy."
        : isCancelled
            ? "This booking has been cancelled. See the details below."
            : "Here are the details of your booking.";

    const calculatedTotal =
        flight?.price != null && passengers.length > 0
            ? Number(flight.price) * passengers.length
            : null;

    const totalAmount =
        payment?.amount != null
            ? payment.amount
            : calculatedTotal;

    return (
        <main className="confirmation-page confirmation-modern">
            <div className="confirmation-shell">

                {/* SUCCESS HEADER */}
                <header className="confirmation-hero">
                    <div
                        className={`confirmation-result-icon ${
                            isConfirmed
                                ? "confirmed"
                                : isCancelled
                                    ? "cancelled"
                                    : "pending"
                        }`}
                        aria-hidden="true"
                    >
                        {isConfirmed ? "✓" : isCancelled ? "×" : "i"}
                    </div>

                    <h1>{heading}</h1>
                    <p>{subtitle}</p>
                </header>

                {/* TICKET CARD */}
                <section className="confirmation-ticket">

                    {/* BOOKING REFERENCE */}
                    <div className="confirmation-ticket-header">
                        <div className="confirmation-reference">
                            <span>BOOKING REFERENCE</span>
                            <strong>#{booking.id}</strong>
                        </div>

                        <span className={`confirmation-status-pill ${statusClass}`}>
                            {formatLabel(status)}
                        </span>
                    </div>

                    {/* FLIGHT DETAILS */}
                    {flight && (
                        <div className="confirmation-flight">
                            <div className="confirmation-airline">
                                <div className="confirmation-airline-icon">
                                    ✈
                                </div>
                                <div>
                                    <strong>{flight.airline}</strong>
                                    <small>Flight #{flight.id}</small>
                                </div>
                            </div>

                            <div className="confirmation-route">
                                <div className="confirmation-location">
                                    <span>DEPARTURE</span>
                                    <strong>{departure.time}</strong>
                                    <b>{flight.source}</b>
                                    <small>{departure.date}</small>
                                </div>

                                <div className="confirmation-route-line">
                                    <i></i>
                                    <span>✈</span>
                                    <i></i>
                                </div>

                                <div className="confirmation-location arrival">
                                    <span>ARRIVAL</span>
                                    <strong>{arrival.time}</strong>
                                    <b>{flight.destination}</b>
                                    <small>{arrival.date}</small>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TRIP INFORMATION */}
                    <div className="confirmation-section">
                        <h2>Booking Information</h2>

                        <div className="confirmation-info-grid">
                            <div className="confirmation-info-item">
                                <span>Booking ID</span>
                                <strong>#{booking.id}</strong>
                            </div>

                            <div className="confirmation-info-item">
                                <span>Booking Date</span>
                                <strong>
                                    {formatDate(booking.bookingDate)}
                                </strong>
                            </div>

                            <div className="confirmation-info-item">
                                <span>Booking Status</span>
                                <strong className={`confirmation-inline-status ${statusClass}`}>
                                    {formatLabel(status)}
                                </strong>
                            </div>

                            <div className="confirmation-info-item">
                                <span>Passengers</span>
                                <strong>{passengers.length}</strong>
                            </div>
                        </div>
                    </div>

                    {/* PASSENGERS */}
                    <div className="confirmation-section">
                        <h2>Passenger Details</h2>

                        {passengers.length > 0 ? (
                            <div className="confirmation-passengers">
                                {passengers.map((passenger, index) => (
                                    <div
                                        className="confirmation-passenger"
                                        key={passenger.id ?? index}
                                    >
                                        <div className="confirmation-passenger-avatar">
                                            {passenger.name?.trim()
                                                ? passenger.name.trim().charAt(0).toUpperCase()
                                                : index + 1}
                                        </div>

                                        <div className="confirmation-passenger-name">
                                            <strong>
                                                {passenger.name ||
                                                    `Passenger ${index + 1}`}
                                            </strong>
                                            <span>
                                                Passenger {index + 1}
                                            </span>
                                        </div>

                                        <div className="confirmation-seat">
                                            <span>SEAT</span>
                                            <strong>
                                                {passenger.seatNumber || "—"}
                                            </strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="confirmation-muted">
                                No passenger details available.
                            </p>
                        )}
                    </div>

                    {/* PAYMENT */}
                    <div className="confirmation-section confirmation-payment-section">
                        <h2>Payment Details</h2>

                        <div className="confirmation-payment-grid">
                            <div className="confirmation-info-item">
                                <span>Payment Status</span>
                                <strong className={`confirmation-inline-status ${paymentStatusClass}`}>
                                    {formatLabel(paymentStatus)}
                                </strong>
                            </div>

                            <div className="confirmation-info-item">
                                <span>Payment ID</span>
                                <strong>{payment?.id ?? "—"}</strong>
                            </div>

                            <div className="confirmation-info-item">
                                <span>Payment Method</span>
                                <strong>
                                    {formatLabel(payment?.paymentMode)}
                                </strong>
                            </div>

                            <div className="confirmation-info-item">
                                <span>Amount</span>
                                <strong className="confirmation-amount">
                                    {formatCurrency(totalAmount)}
                                </strong>
                            </div>
                        </div>

                        <p className="confirmation-demo-note">
                            Demo application: payments and refunds are
                            simulated. No real money is transferred.
                        </p>
                    </div>
                </section>

                {/* ACTIONS */}
                <div className="confirmation-actions confirmation-actions-modern">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                    >
                        ✈ &nbsp; Search More Flights
                    </button>

                    <button
                        type="button"
                        className="secondary-action"
                        onClick={() => navigate("/bookings")}
                    >
                        View My Bookings &nbsp; →
                    </button>
                </div>
            </div>
        </main>
    );
}

export default Confirmation;