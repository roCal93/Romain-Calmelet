import styles from './projectCard.module.scss'
import { useTranslation } from '../../hooks/useTranslation'

// Constants for component variants
const VARIANTS = {
  FRONT: 'front',
  DETAILED: 'detailed',
}

// Default fallback values
const DEFAULT_IMAGE = '/images/default-project.jpg'
const DEFAULT_LOGO = '/images/default-logo.svg'

function ProjectCard({ project, variant = VARIANTS.DETAILED }) {
  const { t } = useTranslation()
  // Early return if no project data
  if (!project) {
    console.warn('ProjectCard: No project data provided')
    return null
  }

  // Destructure with fallback values
  const {
    name = 'Untitled Project',
    image = DEFAULT_IMAGE,
    logo = DEFAULT_LOGO,
    description = '',
    technologies = [],
    features = [],
    githubLink = null,
    demoLink = null,
  } = project

  // Render front variant (simplified card)
  if (variant === VARIANTS.FRONT) {
    return (
      <div className={styles.projectCardFront}>
        <div className={styles.imageContainer}>
          <img
            src={image}
            alt={`Preview of ${name} project`}
            className={styles.img}
            loading="lazy"
            width={800}
            height={600}
            onError={(e) => {
              e.target.src = DEFAULT_IMAGE
              e.target.onerror = null // Prevent infinite loop
            }}
          />
        </div>
        <h2 className={styles.cardTitle}>{name}</h2>
      </div>
    )
  }

  // Generate unique ID for aria-labelledby
  const featuresHeadingId = `features-${name
    .replace(/\s+/g, '-')
    .toLowerCase()}`

  // Render detailed variant
  return (
    <div className={`${styles.projectCard} scrollable`}>
      {/* Header section with logo and description */}
      <header className={styles.projectCardHeader}>
        <img
          src={logo}
          alt={`${name} logo`}
          loading="lazy"
          width={150}
          height={150}
          tabIndex="-1"
          onError={(e) => {
            e.target.src = DEFAULT_LOGO
            e.target.onerror = null
          }}
        />
        <p>{description || `${name} project description`}</p>
      </header>

      {/* Technologies section */}
      {technologies.length > 0 && (
        <section className={styles.technologies} aria-label="Technologies used">
          {technologies.map((tech, index) => (
            <span key={`${tech}-${index}`} className={styles.techBadge}>
              {tech}
            </span>
          ))}
        </section>
      )}

      {/* Features section */}
      {features.length > 0 && (
        <section className={`${styles.features} scrollable`}>
          <h4 id={featuresHeadingId}>{t('projectCard.keyFeatures')}</h4>
          <ul
            tabIndex="0"
            role="list"
            aria-labelledby={featuresHeadingId}
            className="scrollable"
          >
            {features.map((feature, index) => (
              <li key={`${feature.slice(0, 20)}-${index}`} role="listitem">
                {feature}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Links section */}
      <nav className={styles.links}>
        {githubLink && (
          <a
            href={githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubLink}
            aria-label={`View ${name} source code on GitHub`}
            tabIndex={0}
          >
            GitHub
          </a>
        )}
        {demoLink && name !== 'Mon portfolio' && (
          <a
            href={demoLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.demoLink}
            aria-label={`View ${name} live demo`}
            tabIndex={0}
          >
            Live Demo
          </a>
        )}
      </nav>
    </div>
  )
}

export default ProjectCard
