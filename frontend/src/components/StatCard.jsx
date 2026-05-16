/**
 * StatCard.jsx - Statistics Card Component
 * ==========================================
 * Reusable card for displaying a single metric on the dashboard.
 * Shows an icon, value, and label.
 */

function StatCard({ icon, value, label, color, bgColor }) {
  return (
    <div className="stat-card fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="stat-label">{label}</p>
          <p className="stat-value mt-1">{value}</p>
        </div>
        <div
          className="stat-icon"
          style={{ background: bgColor, color: color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
