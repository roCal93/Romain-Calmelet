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
    <div key={projet.id} className={styles.projectCardFront}>
      <div className={styles.imageContainer}>
        <img src={projet.image} alt={projet.description} />
        <h2 className={styles.imageTitle}>{projet.name}</h2>
      </div>
    </div>
  ))

  const cards = projects.map((projet) => (
    <div key={projet.id} className={styles.projectCard}>
      {/* Header section avec logo et description */}
      <div className={styles.projectCardHeader}>
        <img src={projet.logo} alt={projet.name} />
        <p>{projet.description}</p>
      </div>

      {/* Technologies */}
      <div className={styles.technologies}>
        {projet.technologies.map((tech, index) => (
          <span key={index} className={styles.techBadge}>
            {tech}
          </span>
        ))}
      </div>

      {/* Fonctionnalités */}
      <div className={styles.features}>
        <h4>Fonctionnalités principales:</h4>
        <ul>
          {projet.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>

      {/* Liens */}
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
        <div className={styles.title}>
          <div className={styles.text}>
            <h1>Mes réalisations</h1>
            <p>Voici les différents projets que j’ai accomplis</p>
          </div>
          <ArrowUp className={styles.arrowUp} />
        </div>
        <ProjectCarousel cards={cards} cardsTitle={cardsTitle} loop={true} />
        <ArrowDown />
      </div>
    </div>
  )
}

export default Portfolio
