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

// Array of technology logos with their respective names
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

/**
 * AutoCarousel Component
 * An infinite scrolling carousel that displays technology logos
 * Speed and gap are now defined directly in SCSS
 **/
function AutoCarousel() {
  // Duplicate the logos array to create seamless infinite scroll effect
  const duplicatedLogos = useMemo(() => [...techLogos, ...techLogos], [])

  return (
    <div className={styles.container} aria-label="Technologies carousel">
      <div className={styles.carouselTrack}>
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
