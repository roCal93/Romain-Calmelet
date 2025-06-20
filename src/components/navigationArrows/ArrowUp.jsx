// components/ArrowUp.jsx
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import styles from './navigationArrows.module.scss'

const SECTIONS = [
  { path: '/Romain-Calmelet/', id: 'home' },
  { path: '/Romain-Calmelet/presentation', id: 'presentation' },
  { path: '/Romain-Calmelet/portfolio', id: 'portfolio' },
  { path: '/Romain-Calmelet/contact', id: 'contact' },
]

const ArrowUp = ({ className = '', ...props }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isNavigating, setIsNavigating] = useState(false)

  const currentIndex = SECTIONS.findIndex(
    (section) => section.path === location.pathname
  )
  const canGoUp = currentIndex > 0

  const handleClick = () => {
    if (isNavigating || !canGoUp) return

    setIsNavigating(true)
    navigate(SECTIONS[currentIndex - 1].path)

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
      aria-label="Page précédente"
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
