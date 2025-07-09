import { useEffect, useState, useContext } from 'react'
import { NavigationContext } from '../../app/navigationContext'
import styles from './portfolio.module.scss'
import ArrowUp from '../../components/navigationArrows/ArrowUp'
import ArrowDown from '../../components/navigationArrows/ArrowDown'
import BackgroundPortfolio from '../../components/backgroundPortfolio/BackgroundPortfolio'
import ProjectCarousel from '../../components/projectCarousel/ProjectCarousel'
import ProjectCard from '../../components/projectCard/ProjectCard'
import { projects } from '../../assets/data/projects'

function Portfolio() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMouseInCarousel, setIsMouseInCarousel] = useState(false)
  const { direction, resetNavigation } = useContext(NavigationContext)

  useEffect(() => {
    resetNavigation?.()
    setIsVisible(true)

    return () => {
      setIsVisible(false)
    }
  }, [resetNavigation])

  // Transformer les projets en cards pour le carousel
  const cardsTitle = projects.map((project) => (
    <ProjectCard key={project.id} project={project} variant="front" />
  ))

  const cards = projects.map((project) => (
    <ProjectCard key={project.id} project={project} variant="detailed" />
  ))

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
      <BackgroundPortfolio />

      <main className={styles.container} role="main">
        <div className={styles.navUp}>
          <ArrowUp aria-label="Naviguer vers la section précédente" />
        </div>

        <article
          className={styles.portfolioContent}
          aria-labelledby="portfolio-title"
        >
          <header className={styles.title}>
            <div className={styles.text}>
              <h1 id="portfolio-title">Mes réalisations</h1>
              <p>Voici les différents projets que j'ai accomplis</p>
            </div>
          </header>

          <section
            className={`${styles.carouselWrapper} ${
              isMouseInCarousel ? 'allowScroll' : ''
            }`}
            onMouseEnter={() => setIsMouseInCarousel(true)}
            onMouseLeave={() => setIsMouseInCarousel(false)}
            aria-label="Carrousel de projets"
          >
            <ProjectCarousel
              cards={cards}
              cardsTitle={cardsTitle}
              loop={true}
              autoFocus={false}
            />
          </section>
        </article>

        <nav className={styles.navDown} aria-label="Navigation entre sections">
          <ArrowDown aria-label="Naviguer vers la section suivante" />
        </nav>
      </main>
    </div>
  )
}

export default Portfolio
