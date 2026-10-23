import { useEffect, useState } from 'react';

const activities = [
  'Riley just started a match with Nova.',
  'A player won a close game against Milo.',
  'Jordan and Casey finished with a draw.',
  'A new player joined the practice room.',
];

export default function LiveUpdates() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let nextActivity = 0;
    const timer = window.setInterval(() => {
      const message = {
        id: `${Date.now()}-${nextActivity}`,
        text: activities[nextActivity % activities.length],
      };
      nextActivity += 1;
      setMessages((currentMessages) => [message, ...currentMessages].slice(0, 3));
    }, 12000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="updates-panel" aria-labelledby="updates-heading">
      <div className="updates-heading">
        <h2 id="updates-heading">Live updates</h2>
        <span className="live-indicator">LIVE</span>
      </div>
      <ul id="live-updates" aria-live="polite">
        {messages.length > 0
          ? messages.map((message) => <li key={message.id}>{message.text}</li>)
          : <li>Waiting for nearby players.</li>}
      </ul>
    </section>
  );
}