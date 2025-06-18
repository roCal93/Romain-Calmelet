import { useEffect, useState, useContext } from 'react'
import { NavigationContext } from '../../app/navigationContext'
import styles from './contact.module.scss'

function Contact() {
  const [isVisible, setIsVisible] = useState(false)
  const { direction } = useContext(NavigationContext)

  useEffect(() => {
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [])

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
      {' '}
      <div className={styles.container}>
        <h1>Contact</h1>
        <p>Contenu de votre page de contact</p>
        <p>
          Utilisez la molette de la souris ou les flèches du clavier pour
          naviguer
        </p>
      </div>
    </div>
  )
}

export default Contact
