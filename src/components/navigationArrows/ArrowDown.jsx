// components/ArrowDown.jsx
import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import styles from './navigationArrows.module.scss'

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

  const currentIndex = SECTIONS.findIndex(
    (section) => section.path === location.pathname
  )
  const canGoDown = currentIndex < SECTIONS.length - 1

  const handleClick = () => {
    if (isNavigating || !canGoDown) return

    setIsNavigating(true)
    navigate(SECTIONS[currentIndex + 1].path)

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
      aria-label="Page suivante"
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
