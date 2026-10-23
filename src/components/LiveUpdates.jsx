export default function LiveUpdates({ activity, simulated }) {
  return (
    <section className="updates-panel" aria-labelledby="activity-heading">
      <div className="updates-heading">
        <h2 id="activity-heading">Match activity</h2>
        <span className="activity-badge">{simulated ? 'DEMO' : 'LOCAL'}</span>
      </div>
      <ul id="match-activity" aria-live="polite">
        {activity.length > 0
          ? activity.map((event) => <li key={event.id}>{event.text}</li>)
          : <li>No moves yet.</li>}
      </ul>
    </section>
  );
}