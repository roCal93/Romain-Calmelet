import { useState, useEffect, useMemo } from 'react'
import styles from './alternatingContactLogo.module.scss'

function AlternatingContactLogo({ position, onClick, isMobile }) {
  const [isPhoneIcon, setIsPhoneIcon] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPhoneIcon((prev) => !prev)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Memorize common SVG props to avoid recreation on each render
  const commonProps = useMemo(
    () => ({
      width: isMobile ? '30' : '40',
      height: isMobile ? '30' : '40',
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      'aria-hidden': 'true',
    }),
    [isMobile]
  )

  // Conditional styling: use position if provided
  const logoStyle = position
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
      }
    : undefined

  return (
    <div
      className={styles.contactLogo}
      style={logoStyle}
      onClick={onClick}
      role="button"
      tabIndex="0"
      aria-label="Afficher les informations de contact"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick()
        }
      }}
    >
      {/* Icon container with 3D flip animation */}
      <div
        className={`${styles.iconContainer} ${
          isPhoneIcon ? styles.phone : styles.email
        }`}
        style={{
          width: isMobile ? '30px' : '40px',
          height: isMobile ? '30px' : '40px',
        }}
      >
        {/* Front face - Phone icon */}
        <div className={styles.iconFace}>
          <svg {...commonProps}>
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
        </div>

        {/* Back face - Email icon */}
        <div className={`${styles.iconFace} ${styles.iconBack}`}>
          <svg {...commonProps}>
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default AlternatingContactLogo
