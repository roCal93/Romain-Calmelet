// pages/portfolio/Portfolio.jsx
import { useEffect, useState, useContext, useMemo, useCallback } from 'react'
import { NavigationContext } from '../../contexts/NavigationContext'
import { useTranslation } from '../../hooks/useTranslation'
import styles from './portfolio.module.scss'
import ArrowUp from '../../components/navigationArrows/ArrowUp'
import ArrowDown from '../../components/navigationArrows/ArrowDown'
import BackgroundPortfolio from '../../components/backgroundPortfolio/BackgroundPortfolio'
import ProjectCarousel from '../../components/projectCarousel/ProjectCarousel'
import ProjectCard from '../../components/projectCard/ProjectCard'
import { useProjects } from '../../assets/data/projects'

// Constants
const VARIANTS = {
  FRONT: 'front',
  DETAILED: 'detailed',
}

function Portfolio() {
  const { t, language } = useTranslation()
  const projects = useProjects(language)
  const [isVisible, setIsVisible] = useState(false)
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0)
  const { direction, resetNavigation } = useContext(NavigationContext)

  // Store projects length in a variable
  const projectsCount = projects.length || 0

  useEffect(() => {
    // Reset navigation and show page
    resetNavigation?.()
    setIsVisible(true)

    // Cleanup on unmount
    return () => {
      setIsVisible(false)
    }
  }, [resetNavigation])

  // Memoize project cards to avoid unnecessary re-renders
  const cardsTitle = useMemo(
    () =>
      projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          variant={VARIANTS.FRONT}
        />
      )),
    [projects]
  )

  const cards = useMemo(
    () =>
      projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          variant={VARIANTS.DETAILED}
        />
      )),
    [projects]
  )

  // Handle carousel navigation
  const handleProjectChange = useCallback((index) => {
    setCurrentProjectIndex(index)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (!projectsCount) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          setCurrentProjectIndex((prev) =>
            prev === 0 ? projectsCount - 1 : prev - 1
          )
          break
        case 'ArrowRight':
          e.preventDefault()
          setCurrentProjectIndex((prev) =>
            prev === projectsCount - 1 ? 0 : prev + 1
          )
          break
      }
    },
    [projectsCount]
  )

  // Handle empty projects case
  if (!projects || projectsCount === 0) {
    return (
      <div className={`page-container ${styles.container}`}>
        <BackgroundPortfolio />
        <main className={styles.emptyState} role="main">
          <h1>No projects available</h1>
          <p>Projects will be displayed here once available.</p>
        </main>
      </div>
    )
  }

  return (
    <div
      className={`page-container ${
        isVisible
          ? direction === 'down'
            ? 'page-enter-down'
            : 'page-enter-up'
          : ''
      } `}
      onKeyDown={handleKeyDown}
    >
      <BackgroundPortfolio />

      <main className={styles.container} role="main">
        {/* Navigation up arrow */}
        <div className={styles.navUp}>
          <ArrowUp aria-label="Navigate to previous section" />
        </div>

        <article
          className={styles.portfolioContent}
          aria-labelledby="portfolio-title"
        >
          {/* Portfolio header */}
          <header className={styles.title}>
            <div className={styles.text}>
              <h1 id="portfolio-title">{t('portfolio.title')}</h1>
              <p>{t('portfolio.description')}</p>
            </div>
          </header>

          {/* Projects carousel */}
          <section
            className={styles.carouselWrapper}
            aria-label="Projects carousel"
          >
            <ProjectCarousel
              cards={cards}
              cardsTitle={cardsTitle}
              loop={true}
              onProjectChange={handleProjectChange}
              currentIndex={currentProjectIndex}
            />

            {/* Screen reader announcements */}
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
            >
              {`Project ${currentProjectIndex + 1} of ${projectsCount}: ${
                projects[currentProjectIndex]?.title || ''
              }`}
            </div>
          </section>
        </article>

        {/* Navigation down arrow */}
        <nav
          className={styles.navDown}
          aria-label="Navigation between sections"
        >
          <ArrowDown aria-label="Navigate to next section" />
        </nav>
      </main>
    </div>
  )
}

export default Portfolio
