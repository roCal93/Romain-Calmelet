import { useEffect, useState, useContext } from 'react'
import { NavigationContext } from '../../app/navigationContext'
import styles from './contact.module.scss'
import ArrowUp from '../../components/navigationArrows/ArrowUp'
import ContactGame from '../../components/contactGame/ContactGame'

function Contact() {
  const [isVisible, setIsVisible] = useState(false)
  const { direction } = useContext(NavigationContext)

  /**
   * Animation d'entrée de page
   */
  useEffect(() => {
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [])

  // ==================== RENDU ====================

  return (
    <div
      className={`page-container ${
        isVisible
          ? direction === 'down'
            ? 'page-enter-down'
            : 'page-enter-up'
          : ''
      }`}
    >
      <div className={styles.container}>
        <ArrowUp />
        <ContactGame />
      </div>
    </div>
  )
}

export default Contact
