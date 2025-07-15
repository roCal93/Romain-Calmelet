import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import styles from './menuMobile.module.scss'
import { useNavigate } from 'react-router'

// Navigation items configuration
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

  // Toggle menu state with callback
  const toggleMenu = useCallback(() => {
    setIsOpen((prevState) => {
      const newState = !prevState
      onMenuStateChange?.(newState)
      return newState
    })
  }, [onMenuStateChange])

  // Close menu handler
  const closeMenu = useCallback(() => {
    setIsOpen(false)
    onMenuStateChange?.(false)
  }, [onMenuStateChange])

  // Handle navigation link clicks
  const handleLinkClick = useCallback(
    (path) => {
      try {
        isNavigatingRef.current = true
        navigate(path)

        // Use requestAnimationFrame for better performance
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

  // Memoized navigation items to prevent unnecessary re-renders
  const navigationItems = useMemo(
    () =>
      NAVIGATION_ITEMS.map((item) => (
        <li key={item.path} role="none">
          <button
            className={styles.link}
            onClick={() => handleLinkClick(item.path)}
            type="button"
            role="menuitem"
            aria-label={`Navigate to ${item.label.toLowerCase()}`}
          >
            {item.label}
          </button>
        </li>
      )),
    [handleLinkClick]
  )

  // Focus management when menu opens/closes
  useEffect(() => {
    if (isOpen) {
      // Focus first menu item after animation
      const timeoutId = setTimeout(() => {
        const firstLink = menuRef.current?.querySelector(
          'button[role="menuitem"]'
        )
        firstLink?.focus()
      }, 100)
      return () => clearTimeout(timeoutId)
    } else {
      // Return focus to burger button if menu was previously open
      if (document.activeElement?.closest(`.${styles.menuPanel}`)) {
        buttonRef.current?.focus()
      }
    }
  }, [isOpen])

  // Keyboard navigation and click outside handling
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event) => {
      // ISOLATION : Vérifier si l'événement provient du menu mobile
      const isInsideMenu =
        menuRef.current?.contains(event.target) ||
        buttonRef.current?.contains(event.target)

      if (!isInsideMenu) {
        return // Ignorer les événements clavier externes
      }

      const focusableElements = menuRef.current?.querySelectorAll(
        'button[role="menuitem"]'
      )
      const firstElement = focusableElements?.[0]
      const lastElement = focusableElements?.[focusableElements.length - 1]

      switch (event.key) {
        case 'Escape': {
          event.preventDefault()
          event.stopPropagation() // Empêcher la propagation
          closeMenu()
          buttonRef.current?.focus()
          break
        }
        case 'Tab': {
          // Focus trap within menu
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault()
            event.stopPropagation()
            lastElement?.focus()
          } else if (
            !event.shiftKey &&
            document.activeElement === lastElement
          ) {
            event.preventDefault()
            event.stopPropagation()
            firstElement?.focus()
          }
          break
        }
        case 'ArrowDown': {
          event.preventDefault()
          event.stopPropagation()
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
          event.stopPropagation()
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
      // Prevent closing during navigation
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

    // Utiliser capture: true pour intercepter les événements plus tôt
    document.addEventListener('keydown', handleKeyDown, true)

    // Delay to prevent immediate close on open click
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [isOpen, closeMenu])

  // Effet pour désactiver la navigation clavier globale quand le menu est ouvert
  useEffect(() => {
    if (isOpen) {
      // Désactiver la navigation clavier globale
      const handleGlobalKeyDown = (event) => {
        // Vérifier si l'événement provient du menu mobile
        const isInsideMenu =
          menuRef.current?.contains(event.target) ||
          buttonRef.current?.contains(event.target)

        if (!isInsideMenu) {
          // Bloquer les touches de navigation globales
          if (
            ['ArrowDown', 'ArrowUp', 'Tab', 'Enter', ' '].includes(event.key)
          ) {
            event.preventDefault()
            event.stopPropagation()
          }
        }
      }

      // Ajouter l'écouteur avec capture pour intercepter plus tôt
      document.addEventListener('keydown', handleGlobalKeyDown, true)

      return () => {
        document.removeEventListener('keydown', handleGlobalKeyDown, true)
      }
    }
  }, [isOpen])

  return (
    <div className={styles.burgerMenu}>
      {/* Burger button */}
      <button
        ref={buttonRef}
        className={`${styles.burgerButton} ${isOpen ? styles.open : ''}`}
        onClick={toggleMenu}
        type="button"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-haspopup="true"
      >
        <span className={styles.bar} aria-hidden="true"></span>
        <span className={styles.bar} aria-hidden="true"></span>
        <span className={styles.bar} aria-hidden="true"></span>
      </button>

      {/* Navigation menu */}
      <nav
        ref={menuRef}
        id="mobile-menu"
        className={`${styles.menuPanel} ${isOpen ? styles.open : ''}`}
        role="navigation"
        aria-label="Main navigation"
        // Attributs pour améliorer l'isolation
        tabIndex={-1}
        onKeyDown={(e) => {
          // Empêcher la propagation des événements clavier
          e.stopPropagation()
        }}
      >
        <ul role="menu">{navigationItems}</ul>
      </nav>

      {/* Backdrop for mobile */}
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
