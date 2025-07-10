import styles from './projectCard.module.scss'

function ProjectCard({ project, variant = 'detailed' }) {
  if (variant === 'front') {
    return (
      <div className={styles.projectCardFront}>
        <div className={styles.imageContainer}>
          <img
            src={project.image}
            alt={`Aperçu du projet ${project.name}`}
            className={styles.img}
            loading="lazy"
          />
        </div>
        <h2 className={styles.cardTitle}>{project.name}</h2>
      </div>
    )
  }

  return (
    <div className={`${styles.projectCard} scrollable`}>
      {/* Header section avec logo et description */}
      <header className={styles.projectCardHeader}>
        <img
          src={project.logo}
          alt={`Logo ${project.name}`}
          loading="lazy"
          tabIndex="-1"
        />
        <p>{project.description}</p>
      </header>

      {/* Technologies */}
      <section
        className={styles.technologies}
        aria-label="Technologies utilisées"
      >
        {project.technologies.map((tech, index) => (
          <span key={index} className={styles.techBadge}>
            {tech}
          </span>
        ))}
      </section>

      {/* Fonctionnalités */}
      <section className={`${styles.features} scrollable`}>
        <h4>Fonctionnalités principales:</h4>
        <ul
          tabIndex="0"
          role="list"
          aria-label="Liste des fonctionnalités principales"
          className="scrollable"
        >
          {project.features.map((feature, index) => (
            <li key={index} role="listitem">
              {feature}
            </li>
          ))}
        </ul>
      </section>

      {/* Liens */}
      <nav className={styles.links}>
        <a
          href={project.githubLink}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.githubLink}
          aria-label={`Voir le code source de ${project.name} sur GitHub`}
        >
          GitHub
        </a>
        {project.name !== 'Mon portfolio' && (
          <a
            href={project.demoLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.demoLink}
            aria-label={`Voir la démo de ${project.name}`}
          >
            Démo Live
          </a>
        )}
      </nav>
    </div>
  )
}

export default ProjectCard
