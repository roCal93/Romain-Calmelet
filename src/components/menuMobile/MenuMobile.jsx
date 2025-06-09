import { useEffect, useRef, useState } from 'react'
import styles from './menuMobile.module.scss'
import { Link, useNavigate } from 'react-router'

const MenuMobile = ({ onMenuStateChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const navigate = useNavigate()
  const isNavigatingRef = useRef(false)

  const toggleMenu = () => {
    const newState = !isOpen
    console.log('Toggle menu:', newState)
    setIsOpen(newState)
    // Informe le parent de l'état du menu
    if (onMenuStateChange) {
      onMenuStateChange(newState)
    }
  }

  const handleLinkClick = (path) => {
    console.log('Link clicked:', path)

    // Marquer qu'on est en train de naviguer
    isNavigatingRef.current = true

    // Navigation d'abord
    navigate(path)
    console.log('Navigation called')

    // Fermeture du menu après navigation
    setTimeout(() => {
      console.log('Closing menu')
      setIsOpen(false)
      isNavigatingRef.current = false
      // Informe le parent que le menu est fermé
      if (onMenuStateChange) {
        onMenuStateChange(false)
      }
    }, 100)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ne pas fermer le menu si on est en train de naviguer
      if (isNavigatingRef.current) return

      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        console.log('Click outside detected')
        setIsOpen(false)
        // Informe le parent que le menu est fermé
        if (onMenuStateChange) {
          onMenuStateChange(false)
        }
      }
    }

    const handleKeyDown = (event) => {
      if (isOpen && event.key === 'Escape') {
        console.log('Escape key pressed')
        setIsOpen(false)
        // Informe le parent que le menu est fermé
        if (onMenuStateChange) {
          onMenuStateChange(false)
        }
      }
    }

    // Seulement ajouter les listeners si le menu est ouvert
    if (isOpen) {
      // Délai pour éviter que le clic qui ouvre le menu déclenche immédiatement la fermeture
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleKeyDown)
      }, 100)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, onMenuStateChange])

  return (
    <div className={styles.burgerMenu}>
      <button
        ref={buttonRef}
        className={`${styles.burgerButton} ${isOpen ? styles.open : ''}`}
        onClick={toggleMenu}
        type="button"
        aria-label="Toggle menu"
      >
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
      </button>

      <div
        ref={menuRef}
        className={`${styles.menuPanel} ${isOpen ? styles.open : ''}`}
      >
        <ul>
          <li>
            <button
              className={styles.link}
              onClick={() => handleLinkClick('/Romain-Calmelet/presentation')}
              type="button"
            >
              PRESENTATION
            </button>
          </li>

          <li>
            <button
              className={styles.link}
              onClick={() => handleLinkClick('/Romain-Calmelet/portfolio')}
              type="button"
            >
              PORTFOLIO
            </button>
          </li>

          <li>
            <button
              className={styles.link}
              onClick={() => handleLinkClick('/Romain-Calmelet/contact')}
              type="button"
            >
              CONTACT
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default MenuMobile
