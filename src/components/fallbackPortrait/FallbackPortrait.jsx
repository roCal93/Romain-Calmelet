import styles from './fallbackPortrait.module.scss'

/**
 * FallbackPortrait Component
 * Displays a placeholder avatar with user icon and initials
 * Used when no profile picture is available
 *
 * @param {string} className - Additional CSS classes to apply
 */
const FallbackPortrait = ({ className }) => (
  <div className={`${styles.fallbackPortrait} ${className || ''}`}>
    <svg viewBox="0 0 200 200" className={styles.avatarSvg}>
      {/* SVG gradient definitions */}
      <defs>
        {/* Background gradient - light to dark gray */}
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0e0e0" />
          <stop offset="100%" stopColor="#bdbdbd" />
        </linearGradient>
        {/* Text gradient - medium to dark gray */}
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#757575" />
          <stop offset="100%" stopColor="#424242" />
        </linearGradient>
      </defs>

      {/* Background circle with gradient fill */}
      <circle cx="100" cy="100" r="95" fill="url(#bgGradient)" />

      {/* User icon silhouette */}
      <g transform="translate(100, 100)">
        {/* Head - positioned above center */}
        <circle cx="0" cy="-15" r="25" fill="#f5f5f5" opacity="0.9" />
        {/* Body/shoulders - curved path for natural look */}
        <path
          d="M -35 40 Q -35 20 -20 10 Q -10 5 0 5 Q 10 5 20 10 Q 35 20 35 40"
          fill="#f5f5f5"
          opacity="0.9"
        />
      </g>

      {/* User initials at the bottom */}
      <text
        x="100"
        y="170"
        textAnchor="middle"
        className={styles.initials}
        fill="url(#textGradient)"
      >
        RC
      </text>
    </svg>
  </div>
)

export default FallbackPortrait
