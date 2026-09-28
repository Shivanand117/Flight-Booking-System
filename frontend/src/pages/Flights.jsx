
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";


function formatDate(value) {
    if (!value) return "—";

    const [year, month, day] = value.split("-").map(Number);

    if (!year || !month || !day) return value;

    return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function formatTime(value) {
    if (!value) return "—";

    const [hours, minutes] = value.split(":").map(Number);

    if (
        !Number.isInteger(hours) ||
        !Number.isInteger(minutes) ||
        hours > 23 ||
        minutes > 59
    ) {
        return value;
    }

    return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }
    );
}

function getFlightDateTime(value) {
    if (!value || !value.includes("T")) {
        return { date: "—", time: "—" };
    }

    const [date, time] = value.split("T");

    return {
        date: formatDate(date),
        time: formatTime(time)
    };
}

function formatPrice(price) {
    const amount = Number(price);

    if (!Number.isFinite(amount)) return "—";

    return `₹${amount.toLocaleString("en-IN", {
        maximumFractionDigits: 2
    })}`;
}

function Flights() {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sortBy, setSortBy] = useState("recommended");
    const [selectedAirline, setSelectedAirline] = useState("all");
    const [maxPrice, setMaxPrice] = useState("");

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const source = searchParams.get("source");
    const destination = searchParams.get("destination");
    const date = searchParams.get("date");

    const hasSearch = Boolean(
        source?.trim() &&
        destination?.trim() &&
        date
    );


    const airlines = [
        ...new Set(flights.map((flight) => flight.airline).filter(Boolean))
    ].sort((a, b) => a.localeCompare(b));

    const filteredFlights = [...flights]
        .filter(
            (flight) =>
                selectedAirline === "all" ||
                flight.airline === selectedAirline
        )
        .filter(
            (flight) =>
                maxPrice === "" ||
                (Number.isFinite(Number(flight.price)) &&
                    Number(flight.price) <= Number(maxPrice))
        )
        .sort((a, b) => {
            if (sortBy === "price-low") {
                return Number(a.price) - Number(b.price);
            }

            if (sortBy === "price-high") {
                return Number(b.price) - Number(a.price);
            }

            if (sortBy === "departure") {
                const timeA = Date.parse(a.departureDateTime);
                const timeB = Date.parse(b.departureDateTime);

                const validA = Number.isFinite(timeA) ? timeA : Infinity;
                const validB = Number.isFinite(timeB) ? timeB : Infinity;

                return validA - validB;
            }

            return 0;
        });

    const clearFilters = () => {
        setSortBy("recommended");
        setSelectedAirline("all");
        setMaxPrice("");
    };

    useEffect(() => {
        let cancelled = false;

        const fetchFlights = async () => {
            if (!hasSearch) {
                setFlights([]);
                setError("");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                setSortBy("recommended");
                setSelectedAirline("all");
                setMaxPrice("");

                const response = await api.get("/flights/search", {
                    params: {
                        source,
                        destination,
                        date
                    }
                });

                if (!cancelled) {
                    setFlights(
                        Array.isArray(response.data)
                            ? response.data
                            : []
                    );
                }
            } catch (err) {
                console.error("Error fetching flights:", err);

                if (!cancelled) {
                    setFlights([]);
                    setError(
                        err.response?.data?.message ||
                        "Unable to load flights. Please try again."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchFlights();

        return () => {
            cancelled = true;
        };
    }, [source, destination, date, hasSearch]);

    return (
        <main className="flights-page">
            <div className="flights-shell">

                <header className="flights-header">
                    <span className="flights-eyebrow">
                        ✈ &nbsp; YOUR JOURNEY STARTS HERE
                    </span>

                    <h1>Explore Available Flights</h1>

                    <p>
                        Find your flight, choose your seat and get ready
                        for your next journey.
                    </p>
                </header>

                {loading ? (
                    <section className="flight-loading" aria-live="polite">
                        <div className="loading-spinner"></div>
                        <h2>Finding available flights</h2>
                        <p>Please wait while we search for flights.</p>

                        <div className="flight-skeleton">
                            <div className="skeleton-line"></div>
                            <div className="skeleton-line short"></div>
                            <div className="skeleton-line"></div>
                        </div>
                    </section>
                ) : !hasSearch ? (
                    <section className="flights-empty-state">
                        <div className="flights-empty-icon">✈</div>

                        <span className="flights-kicker">
                            READY FOR TAKEOFF?
                        </span>

                        <h2>Where would you like to go?</h2>

                        <p>
                            Choose your departure city, destination and
                            travel date to discover available flights.
                        </p>

                        <button
                            type="button"
                            className="flights-primary-button"
                            onClick={() => navigate("/")}
                        >
                            Start a Flight Search <span>→</span>
                        </button>
                    </section>
                ) : (
                    <>
                        <section className="flight-search-overview">
                            <div className="flight-search-route">
                                <div className="flight-search-location">
                                    <span>FROM</span>
                                    <strong>{source}</strong>
                                </div>

                                <div className="flight-search-arrow">
                                    <span>✈</span>
                                </div>

                                <div className="flight-search-location">
                                    <span>TO</span>
                                    <strong>{destination}</strong>
                                </div>
                            </div>

                            <div className="flight-search-date">
                                <span>TRAVEL DATE</span>
                                <strong>{formatDate(date)}</strong>
                            </div>

                            <button
                                type="button"
                                className="flights-secondary-button"
                                onClick={() => navigate("/")}
                            >
                                ✎ &nbsp; Change Search
                            </button>
                        </section>

                        {error ? (
                            <section
                                className="flights-empty-state flights-error-state"
                                role="alert"
                            >
                                <div className="flights-empty-icon">!</div>
                                <h2>Unable to load flights</h2>
                                <p>{error}</p>

                                <button
                                    type="button"
                                    className="flights-primary-button"
                                    onClick={() => window.location.reload()}
                                >
                                    Try Again
                                </button>
                            </section>
                        ) : flights.length === 0 ? (
                            <section className="flights-empty-state">
                                <div className="flights-empty-icon">⌕</div>
                                <h2>No flights found</h2>
                                <p>
                                    We couldn't find flights for this route
                                    and date. Try a different travel date
                                    or route.
                                </p>

                                <button
                                    type="button"
                                    className="flights-primary-button"
                                    onClick={() => navigate("/")}
                                >
                                    Change Search <span>→</span>
                                </button>
                            </section>
                        ) : (
                            <section className="flight-results" aria-live="polite">
                                <div className="flight-results-heading">
                                    <div>
                                        <h2>Available Flights</h2>
                                        <p>
                                            Choose a flight that suits
                                            your journey.
                                        </p>
                                    </div>
                                    <span className="flight-count">
                                        Showing {filteredFlights.length} of {flights.length} flights
                                    </span>
                                </div>


                                <div className="flight-filter-bar">
                                    <div className="flight-filter-control">
                                        <label htmlFor="flight-sort">Sort flights</label>
                                        <select
                                            id="flight-sort"
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                        >
                                            <option value="recommended">Recommended</option>
                                            <option value="price-low">Price: Low to High</option>
                                            <option value="price-high">Price: High to Low</option>
                                            <option value="departure">Earliest Departure</option>
                                        </select>
                                    </div>

                                    <div className="flight-filter-control">
                                        <label htmlFor="flight-airline">Airline</label>
                                        <select
                                            id="flight-airline"
                                            value={selectedAirline}
                                            onChange={(e) => setSelectedAirline(e.target.value)}
                                        >
                                            <option value="all">All Airlines</option>
                                            {airlines.map((airline) => (
                                                <option key={airline} value={airline}>
                                                    {airline}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flight-filter-control">
                                        <label htmlFor="flight-max-price">Maximum fare (₹)</label>
                                        <input
                                            id="flight-max-price"
                                            type="number"
                                            min="0"
                                            placeholder="Any price"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        className="flight-filter-reset"
                                        onClick={clearFilters}
                                    >
                                        Reset filters
                                    </button>
                                </div>


                                {filteredFlights.length === 0 ? (
                                    <div className="flight-filter-empty">
                                        <h3>No matching flights</h3>
                                        <p>
                                            Try changing your airline or maximum fare filters.
                                        </p>
                                        <button
                                            type="button"
                                            className="flights-secondary-button"
                                            onClick={clearFilters}
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flight-results-list">
                                        {filteredFlights.map((flight) => {
                                            const departure = getFlightDateTime(
                                                flight.departureDateTime
                                            );

                                            const arrival = getFlightDateTime(
                                                flight.arrivalDateTime
                                            );

                                            return (
                                                <article
                                                    className="flight-result-card"
                                                    key={flight.id}
                                                >
                                                    <div className="flight-card-top">
                                                        <div className="flight-airline">
                                                            <div className="airline-icon">✈</div>
                                                            <div>
                                                                <h3>{flight.airline || "Airline"}</h3>
                                                                <span>Flight #{flight.id}</span>
                                                            </div>
                                                        </div>
                                                        <span className="flight-option-tag">
                                                            FLIGHT OPTION
                                                        </span>
                                                    </div>

                                                    <div className="flight-card-route">
                                                        <div className="flight-time-block">
                                                            <strong>{departure.time}</strong>
                                                            <span>{flight.source}</span>
                                                            <small>{departure.date}</small>
                                                        </div>

                                                        <div className="flight-route-line">
                                                            <span>DEPARTURE</span>
                                                            <div className="flight-line">
                                                                <i></i>
                                                                <span>✈</span>
                                                                <i></i>
                                                            </div>
                                                            <span>ARRIVAL</span>
                                                        </div>

                                                        <div className="flight-time-block flight-arrival">
                                                            <strong>{arrival.time}</strong>
                                                            <span>{flight.destination}</span>
                                                            <small>{arrival.date}</small>
                                                        </div>
                                                    </div>

                                                    <div className="flight-card-bottom">
                                                        <div className="flight-price">
                                                            <span>Price per passenger</span>
                                                            <strong>{formatPrice(flight.price)}</strong>
                                                        </div>

                                                        <div className="flight-seats">
                                                            <span>Seat capacity</span>
                                                            <strong>{flight.totalSeats ?? "—"}</strong>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            className="flights-primary-button flight-book-button"
                                                            onClick={() =>
                                                                navigate(`/booking/${flight.id}`)
                                                            }
                                                        >
                                                            Book Now <span>→</span>
                                                        </button>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}

export default Flights;