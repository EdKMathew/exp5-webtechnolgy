import { useState } from "react";

// This component receives ONE event object as a prop, called "event"
function EventCard({ event }) {
  // seatsLeft is STATE - it belongs to this one card and can change over time
  const [seatsLeft, setSeatsLeft] = useState(event.seats);

  function handleRegister() {
    if (seatsLeft > 0) {
      setSeatsLeft(seatsLeft - 1);
    }
  }

  return (
    <div className="event-card">
      <h3>{event.name}</h3>
      <p>Category: {event.category}</p>
      <p>Fee: {event.fee === 0 ? "Free" : `Rs. ${event.fee}`}</p>
      <p>Seats left: {seatsLeft}</p>
      {seatsLeft === 0 ? (
        <button disabled>SOLD OUT</button>
      ) : (
        <button onClick={handleRegister}>Register</button>
      )}
    </div>
  );
}

export default EventCard;
