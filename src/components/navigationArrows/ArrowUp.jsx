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

const ArrowUp = ({ className = '', ...props }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isNavigating, setIsNavigating] = useState(false)

  // Find current section index based on current path
  const currentIndex = SECTIONS.findIndex(
    (section) => section.path === location.pathname
  )

  // Check if navigation to previous section is possible
  const canGoUp = currentIndex > 0

  // Handle navigation to previous section
  const handleClick = () => {
    // Prevent navigation if already navigating or at first section
    if (isNavigating || !canGoUp) return

    // Set navigating state to prevent multiple clicks
    setIsNavigating(true)

    // Navigate to previous section
    navigate(SECTIONS[currentIndex - 1].path)

    // Reset navigation state after animation duration
    setTimeout(() => {
      setIsNavigating(false)
    }, 800)
  }

  return (
    <button
      className={`${styles.arrow} ${styles.up} ${
        !canGoUp ? styles.disabled : ''
      } ${isNavigating ? styles.navigating : ''} ${className}`}
      onClick={handleClick}
      disabled={!canGoUp || isNavigating}
      aria-label="Previous page"
      {...props}
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M7 14L12 9L17 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export default ArrowUp
