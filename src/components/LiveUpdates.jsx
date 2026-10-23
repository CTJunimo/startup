export default function LiveUpdates({ activity, sharedActivity = [], label }) {
  return (
    <section className="updates-panel" aria-labelledby="activity-heading">
      <div className="updates-heading">
        <h2 id="activity-heading">Match activity</h2>
        <span className="activity-badge">{label}</span>
      </div>
      <h3 className="activity-subheading">This match</h3>
      <ul id="match-activity" aria-live="polite">
        {activity.length > 0
          ? activity.map((event) => <li key={event.id}>{event.text}</li>)
          : <li>No moves yet.</li>}
      </ul>
      {(label === 'LIVE' || sharedActivity.length > 0) && (
        <div className="shared-activity">
          <h3 className="activity-subheading">Signed-in players</h3>
          <ul id="shared-match-activity" aria-live="polite">
            {sharedActivity.length > 0
              ? sharedActivity.map((event) => <li key={event.id}>{event.text}</li>)
              : <li>No player match updates yet.</li>}
          </ul>
        </div>
      )}
    </section>
  );
}