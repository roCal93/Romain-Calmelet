import { useEffect, useState, useContext } from 'react'
import { NavigationContext } from '../../app/navigationContext'
import styles from './presentation.module.scss'
import ArrowUp from '../../components/navigationArrows/ArrowUp'
import ArrowDown from '../../components/navigationArrows/ArrowDown'
function Presentation() {
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
      <div className={styles.container}>
        <ArrowUp />
        <h1>Presentation</h1>
        <p>Contenu de votre page de presentation</p>
        <p>
          Utilisez la molette de la souris ou les flèches du clavier pour
          naviguer
        </p>
        <ArrowDown />
      </div>
    </div>
  )
}

export default Presentation
