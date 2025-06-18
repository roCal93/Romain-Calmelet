import { useEffect, useState } from 'react'
import styles from './presentation.module.scss'

function Presentation() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animation d'entrée
    setIsVisible(true)

    return () => {
      setIsVisible(false)
    }
  }, [])

  return (
    <div
      className={`page-container ${
        isVisible ? 'page-enter-active' : 'page-enter'
      }`}
    >
      {' '}
      <div className={styles.container}>
        <h1>Presentation</h1>
        <p>Contenu de votre page de presentation</p>
        <p>
          Utilisez la molette de la souris ou les flèches du clavier pour
          naviguer
        </p>
      </div>
    </div>
  )
}

export default Presentation
