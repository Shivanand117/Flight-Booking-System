import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";


function formatBookingDateTime(value) {
    if (!value || !value.includes("T")) {
        return { date: "—", time: "—" };
    }

    const [datePart, timePart] = value.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);

    if (
        ![year, month, day, hours, minutes].every(Number.isFinite) ||
        month < 1 || month > 12 ||
        day < 1 || day > 31 ||
        hours < 0 || hours > 23 ||
        minutes < 0 || minutes > 59
    ) {
        return { date: "—", time: "—" };
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

function formatBookingPrice(value) {
    const amount = Number(value);

    if (!Number.isFinite(amount)) return "—";

    return `₹${amount.toLocaleString("en-IN", {
        maximumFractionDigits: 2
    })}`;
}

function Booking() {

    const { flightId } = useParams();

    const [flight, setFlight] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [creatingBooking, setCreatingBooking] = useState(false);
    const navigate = useNavigate();

    const totalSeats = Number(flight?.totalSeats ?? 0);
    const totalRows = Math.ceil(totalSeats / 4);
    const rowsPerSection = Math.max(1, Math.ceil(totalRows / 3));

    const [passengers, setPassengers] = useState([
        {
            name: "",
            age: "",
            gender: "",
            contactNumber: "",
            seatNumber: ""
        }
    ]);

    const [bookedSeats, setBookedSeats] = useState([]);
    const [activePassenger, setActivePassenger] = useState(0);


    useEffect(() => {
        let cancelled = false;

        const fetchFlight = async () => {
            if (!flightId) {
                setFlight(null);
                setError("Invalid flight ID.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");
            setFlight(null);
            setBookedSeats([]);

            try {
                const response = await api.get(`/flights/${flightId}`);

                if (!cancelled) {
                    if (response.data) {
                        setFlight(response.data);
                    } else {
                        setError("Flight not found.");
                    }
                }
            } catch (err) {
                console.error("Error fetching flight:", err);

                if (!cancelled) {
                    setFlight(null);
                    setError(
                        err.response?.data?.message ||
                        "Unable to load flight details."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        const fetchBookedSeats = async () => {
            if (!flightId) return;

            try {
                const response = await api.get(
                    `/flights/${flightId}/booked-seats`
                );

                if (!cancelled) {
                    setBookedSeats(
                        Array.isArray(response.data)
                            ? response.data
                            : []
                    );
                }
            } catch (err) {
                console.error("Error fetching booked seats:", err);

                if (!cancelled) {
                    setBookedSeats([]);
                }
            }
        };

        fetchFlight();
        fetchBookedSeats();

        return () => {
            cancelled = true;
        };
    }, [flightId]);

const handlePassengerChange = (index, field, value) => {

    const updatedPassengers = [...passengers];

    updatedPassengers[index][field] = value;

    setPassengers(updatedPassengers);
};

const addPassenger = () => {

    setPassengers([
        ...passengers,
        {
            name: "",
            age: "",
            gender: "",
            contactNumber: "",
            seatNumber: ""
        }
    ]);

    setActivePassenger(passengers.length);
};

const removePassenger = (index) => {

    if (passengers.length === 1) {
        return;
    }

    const updatedPassengers = passengers.filter(
        (_, passengerIndex) => passengerIndex !== index
    );

    setPassengers(updatedPassengers);

    if (activePassenger >= updatedPassengers.length) {
        setActivePassenger(updatedPassengers.length - 1);
    }
};

const handleSeatSelection = (seatNumber) => {

    // Already booked from database
    if (bookedSeats.includes(seatNumber)) {
        return;
    }

    // Check whether another passenger in this booking
    // already selected this seat
    const selectedByAnotherPassenger = passengers.some(
        (passenger, index) =>
            index !== activePassenger &&
            passenger.seatNumber === seatNumber
    );

    if (selectedByAnotherPassenger) {
        return;
    }

    const updatedPassengers = [...passengers];

    updatedPassengers[activePassenger].seatNumber = seatNumber;

    setPassengers(updatedPassengers);
};

const isSeatSelectedByPassenger = (seatNumber) => {

    return passengers.some(
        (passenger, index) =>
            passenger.seatNumber === seatNumber &&
            index !== activePassenger
    );
};

const generateSeats = () => {

    if (!flight) {
        return [];
    }
    const departure = formatBookingDateTime(
    flight.departureDateTime
);
const arrival = formatBookingDateTime(
    flight.arrivalDateTime
);

    const seats = [];
    const totalRows = Math.ceil(flight.totalSeats / 4);

    for (let row = 1; row <= totalRows; row++) {

        const seatLetters = ["A", "B", "C", "D"];

        for (const letter of seatLetters) {

            const seatNumber = `${row}${letter}`;

            const numericSeat =
                (row - 1) * 4 +
                seatLetters.indexOf(letter) + 1;

            if (numericSeat <= flight.totalSeats) {
                seats.push(seatNumber);
            }
        }
    }

    return seats;
};

const totalAmount = flight
    ? Number(flight.price) * passengers.length
    : 0;

const handleContinue = async () => {

    const incompletePassenger = passengers.some(
        (passenger) =>
            !passenger.name.trim() ||
            !passenger.age ||
            !passenger.gender ||
            !passenger.contactNumber.trim() ||
            !passenger.seatNumber
    );

    if (incompletePassenger) {
        alert(
            "Please complete all passenger details and select a seat for every passenger."
        );
        return;
    }

    try {

        setCreatingBooking(true);

        const bookingRequest = {
            flightId: Number(flightId),

            passengers: passengers.map((passenger) => ({
                name: passenger.name.trim(),
                age: Number(passenger.age),
                gender: passenger.gender,
                contactNumber: passenger.contactNumber.trim(),
                seatNumber: passenger.seatNumber
            }))
        };

        console.log("Booking Request:", bookingRequest);

        const response = await api.post(
            "/bookings",
            bookingRequest
        );

        console.log("Booking Response:", response.data);

        const bookingId = response.data.id;

        alert(
            `Booking created successfully. Booking ID: ${bookingId}`
        );

        // We'll build Payment page next
        navigate(`/payment/${bookingId}`);

    } catch (error) {

        console.error("Booking creation failed:", error);

        if (error.response) {

            alert(
                error.response.data.message ||
                "Unable to create booking."
            );

        } else {

            alert(
                "Unable to connect to the server."
            );
        }

    } finally {

        setCreatingBooking(false);
    }
};

if (loading) {
    return (
        <div className="booking-page">
            <h1>Complete Your Booking</h1>
            
<div className="booking-progress" aria-label="Booking progress">
    <div className="booking-progress-step is-complete">
        <span className="booking-progress-number">✓</span>
        <span>Flight</span>
    </div>

    <div className="booking-progress-connector"></div>

    <div
        className="booking-progress-step is-current"
        aria-current="step"
    >
        <span className="booking-progress-number">2</span>
        <span>Passengers & Seats</span>
    </div>

    <div className="booking-progress-connector"></div>

    <div className="booking-progress-step">
        <span className="booking-progress-number">3</span>
        <span>Payment</span>
    </div>
</div>
            <p>Loading flight details...</p>
        </div>
    );
}

if (error) {
    return (
        <div className="booking-page">
            <h1>Booking</h1>
            <p role="alert">{error}</p>
            <button onClick={() => navigate("/")}>
                Back to Home
            </button>
        </div>
    );
}

if (!flight) {
    return (
        <div className="booking-page">
            <h1>Booking</h1>
            <p>Flight details are not available.</p>
            <button onClick={() => navigate("/")}>
                Back to Home
            </button>
        </div>
    );
}

const departure = formatBookingDateTime(
    flight.departureDateTime
);

const arrival = formatBookingDateTime(
    flight.arrivalDateTime
);

const seatRowGroups = Array.from(
    {
        length: Math.ceil(totalRows / rowsPerSection)
    },
    (_, groupIndex) => {
        const startRow = groupIndex * rowsPerSection + 1;
        const endRow = Math.min(
            startRow + rowsPerSection - 1,
            totalRows
        );

        return Array.from(
            { length: endRow - startRow + 1 },
            (_, i) => startRow + i
        );
    }
);

const renderSeat = (row, letter) => {
    const seatNumber = `${row}${letter}`;
    const seatIndex =
        (row - 1) * 4 + ["A", "B", "C", "D"].indexOf(letter) + 1;

    if (seatIndex > flight.totalSeats) {
        return (
            <span
                key={seatNumber}
                className="seat-placeholder"
                aria-hidden="true"
            />
        );
    }

    const isBooked = bookedSeats.includes(seatNumber);
    const isReserved = isSeatSelectedByPassenger(seatNumber);
    const isSelected =
        passengers[activePassenger]?.seatNumber === seatNumber;

    const seatClass = isBooked
        ? "booked"
        : isSelected
            ? "selected"
            : isReserved
                ? "reserved"
                : "available";

    return (
        <button
            key={seatNumber}
            type="button"
            className={`seat ${seatClass}`}
            disabled={isBooked || isReserved}
            aria-label={`Seat ${seatNumber}, ${seatClass}`}
            onClick={() => handleSeatSelection(seatNumber)}
        >
            {seatNumber}
        </button>
    );
};

return (
    <div className="booking-page">

        <h1>Complete Your Booking</h1>

        {/* FLIGHT DETAILS */}

       
<div className="booking-flight-card">
    <div className="booking-flight-top">
        <div className="booking-airline-symbol">✈</div>

        <div className="booking-airline-name">
            <h2>{flight.airline}</h2>
            <span>Flight #{flight.id}</span>
        </div>

        <span className="booking-flight-type">
            SELECTED FLIGHT
        </span>
    </div>

    <div className="booking-flight-route">
        <div className="booking-flight-point">
            <span>DEPARTURE</span>
            <strong>{departure.time}</strong>
            <b>{flight.source}</b>
            <small>{departure.date}</small>
        </div>

        <div className="booking-flight-connector">
            <span>✈</span>
            <div></div>
        </div>

        <div className="booking-flight-point booking-arrival">
            <span>ARRIVAL</span>
            <strong>{arrival.time}</strong>
            <b>{flight.destination}</b>
            <small>{arrival.date}</small>
        </div>
    </div>

    <div className="booking-flight-bottom">
        <div>
            <span>Fare per passenger</span>
            <strong>{formatBookingPrice(flight.price)}</strong>
        </div>
        <div>
            <span>Seat capacity</span>
            <strong>{flight.totalSeats} seats</strong>
        </div>
    </div>
</div>


        {/* PASSENGER DETAILS */}

        <div className="passenger-section">

            <h2>Passenger Details</h2>

            {passengers.map((passenger, index) => (

                <div
                    className="passenger-card"
                    key={index}
                >

                    <div className="passenger-header">

                        <h3>
                            Passenger {index + 1}
                        </h3>

                        {passengers.length > 1 && (
                            <button
                                type="button"
                                onClick={() =>
                                    removePassenger(index)
                                }
                            >
                                Remove
                            </button>
                        )}

                    </div>


                    <div className="passenger-form">

                        <div>
                            <label>Name</label>

                            <input
                                type="text"
                                placeholder="Enter passenger name"
                                value={passenger.name}
                                onChange={(e) =>
                                    handlePassengerChange(
                                        index,
                                        "name",
                                        e.target.value
                                    )
                                }
                            />
                        </div>


                        <div>
                            <label>Age</label>

                            <input
                                type="number"
                                min="1"
                                max="120"
                                placeholder="Enter age"
                                value={passenger.age}
                                onChange={(e) =>
                                    handlePassengerChange(
                                        index,
                                        "age",
                                        e.target.value
                                    )
                                }
                            />
                        </div>


                        <div>
                            <label>Gender</label>

                            <select
                                value={passenger.gender}
                                onChange={(e) =>
                                    handlePassengerChange(
                                        index,
                                        "gender",
                                        e.target.value
                                    )
                                }
                            >
                                <option value="">
                                    Select gender
                                </option>

                                <option value="MALE">
                                    Male
                                </option>

                                <option value="FEMALE">
                                    Female
                                </option>

                                <option value="OTHER">
                                    Other
                                </option>

                            </select>
                        </div>


                        <div>
                            <label>Contact Number</label>

                            <input
                                type="text"
                                placeholder="Enter contact number"
                                value={passenger.contactNumber}
                                onChange={(e) =>
                                    handlePassengerChange(
                                        index,
                                        "contactNumber",
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                    </div>

                    <p className="selected-seat">
                        Selected Seat:
                        <strong>
                            {passenger.seatNumber || "Not selected"}
                        </strong>
                    </p>

                </div>

            ))}


            <button
                type="button"
                onClick={addPassenger}
            >
                + Add Passenger
            </button>

        </div>


        {/* PASSENGER SELECTOR */}

        <div className="seat-selection-section">

            <h2>Select Seat</h2>

            <p>
                Selecting seat for:
                <strong>
                    {" "}
                    Passenger {activePassenger + 1}
                </strong>
            </p>

            <div className="passenger-tabs">

                {passengers.map((passenger, index) => (

                    <button
                        key={index}
                        type="button"
                        className={
                            activePassenger === index
                                ? "active-passenger"
                                : ""
                        }
                        onClick={() =>
                            setActivePassenger(index)
                        }
                    >
                        Passenger {index + 1}
                        {passenger.seatNumber &&
                            ` (${passenger.seatNumber})`}
                    </button>

                ))}

            </div>


            {/* SEAT LEGEND */}

            <div className="seat-legend">

                <div>
                    <span className="seat available"></span>
                    Available
                </div>

                <div>
                    <span className="seat selected"></span>
                    Selected
                </div>

                <div>
                    <span className="seat booked"></span>
                    Booked
                </div>

            </div>


            {/* AIRPLANE SEAT MAP */}

            <div className="seat-map">
                {seatRowGroups.map((rows, index) => (
                    <div className="seat-map-section" key={index}>
                        <div className="seat-map-section-title">
                            Rows {rows[0]}–{rows[rows.length - 1]}
                        </div>

                        <div className="seat-column-header">
                            <span>Row</span>
                            <span>A</span>
                            <span>B</span>
                            <span className="aisle-space"></span>
                            <span>C</span>
                            <span>D</span>
                        </div>

                        {rows.map((row) => (
                            <div className="seat-row" key={row}>
                                <span className="row-number">{row}</span>
                                {renderSeat(row, "A")}
                                {renderSeat(row, "B")}
                                <span className="aisle-space"></span>
                                {renderSeat(row, "C")}
                                {renderSeat(row, "D")}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

        </div>


        {/* BOOKING SUMMARY */}

       
<div className="booking-summary booking-summary-compact">
    <div className="booking-summary-details">
        <h3>Booking Summary</h3>
        <p>Passengers: {passengers.length}</p>
        <p>Fare per passenger: {formatBookingPrice(flight.price)}</p>
        <p>
            Selected seats:{" "}
            {passengers
                .map((passenger) => passenger.seatNumber || "—")
                .join(", ")}
        </p>
    </div>

    <div className="booking-summary-total">
        <span>Estimated total</span>
        <strong>{formatBookingPrice(totalAmount)}</strong>
    </div>
</div>


        <button
            type="button"
            className="continue-button"
            onClick={handleContinue}
            disabled={creatingBooking}
        >
            {creatingBooking
                ? "Creating Booking..."
                : "Continue"}
        </button>

    </div>
);
}

export default Booking;