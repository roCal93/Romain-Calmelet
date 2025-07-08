import styles from './fallbackPortrait.module.scss'

const FallbackPortrait = ({ className }) => (
  <div className={`${styles.fallbackPortrait} ${className || ''}`}>
    <svg viewBox="0 0 200 200" className={styles.avatarSvg}>
      {/* Fond circulaire avec dégradé */}
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0e0e0" />
          <stop offset="100%" stopColor="#bdbdbd" />
        </linearGradient>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#757575" />
          <stop offset="100%" stopColor="#424242" />
        </linearGradient>
      </defs>

      {/* Cercle de fond */}
      <circle cx="100" cy="100" r="95" fill="url(#bgGradient)" />

      {/* Icône utilisateur stylisée */}
      <g transform="translate(100, 100)">
        {/* Tête */}
        <circle cx="0" cy="-15" r="25" fill="#f5f5f5" opacity="0.9" />
        {/* Corps */}
        <path
          d="M -35 40 Q -35 20 -20 10 Q -10 5 0 5 Q 10 5 20 10 Q 35 20 35 40"
          fill="#f5f5f5"
          opacity="0.9"
        />
      </g>

      {/* Initiales */}
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

    {/* Animation de chargement optionnelle */}
    <div className={styles.loadingRing}></div>
  </div>
)

export default FallbackPortrait
