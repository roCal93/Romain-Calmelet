import { useEffect, useRef, useState } from 'react'
import styles from './menuMobile.module.scss'
import { Link } from 'react-router'

const MenuMobile = () => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  const toggleMenu = () => setIsOpen(!isOpen)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (isOpen && event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div className={styles.burgerMenu}>
      <button
        ref={buttonRef}
        className={`${styles.burgerButton} ${isOpen ? styles.open : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
      </button>

      <nav
        ref={menuRef}
        className={`${styles.menuPanel} ${isOpen ? styles.open : ''}`}
      >
        <ul>
          <li>
            <Link className={styles.link}>PRESENTATION</Link>
          </li>
          <li>
            <Link className={styles.link}>COMPETENCES</Link>
          </li>
          <li>
            <Link className={styles.link}>FORMATION</Link>
          </li>
          <li>
            <Link className={styles.link}>PORTFOLIO</Link>
          </li>
          <li>
            <Link className={styles.link}>CONTACT</Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default MenuMobile
