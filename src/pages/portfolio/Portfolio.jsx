import { useEffect, useState, useContext } from 'react'
import { NavigationContext } from '../../app/navigationContext'
import styles from './portfolio.module.scss'
import ProjectCarousel from '../../components/projectCarousel/ProjectCarousel'
import { projects } from '../../assets/data/projects'
import ArrowUp from '../../components/navigationArrows/ArrowUp'
import ArrowDown from '../../components/navigationArrows/ArrowDown'

function Portfolio() {
  const [isVisible, setIsVisible] = useState(false)
  const { direction } = useContext(NavigationContext)

  // Transformer les projets en cards pour le carousel
  const cardsTitle = projects.map((projet) => (
    <div key={projet.id} className={styles.projectCard}>
      <h2>{projet.name}</h2>
      <img src="" alt="" />
    </div>
  ))
  const cards = projects.map((projet) => (
    <div key={projet.id} className={styles.projectCard}>
      <h2>{projet.name}</h2>
      <p className={styles.description}>{projet.description}</p>

      <div className={styles.technologies}>
        {projet.technologies.map((tech, index) => (
          <span key={index} className={styles.techBadge}>
            {tech}
          </span>
        ))}
      </div>

      <div className={styles.details}>
        <span className={styles.status}>{projet.status}</span>
        <span className={styles.duration}>{projet.duration}</span>
      </div>

      <div className={styles.features}>
        <h4>Fonctionnalités principales:</h4>
        <ul>
          {projet.features.slice(0, 3).map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>

      <div className={styles.links}>
        <a
          href={projet.githubLink}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.githubLink}
        >
          GitHub
        </a>
        <a
          href={projet.demoLink}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.demoLink}
        >
          Démo Live
        </a>
      </div>
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
      <div className={styles.container}>
        <ArrowUp />
        <h1>Portfolio</h1>
        <p>Contenu de votre page Portfolio</p>
        <ProjectCarousel cards={cards} cardsTitle={cardsTitle} loop={true} />
        <p>
          Utilisez la molette de la souris ou les flèches du clavier pour
          naviguer
        </p>
        <ArrowDown />
      </div>
    </div>
  )
}

export default Portfolio
