import { useEffect, useState, useContext } from 'react'
import { NavigationContext } from '../../app/navigationContext'
import styles from './portfolio.module.scss'
import ProjectCarousel from '../../components/projectCarousel/ProjectCarousel'

function Portfolio() {
  const [isVisible, setIsVisible] = useState(false)
  const { direction } = useContext(NavigationContext)
  const cards = Array.from({ length: 10 }, (_, i) => (
    <div key={i} className={styles.emptyCard}>
      Carte {i + 1}
    </div>
  ))

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
        <h1>Portfolio</h1>
        <p>Contenu de votre page Portfolio</p>
        <ProjectCarousel cards={cards} loop={true} />
        <p>
          Utilisez la molette de la souris ou les flèches du clavier pour
          naviguer
        </p>
      </div>
    </div>
  )
}

export default Portfolio
