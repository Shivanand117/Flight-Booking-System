import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function toLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function parseLocalDate(value) {
    if (!value) return null;

    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function formatDisplayDate(value) {
    const date = parseLocalDate(value);

    if (!date) return "Select departure date";

    return new Intl.DateTimeFormat("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(date);
}

function Home() {

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [departureDate, setDepartureDate] = useState("");
    const navigate = useNavigate();
    const [sourceSuggestions, setSourceSuggestions] = useState([]);
    const [destinationSuggestions, setDestinationSuggestions] = useState([]);
    const skipSourceSearch = useRef(false);
    const skipDestinationSearch = useRef(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [calendarFares, setCalendarFares] = useState({});
    const datePickerRef = useRef(null);
    const [isNarrowScreen, setIsNarrowScreen] = useState(
        () => window.innerWidth <= 700
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 1);

    const lastDate = new Date(minDate);
    lastDate.setDate(lastDate.getDate() + 29);

    useEffect(() => {
        if (!from.trim() || !to.trim()) {
            setCalendarFares({});
            return;
        }

        let cancelled = false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastDate = new Date(today);
        lastDate.setDate(lastDate.getDate() + 30);

        const timer = setTimeout(async () => {
            try {
                const response = await api.get(
                    "/flights/calendar-fares",
                    {
                        params: {
                            source: from.trim(),
                            destination: to.trim(),
                            startDate: toLocalDateString(today),
                            endDate: toLocalDateString(lastDate)
                        }
                    }
                );

                if (!cancelled) {
                    setCalendarFares(response.data || {});
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Error fetching calendar fares:", error);
                    setCalendarFares({});
                }
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [from, to]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                datePickerRef.current &&
                !datePickerRef.current.contains(event.target)
            ) {
                setCalendarOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);

    const handleSearch = () => {

        if (!from || !to || !departureDate) {
            alert("Please enter source, destination and departure date");
            return;
        }

        navigate(
            `/flights?source=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&date=${departureDate}`
        );
    };


    useEffect(() => {

        if (skipSourceSearch.current) {
            skipSourceSearch.current = false;
            return;
        }

        if (from.trim().length < 1) {
            setSourceSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {

            try {
                const response = await api.get(
                    "/flights/suggestions/sources",
                    {
                        params: {
                            query: from
                        }
                    }
                );

                setSourceSuggestions(response.data);

            } catch (error) {
                console.error(
                    "Error fetching source suggestions:",
                    error
                );

                setSourceSuggestions([]);
            }

        }, 300);

        return () => clearTimeout(timer);

    }, [from]);

    useEffect(() => {

        if (skipDestinationSearch.current) {
            skipDestinationSearch.current = false;
            return;
        }

        if (!from || to.trim().length < 1) {
            setDestinationSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {

            try {
                const response = await api.get(
                    "/flights/suggestions/destinations",
                    {
                        params: {
                            source: from,
                            query: to
                        }
                    }
                );

                setDestinationSuggestions(response.data);

            } catch (error) {
                console.error(
                    "Error fetching destination suggestions:",
                    error
                );

                setDestinationSuggestions([]);
            }

        }, 300);

        return () => clearTimeout(timer);

    }, [from, to]);

    useEffect(() => {
        const handleResize = () => {
            setIsNarrowScreen(window.innerWidth <= 700);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);


    const handleQuickRoute = (destination) => {
        skipSourceSearch.current = true;
        skipDestinationSearch.current = true;

        setFrom("Bangalore");
        setTo(destination);
        setDepartureDate("");
        setSourceSuggestions([]);
        setDestinationSuggestions([]);
        setCalendarOpen(false);
    };

    return (
        <main className="home">
            <div className="home-content">

                {/* HERO SECTION */}
                <section className="home-hero-copy">
                    <span className="home-eyebrow">
                        <span aria-hidden="true">✈</span>
                        FLIGHT BOOKING MADE SIMPLE
                    </span>

                    <h1>
                        Your next journey
                        <br />
                        begins <span>here.</span>
                    </h1>

                    <p>
                        Explore destinations, compare sample fares
                        and find a flight for your next adventure.
                    </p>

                    <div className="home-feature-pills">
                        <span>✓ Fare calendar</span>
                        <span>✓ Seat selection</span>
                        <span>✓ Easy booking</span>
                    </div>
                </section>

                {/* SEARCH CARD */}
                <section className="home-search-panel">
                    <div className="home-search-heading">
                        <div>
                            <h2>Find your flight</h2>
                            <p>Choose your route and travel date.</p>
                        </div>
                        <span className="home-search-plane" aria-hidden="true">
                            ✈
                        </span>
                    </div>

                    <form
                        className="search-box"
                        onSubmit={(event) => {
                            event.preventDefault();
                            handleSearch();
                        }}
                    >
                        {/* SOURCE */}
                        <div className="search-field">
                            <label htmlFor="flight-from">From</label>
                            <input
                                id="flight-from"
                                type="text"
                                placeholder="Departure city"
                                autoComplete="off"
                                value={from}
                                onChange={(e) => {
                                    setFrom(e.target.value);
                                    setTo("");
                                    setDestinationSuggestions([]);
                                }}
                            />

                            {sourceSuggestions.length > 0 && (
                                <div className="suggestions" role="group"
                                    aria-label="Departure suggestions">
                                    {sourceSuggestions.map((city) => (
                                        <button
                                            key={city}
                                            type="button"
                                            className="suggestion-item"
                                            onClick={() => {
                                                skipSourceSearch.current = true;
                                                setFrom(city);
                                                setSourceSuggestions([]);
                                                setTo("");
                                                setDestinationSuggestions([]);
                                            }}
                                        >
                                            <span aria-hidden="true">📍</span>
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* DESTINATION */}
                        <div className="search-field">
                            <label htmlFor="flight-to">To</label>
                            <input
                                id="flight-to"
                                type="text"
                                placeholder="Destination city"
                                autoComplete="off"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                            />

                            {destinationSuggestions.length > 0 && (
                                <div className="suggestions" role="group"
                                    aria-label="Destination suggestions">
                                    {destinationSuggestions.map((city) => (
                                        <button
                                            key={city}
                                            type="button"
                                            className="suggestion-item"
                                            onClick={() => {
                                                skipDestinationSearch.current = true;
                                                setTo(city);
                                                setDestinationSuggestions([]);
                                            }}
                                        >
                                            <span aria-hidden="true">📍</span>
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* DEPARTURE DATE */}
                        <div
                            className="date-picker-field"
                            ref={datePickerRef}
                        >
                            <label htmlFor="departureDate">
                                Departure Date
                            </label>

                            <button
                                id="departureDate"
                                type="button"
                                className="date-picker-trigger"
                                onClick={() =>
                                    setCalendarOpen((open) => !open)
                                }
                                aria-haspopup="dialog"
                                aria-expanded={calendarOpen}
                            >
                                <span>
                                    {formatDisplayDate(departureDate)}
                                </span>
                                <span aria-hidden="true">▦</span>
                            </button>

                            {calendarOpen && (
                                <div
                                    className="calendar-popup"
                                    role="dialog"
                                    aria-label="Select departure date"
                                >
                                    <div className="calendar-popup-heading">
                                        <div>
                                            <strong>
                                                Select departure date
                                            </strong>
                                            <span>
                                                Choose your travel day
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            className="calendar-close"
                                            onClick={() => setCalendarOpen(false)}
                                            aria-label="Close calendar"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <Calendar
                                        value={parseLocalDate(departureDate)}
                                        onChange={(value) => {
                                            if (value instanceof Date) {
                                                setDepartureDate(
                                                    toLocalDateString(value)
                                                );
                                                setCalendarOpen(false);
                                            }
                                        }}
                                        minDate={minDate}
                                        maxDate={lastDate}
                                        showDoubleView={!isNarrowScreen}
                                        showNeighboringMonth={false}
                                        minDetail="month"
                                        maxDetail="month"
                                        calendarType="gregory"
                                        prev2Label={null}
                                        next2Label={null}
                                        tileContent={({ date, view }) => {
                                            if (view !== "month") return null;

                                            const fare = calendarFares[
                                                toLocalDateString(date)
                                            ];

                                            return fare != null ? (
                                                <span className="calendar-fare">
                                                    ₹{Number(fare).toLocaleString("en-IN")}
                                                </span>
                                            ) : null;
                                        }}
                                    />

                                    <div className="calendar-footer">
                                        <span>
                                            Lowest sample fare for this route
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDepartureDate("");
                                                setCalendarOpen(false);
                                            }}
                                        >
                                            Clear date
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button type="submit" className="home-search-button">
                            <span aria-hidden="true">⌕</span>
                            Search Flights
                            <span aria-hidden="true">→</span>
                        </button>
                    </form>

                    <div className="home-search-note">
                        <span aria-hidden="true">ⓘ</span>
                        Sample flight schedules and fares for demonstration.
                    </div>
                </section>

                {/* QUICK ROUTES */}
                <section className="home-quick-routes">
                    <div className="home-routes-heading">
                        <div>
                            <span className="home-section-label">
                                QUICK START
                            </span>
                            <h2>Explore popular routes</h2>
                        </div>
                        <span className="home-routes-hint">
                            Select a route to start
                        </span>
                    </div>

                    <div className="home-route-grid">
                        {[
                            { city: "Delhi", subtitle: "Bangalore to Delhi" },
                            { city: "Mumbai", subtitle: "Bangalore to Mumbai" },
                            { city: "Chennai", subtitle: "Bangalore to Chennai" }
                        ].map((route) => (
                            <button
                                key={route.city}
                                type="button"
                                className="home-route-card"
                                onClick={() => handleQuickRoute(route.city)}
                                aria-label={`Select ${route.subtitle}`}
                            >
                                <span className="home-route-icon" aria-hidden="true">
                                    ✈
                                </span>
                                <span className="home-route-text">
                                    <strong>{route.city}</strong>
                                    <small>{route.subtitle}</small>
                                </span>
                                <span className="home-route-arrow" aria-hidden="true">
                                    →
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

            </div>
        </main>
    );
}

export default Home;