import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import styles from './navigationArrows.module.scss'

// Navigation sections configuration
const SECTIONS = [
  { path: '/', id: 'home' },
  { path: '/presentation', id: 'presentation' },
  { path: '/portfolio', id: 'portfolio' },
  { path: '/contact', id: 'contact' },
]

const ArrowDown = ({ className = '', ...props }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isNavigating, setIsNavigating] = useState(false)

  // Find current section index based on current path
  const currentIndex = SECTIONS.findIndex(
    (section) => section.path === location.pathname
  )

  // Check if navigation to next section is possible
  const canGoDown = currentIndex < SECTIONS.length - 1

  // Handle navigation to next section
  const handleClick = () => {
    // Prevent navigation if already navigating or at last section
    if (isNavigating || !canGoDown) return

    // Set navigating state to prevent multiple clicks
    setIsNavigating(true)

    // Navigate to next section
    navigate(SECTIONS[currentIndex + 1].path)

    // Reset navigation state after animation duration
    setTimeout(() => {
      setIsNavigating(false)
    }, 800)
  }

  return (
    <button
      className={`${styles.arrow} ${styles.down} ${
        !canGoDown ? styles.disabled : ''
      } ${isNavigating ? styles.navigating : ''} ${className}`}
      onClick={handleClick}
      disabled={!canGoDown || isNavigating}
      aria-label="Next page"
      {...props}
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M7 10L12 15L17 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export default ArrowDown
