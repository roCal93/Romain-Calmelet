import { useMemo } from 'react'
import styles from './autoCarousel.module.scss'
import reactPng from '../../assets/img/logoTech/react.png'
import html5Png from '../../assets/img/logoTech/html5.png'
import css3Png from '../../assets/img/logoTech/css3.png'
import jsPng from '../../assets/img/logoTech/javascript.png'
import reduxPng from '../../assets/img/logoTech/redux.png'
import sassPng from '../../assets/img/logoTech/sass.png'
import gitPng from '../../assets/img/logoTech/git.png'
import gitHubPng from '../../assets/img/logoTech/gitHub.png'
import vsCodePng from '../../assets/img/logoTech/vsCode.png'
import scrumPng from '../../assets/img/logoTech/scrum.png'
import seoPng from '../../assets/img/logoTech/seo.png'
import swaggerPng from '../../assets/img/logoTech/Swagger.png'

const techLogos = [
  { src: html5Png, name: 'HTML5' },
  { src: css3Png, name: 'CSS3' },
  { src: sassPng, name: 'Sass' },
  { src: jsPng, name: 'JavaScript' },
  { src: reactPng, name: 'React' },
  { src: reduxPng, name: 'Redux' },
  { src: gitPng, name: 'Git' },
  { src: gitHubPng, name: 'GitHub' },
  { src: vsCodePng, name: 'VS Code' },
  { src: scrumPng, name: 'Scrum' },
  { src: seoPng, name: 'SEO' },
  { src: swaggerPng, name: 'Swagger' },
]

function AutoCarousel({
  speed = 20,
  gap = 1.5,
  pauseOnHover = true,
  className = '',
}) {
  const duplicatedLogos = useMemo(() => [...techLogos, ...techLogos], [])

  return (
    <div
      className={`${styles.container} ${className}`}
      role="region"
      aria-label="Technologies carousel"
      data-pause-on-hover={pauseOnHover}
    >
      <div
        className={styles.carouselTrack}
        style={{
          '--speed': `${speed}s`,
          '--gap': `${gap}rem`,
          '--item-count': techLogos.length,
        }}
      >
        {duplicatedLogos.map((tech, index) => (
          <div
            key={`${tech.name}-${index}`}
            className={styles.slide}
            aria-label={tech.name}
          >
            <img
              src={tech.src}
              alt={`${tech.name} logo`}
              loading="lazy"
              draggable="false"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default AutoCarousel
