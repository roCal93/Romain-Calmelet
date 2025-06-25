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

function AutoCarousel() {
  const images = [
    html5Png,
    css3Png,
    sassPng,
    jsPng,
    reactPng,
    reduxPng,
    gitPng,
    gitHubPng,
    vsCodePng,
    scrumPng,
    seoPng,
    swaggerPng,
  ]

  return (
    <div className={styles.container}>
      <div className={styles.carouselTrack}>
        {/* Premier set d'images */}
        {images.map((image, index) => (
          <div key={`first-${index}`} className={styles.slide}>
            <img src={image} alt={`Slide ${index + 1}`} />
          </div>
        ))}

        {/* Duplication pour l'effet infini */}
        {images.map((image, index) => (
          <div key={`second-${index}`} className={styles.slide}>
            <img src={image} alt={`Slide ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default AutoCarousel
