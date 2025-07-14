import { useEffect, useRef, useState, useCallback } from 'react'
import styles from './menuMobile.module.scss'
import { useNavigate } from 'react-router'

// Constantes pour la navigation
const NAVIGATION_ITEMS = [
  { path: '/presentation', label: 'PRESENTATION' },
  { path: '/portfolio', label: 'PORTFOLIO' },
  { path: '/contact', label: 'CONTACT' },
]

const MenuMobile = ({ onMenuStateChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const navigate = useNavigate()
  const isNavigatingRef = useRef(false)

  const toggleMenu = useCallback(() => {
    setIsOpen((prevState) => {
      const newState = !prevState
      onMenuStateChange?.(newState)
      return newState
    })
  }, [onMenuStateChange])

  const closeMenu = useCallback(() => {
    setIsOpen(false)
    onMenuStateChange?.(false)
  }, [onMenuStateChange])

  const handleLinkClick = useCallback(
    (path) => {
      try {
        isNavigatingRef.current = true
        navigate(path)

        // Utiliser requestAnimationFrame pour une meilleure performance
        requestAnimationFrame(() => {
          closeMenu()
          isNavigatingRef.current = false
        })
      } catch (error) {
        console.error('Navigation error:', error)
        isNavigatingRef.current = false
      }
    },
    [navigate, closeMenu]
  )

  // Gestion du focus lors de l'ouverture/fermeture
  useEffect(() => {
    if (isOpen) {
      // Focus sur le premier lien du menu après l'animation
      const timeoutId = setTimeout(() => {
        const firstLink = menuRef.current?.querySelector(
          'button[role="menuitem"]'
        )
        firstLink?.focus()
      }, 100)
      return () => clearTimeout(timeoutId)
    } else {
      // Retour du focus sur le bouton burger si le menu était ouvert
      if (document.activeElement?.closest(`.${styles.menuPanel}`)) {
        buttonRef.current?.focus()
      }
    }
  }, [isOpen])

  // Gestion des événements clavier et clics externes
  // Gestion des événements clavier et clics externes
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event) => {
      const focusableElements = menuRef.current?.querySelectorAll(
        'button[role="menuitem"]'
      )
      const firstElement = focusableElements?.[0]
      const lastElement = focusableElements?.[focusableElements.length - 1]

      switch (event.key) {
        case 'Escape': {
          event.preventDefault()
          closeMenu()
          buttonRef.current?.focus()
          break
        }
        case 'Tab': {
          // Trap focus dans le menu
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault()
            lastElement?.focus()
          } else if (
            !event.shiftKey &&
            document.activeElement === lastElement
          ) {
            event.preventDefault()
            firstElement?.focus()
          }
          break
        }
        case 'ArrowDown': {
          event.preventDefault()
          const currentIndex = Array.from(focusableElements).indexOf(
            document.activeElement
          )
          const nextElement =
            focusableElements[currentIndex + 1] || firstElement
          nextElement?.focus()
          break
        }
        case 'ArrowUp': {
          event.preventDefault()
          const currIndex = Array.from(focusableElements).indexOf(
            document.activeElement
          )
          const prevElement = focusableElements[currIndex - 1] || lastElement
          prevElement?.focus()
          break
        }
        default:
          break
      }
    }

    const handleClickOutside = (event) => {
      if (isNavigatingRef.current) return

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        closeMenu()
      }
    }

    // Délai pour éviter que le clic d'ouverture ferme immédiatement
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, closeMenu])

  return (
    <div className={styles.burgerMenu}>
      <button
        ref={buttonRef}
        className={`${styles.burgerButton} ${isOpen ? styles.open : ''}`}
        onClick={toggleMenu}
        type="button"
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-haspopup="true"
      >
        <span className={styles.bar} aria-hidden="true"></span>
        <span className={styles.bar} aria-hidden="true"></span>
        <span className={styles.bar} aria-hidden="true"></span>
      </button>

      <nav
        ref={menuRef}
        id="mobile-menu"
        className={`${styles.menuPanel} ${isOpen ? styles.open : ''}`}
        role="navigation"
        aria-label="Menu principal"
      >
        <ul role="menu">
          {NAVIGATION_ITEMS.map((item) => (
            <li key={item.path} role="none">
              <button
                className={styles.link}
                onClick={() => handleLinkClick(item.path)}
                type="button"
                role="menuitem"
                aria-label={`Aller à ${item.label.toLowerCase()}`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Backdrop pour mobile */}
      {isOpen && (
        <div
          className={styles.backdrop}
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export default MenuMobile
