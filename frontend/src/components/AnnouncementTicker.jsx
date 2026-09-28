
function AnnouncementTicker() {
    const message =
        "DEMO PROJECT  ✦  Flight schedules and fares are sample data  ✦  Payments and refunds are simulated  ✦  No real tickets are issued";

    return (
        <div className="announcement-bar" role="note">
            <span className="announcement-sr-only">
                {message}
            </span>

            <div className="announcement-track" aria-hidden="true">
                <span>{message}</span>
                <span>{message}</span>
            </div>
        </div>
    );
}

export default AnnouncementTicker;