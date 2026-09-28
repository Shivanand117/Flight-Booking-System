
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function formatDateTime(value) {
    if (!value || typeof value !== "string") {
        return { date: "—", time: "—" };
    }

    const [datePart, timePart] = value.split("T");
    if (!datePart || !timePart) {
        return { date: "—", time: "—" };
    }

    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);

    if (
        !year || !month || !day ||
        !Number.isInteger(hours) ||
        !Number.isInteger(minutes) ||
        hours < 0 || hours > 23 ||
        minutes < 0 || minutes > 59
    ) {
        return { date: "—", time: "—" };
    }

    return {
        date: new Date(year, month - 1, day).toLocaleDateString(
            "en-IN",
            {
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

function formatPrice(value) {
    if (value == null || value === "") return "—";

    const amount = Number(value);
    if (!Number.isFinite(amount)) return "—";

    return `₹${amount.toLocaleString("en-IN", {
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

function getBookingPriority(booking) {
    const status = booking.status?.toUpperCase();
    const paymentStatus = booking.payment?.paymentStatus?.toUpperCase();

    if (status === "CONFIRMED" && paymentStatus === "SUCCESS") {
        return 0;
    }

    if (status === "CANCELLED") {
        return 2;
    }

    return 1;
}

function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState(null);
    const [cancelError, setCancelError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;

        const fetchBookings = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/bookings");

                if (!cancelled) {
                    setBookings(
                        Array.isArray(response.data)
                            ? response.data
                            : []
                    );
                }
            } catch (err) {
                console.error("Error fetching bookings:", err);

                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load bookings."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchBookings();

        return () => {
            cancelled = true;
        };
    }, []);

    const sortedBookings = [...bookings].sort((a, b) => {
        const priorityDifference =
            getBookingPriority(a) - getBookingPriority(b);

        if (priorityDifference !== 0) {
            return priorityDifference;
        }

        const dateA = Date.parse(a.bookingDate || "");
        const dateB = Date.parse(b.bookingDate || "");

        const timestampA = Number.isFinite(dateA) ? dateA : 0;
        const timestampB = Number.isFinite(dateB) ? dateB : 0;

        if (timestampA !== timestampB) {
            return timestampB - timestampA;
        }

        return (Number(b.id) || 0) - (Number(a.id) || 0);
    });

    const handleCancel = async (bookingId) => {
        if (cancellingId !== null) return;

        const confirmed = window.confirm(
            `Are you sure you want to cancel booking #${bookingId}?`
        );

        if (!confirmed) return;

        try {
            setCancellingId(bookingId);
            setCancelError(null);

            const response = await api.put(
                `/bookings/${bookingId}/cancel`
            );

            setBookings((previousBookings) =>
                previousBookings.map((booking) =>
                    booking.id === bookingId
                        ? { ...booking, ...response.data }
                        : booking
                )
            );

            alert("Booking cancelled successfully.");
        } catch (err) {
            console.error("Cancellation failed:", err);

            setCancelError({
                bookingId,
                message:
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Unable to cancel the booking."
            });
        } finally {
            setCancellingId(null);
        }
    };

    if (loading) {
        return (
            <main className="bookings-page bookings-modern">
                <div className="bookings-heading">
                    <h1>My Bookings</h1>
                </div>
                <div className="bookings-message">
                    <div className="loading-spinner"></div>
                    <p>Loading your bookings...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="bookings-page bookings-modern">
                <div className="bookings-heading">
                    <h1>My Bookings</h1>
                </div>
                <div className="bookings-message" role="alert">
                    <h2>Unable to load bookings</h2>
                    <p>{error}</p>
                </div>
            </main>
        );
    }

    return (
        <main className="bookings-page bookings-modern">
            <div className="bookings-heading">
                <div>
                    <span className="bookings-eyebrow">
                        YOUR TRAVEL
                    </span>
                    <h1>My Bookings</h1>
                    <p>View and manage your flight reservations.</p>
                </div>

                <span className="bookings-total-count">
                    {bookings.length}{" "}
                    {bookings.length === 1 ? "booking" : "bookings"}
                </span>
            </div>

            {sortedBookings.length === 0 ? (
                <section className="bookings-empty">
                    <div className="bookings-empty-icon">✈</div>
                    <h2>No bookings yet</h2>
                    <p>
                        Your flight reservations will appear here
                        once you make a booking.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                    >
                        Search Flights →
                    </button>
                </section>
            ) : (
                <div className="bookings-ticket-list">
                    {sortedBookings.map((booking) => {
                        const flight = booking.flight;
                        const passengers = Array.isArray(booking.passengers)
                            ? booking.passengers
                            : [];

                        const departure = formatDateTime(
                            flight?.departureDateTime
                        );
                        const arrival = formatDateTime(
                            flight?.arrivalDateTime
                        );

                        const status = booking.status || "PENDING";
                        const statusClass = status.toLowerCase();

                        const paymentStatus =
                            booking.payment?.paymentStatus || "NOT_PAID";

                        const paymentClass = paymentStatus.toLowerCase();

                        const fare = Number(flight?.price);
                        const totalFare =
                            booking.payment?.amount != null
                                ? booking.payment.amount
                                : Number.isFinite(fare)
                                    ? fare * passengers.length
                                    : null;

                        return (
                            <article
                                className="booking-ticket"
                                key={booking.id}
                            >
                                {/* HEADER */}
                                <div className="booking-ticket-header">
                                    <div className="booking-ticket-brand">
                                        <span className="booking-ticket-plane">
                                            ✈
                                        </span>
                                        <div>
                                            <strong>
                                                {flight?.airline || "Flight"}
                                            </strong>
                                            <small>
                                                Booking #{booking.id}
                                            </small>
                                        </div>
                                    </div>

                                    <div className="booking-ticket-badges">
                                        <span
                                            className={`booking-ticket-status ${statusClass}`}
                                        >
                                            {formatLabel(status)}
                                        </span>
                                    </div>
                                </div>

                                {/* ROUTE */}
                                <div className="booking-ticket-route">
                                    <div className="booking-ticket-point">
                                        <span>FROM</span>
                                        <strong>
                                            {flight?.source || "—"}
                                        </strong>
                                        <b>{departure.time}</b>
                                        <small>{departure.date}</small>
                                    </div>

                                    <div className="booking-ticket-route-line">
                                        <span>✈</span>
                                        <i></i>
                                    </div>

                                    <div className="booking-ticket-point booking-ticket-arrival">
                                        <span>TO</span>
                                        <strong>
                                            {flight?.destination || "—"}
                                        </strong>
                                        <b>{arrival.time}</b>
                                        <small>{arrival.date}</small>
                                    </div>
                                </div>

                                {/* DETAILS */}
                                <div className="booking-ticket-details">
                                    <div>
                                        <span>BOOKED ON</span>
                                        <strong>
                                            {booking.bookingDate
                                                ? formatDateTime(booking.bookingDate).date
                                                : "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>PASSENGERS</span>
                                        <strong>{passengers.length}</strong>
                                    </div>

                                    <div>
                                        <span>TOTAL FARE</span>
                                        <strong className="booking-ticket-fare">
                                            {formatPrice(totalFare)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>PAYMENT</span>
                                        <strong>
                                            {formatLabel(paymentStatus)}
                                        </strong>
                                    </div>
                                </div>

                                {/* PASSENGERS AND ACTION */}
                                <div className="booking-ticket-footer">
                                    <div className="booking-ticket-seats">
                                        <span>PASSENGERS & SEATS</span>
                                        <div className="booking-ticket-passenger-list">
                                            {passengers.length > 0 ? (
                                                passengers.map((passenger, index) => (
                                                    <span key={passenger.id ?? index}>
                                                        {passenger.name || `Passenger ${index + 1}`}
                                                        <b>
                                                            {passenger.seatNumber
                                                                ? ` · ${passenger.seatNumber}`
                                                                : ""}
                                                        </b>
                                                    </span>
                                                ))
                                            ) : (
                                                <span>No passenger details</span>
                                            )}
                                        </div>
                                    </div>

                                    {status !== "CANCELLED" && (
                                        <button
                                            type="button"
                                            className="booking-ticket-cancel"
                                            disabled={cancellingId !== null}
                                            onClick={() => handleCancel(booking.id)}
                                        >
                                            {cancellingId === booking.id
                                                ? "Cancelling..."
                                                : "Cancel Booking"}
                                        </button>
                                    )}
                                </div>

                                {cancelError?.bookingId === booking.id && (
                                    <p className="booking-ticket-error" role="alert">
                                        {cancelError.message}
                                    </p>
                                )}

                                {paymentStatus === "REFUNDED" && (
                                    <div className="booking-refund-note">
                                        Refund recorded in this demo. No real
                                        money was transferred.
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </main>
    );
}

export default Bookings;