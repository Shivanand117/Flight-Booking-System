
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const paymentMethods = [
    { value: "UPI", label: "UPI", icon: "📱", detail: "Demo UPI payment" },
    { value: "CREDIT_CARD", label: "Credit Card", icon: "💳", detail: "Demo credit card" },
    { value: "DEBIT_CARD", label: "Debit Card", icon: "💳", detail: "Demo debit card" },
    { value: "NET_BANKING", label: "Net Banking", icon: "🏦", detail: "Demo banking" },
    { value: "WALLET", label: "Wallet", icon: "👛", detail: "Demo wallet payment" },
    { value: "CASH", label: "Cash", icon: "💵", detail: "Demo cash payment" }
];

function formatPrice(value) {
    const amount = Number(value);

    if (!Number.isFinite(amount)) return "—";

    return `₹${amount.toLocaleString("en-IN", {
        maximumFractionDigits: 2
    })}`;
}

function formatTravelDate(value) {
    if (!value) return "—";

    const datePart = value.split("T")[0];
    const [year, month, day] = datePart.split("-").map(Number);

    if (!year || !month || !day) return "—";

    return new Date(year, month - 1, day).toLocaleDateString(
        "en-IN",
        {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

function formatTravelTime(value) {
    if (!value || !value.includes("T")) return "—";

    const timePart = value.split("T")[1];
    const [hours, minutes] = timePart.split(":").map(Number);

    if (
        !Number.isInteger(hours) ||
        !Number.isInteger(minutes) ||
        hours < 0 || hours > 23 ||
        minutes < 0 || minutes > 59
    ) {
        return "—";
    }

    return new Date(
        2000, 0, 1, hours, minutes
    ).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}

function Payment() {
    const { bookingId } = useParams();
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [loadingBooking, setLoadingBooking] = useState(true);
    const [bookingError, setBookingError] = useState("");

    const [paymentMode, setPaymentMode] = useState("");
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchBooking = async () => {
            if (!bookingId || !/^\d+$/.test(bookingId)) {
                setBookingError("Invalid booking ID.");
                setLoadingBooking(false);
                return;
            }

            try {
                setLoadingBooking(true);
                setBookingError("");

                const response = await api.get(`/bookings/${bookingId}`);

                if (!cancelled) {
                    setBooking(response.data || null);

                    if (!response.data) {
                        setBookingError("Booking details not found.");
                    }
                }
            } catch (err) {
                console.error("Error fetching booking:", err);

                if (!cancelled) {
                    setBookingError(
                        err.response?.data?.message ||
                        "Unable to load booking details."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingBooking(false);
                }
            }
        };

        fetchBooking();

        return () => {
            cancelled = true;
        };
    }, [bookingId]);

    const flight = booking?.flight;
    const passengers = Array.isArray(booking?.passengers)
        ? booking.passengers
        : [];

    const fare = Number(flight?.price);
    const calculatedFare =
        Number.isFinite(fare) && passengers.length > 0
            ? fare * passengers.length
            : null;

    const existingAmount = booking?.payment?.amount;
    const totalAmount =
        existingAmount != null &&
        Number.isFinite(Number(existingAmount))
            ? Number(existingAmount)
            : calculatedFare;

    const isCancelled = booking?.status === "CANCELLED";
    const isAlreadyPaid =
        booking?.payment?.paymentStatus === "SUCCESS";

    const handlePayment = async () => {
        if (paying) return;

        if (!paymentMode) {
            setError("Please select a payment method.");
            return;
        }

        if (!bookingId || !/^\d+$/.test(bookingId)) {
            setError("Invalid booking ID.");
            return;
        }

        if (isCancelled) {
            setError("This booking has been cancelled.");
            return;
        }

        if (isAlreadyPaid) {
            setError("This booking has already been paid.");
            return;
        }

        try {
            setPaying(true);
            setError("");

            const paymentRequest = {
                bookingId: Number(bookingId),
                paymentMode
            };

            const response = await api.post(
                "/payments",
                paymentRequest
            );

            console.log("Payment Response:", response.data);

            if (response.data.paymentStatus === "SUCCESS") {
                navigate(`/confirmation/${bookingId}`, {
                    state: { payment: response.data },
                    replace: true
                });
            } else {
                setError("Payment was not successful.");
            }
        } catch (err) {
            console.error("Payment failed:", err);

            if (err.response) {
                setError(
                    err.response.data?.message ||
                    "Payment failed. Please try again."
                );
            } else {
                setError("Unable to connect to the server.");
            }
        } finally {
            setPaying(false);
        }
    };

    return (
        <main className="payment-page payment-modern">
            <div className="payment-container">
                <header className="payment-heading">
                    <span className="payment-eyebrow">
                        ✦ SECURE CHECKOUT DEMO
                    </span>
                    <h1>Complete Your Payment</h1>
                    <p>
                        Review your booking and choose a payment method.
                    </p>
                </header>

                <div className="payment-progress" aria-label="Payment progress">
                    <div className="payment-step payment-step-complete">
                        <span>✓</span>
                        <small>Flight</small>
                    </div>
                    <div className="payment-step-line payment-line-complete"></div>
                    <div className="payment-step payment-step-complete">
                        <span>✓</span>
                        <small>Booking</small>
                    </div>
                    <div className="payment-step-line payment-line-active"></div>
                    <div className="payment-step payment-step-active"
                        aria-current="step">
                        <span>3</span>
                        <small>Payment</small>
                    </div>
                    <div className="payment-step-line"></div>
                    <div className="payment-step">
                        <span>4</span>
                        <small>Confirmation</small>
                    </div>
                </div>

                <div className="payment-layout">
                    {/* BOOKING SUMMARY */}
                    <section className="payment-summary-panel">
                        <div className="payment-panel-heading">
                            <div>
                                <span className="payment-section-label">
                                    YOUR BOOKING
                                </span>
                                <h2>Order Summary</h2>
                            </div>
                            <span className="payment-summary-icon">✈</span>
                        </div>

                        <div className="payment-booking-id">
                            <span>Booking ID</span>
                            <strong>#{bookingId}</strong>
                        </div>

                        {loadingBooking ? (
                            <p className="payment-info-message">
                                Loading booking details...
                            </p>
                        ) : bookingError ? (
                            <p className="payment-info-message" role="status">
                                {bookingError}
                            </p>
                        ) : (
                            <>
                                {flight && (
                                    <div className="payment-route-card">
                                        <div className="payment-airline">
                                            <span>✈</span>
                                            <strong>{flight.airline}</strong>
                                        </div>

                                        <div className="payment-route">
                                            <div>
                                                <strong>{flight.source}</strong>
                                                <span>
                                                    {formatTravelTime(
                                                        flight.departureDateTime
                                                    )}
                                                </span>
                                                <small>
                                                    {formatTravelDate(
                                                        flight.departureDateTime
                                                    )}
                                                </small>
                                            </div>

                                            <div className="payment-route-line">
                                                <span>✈</span>
                                            </div>

                                            <div className="payment-route-destination">
                                                <strong>{flight.destination}</strong>
                                                <span>
                                                    {formatTravelTime(
                                                        flight.arrivalDateTime
                                                    )}
                                                </span>
                                                <small>
                                                    {formatTravelDate(
                                                        flight.arrivalDateTime
                                                    )}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="payment-summary-row">
                                    <span>Passengers</span>
                                    <strong>{passengers.length}</strong>
                                </div>

                                <div className="payment-summary-row">
                                    <span>Fare per passenger</span>
                                    <strong>
                                        {formatPrice(flight?.price)}
                                    </strong>
                                </div>

                                {passengers.length > 0 && (
                                    <div className="payment-passenger-list">
                                        <span className="payment-summary-caption">
                                            Passenger details
                                        </span>
                                        {passengers.slice(0, 3).map(
                                            (passenger, index) => (
                                                <div
                                                    className="payment-passenger-row"
                                                    key={passenger.id ?? index}
                                                >
                                                    <span>
                                                        {passenger.name ||
                                                            `Passenger ${index + 1}`}
                                                    </span>
                                                    <span>
                                                        {passenger.seatNumber
                                                            ? `Seat ${passenger.seatNumber}`
                                                            : "Seat not assigned"}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                        {passengers.length > 3 && (
                                            <small>
                                                +{passengers.length - 3} more
                                                passengers
                                            </small>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        <div className="payment-total">
                            <span>Total booking fare</span>
                            <strong>
                                {formatPrice(totalAmount)}
                            </strong>
                        </div>
                    </section>

                    {/* PAYMENT METHODS */}
                    <section className="payment-card payment-method-panel">
                        <div className="payment-panel-heading">
                            <div>
                                <span className="payment-section-label">
                                    PAYMENT OPTIONS
                                </span>
                                <h2>Choose a Method</h2>
                            </div>
                            <span className="payment-method-icon">▣</span>
                        </div>

                        <p className="payment-method-description">
                            Select your preferred demo payment method.
                        </p>

                        <div className="payment-method-grid">
                            {paymentMethods.map((method) => (
                                <button
                                    key={method.value}
                                    type="button"
                                    className={
                                        `payment-method-option ${
                                            paymentMode === method.value
                                                ? "payment-method-selected"
                                                : ""
                                        }`
                                    }
                                    aria-pressed={
                                        paymentMode === method.value
                                    }
                                    disabled={paying}
                                    onClick={() => {
                                        setPaymentMode(method.value);
                                        setError("");
                                    }}
                                >
                                    <span className="payment-method-option-icon">
                                        {method.icon}
                                    </span>
                                    <span className="payment-method-text">
                                        <strong>{method.label}</strong>
                                        <small>{method.detail}</small>
                                    </span>
                                    <span className="payment-method-check">
                                        {paymentMode === method.value
                                            ? "✓"
                                            : ""}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {isCancelled && (
                            <div className="payment-alert" role="alert">
                                This booking has been cancelled and cannot
                                be paid for.
                            </div>
                        )}

                        {isAlreadyPaid && (
                            <div className="payment-alert" role="status">
                                This booking has already been paid.
                            </div>
                        )}

                        {error && !isCancelled && !isAlreadyPaid && (
                            <div className="payment-alert" role="alert">
                                {error}
                            </div>
                        )}

                        <button
                            type="button"
                            className="payment-submit-button"
                            onClick={handlePayment}
                            disabled={
                                paying ||
                                isCancelled ||
                                isAlreadyPaid ||
                                loadingBooking
                            }
                        >
                            {paying
                                ? "Processing Payment..."
                                : isAlreadyPaid
                                    ? "Already Paid"
                                    : isCancelled
                                        ? "Booking Cancelled"
                                        : totalAmount != null
                                            ? `Pay ${formatPrice(totalAmount)}`
                                            : "Pay Now"}
                            {!paying && !isCancelled && !isAlreadyPaid && (
                                <span>→</span>
                            )}
                        </button>

                        <div className="payment-demo-notice">
                            <span>ⓘ</span>
                            <p>
                                Demo payment only. No real money is charged,
                                and no real refund is issued.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="payment-back-button"
                            onClick={() => navigate("/bookings")}
                        >
                            View My Bookings
                        </button>
                    </section>
                </div>
            </div>
        </main>
    );
}

export default Payment;