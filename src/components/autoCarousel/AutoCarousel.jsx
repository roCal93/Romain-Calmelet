import styles from './autoCarousel.module.scss'
import reactPng from '../../assets/img/react.png'
import html5Png from '../../assets/img/html5.png'
import css3Png from '../../assets/img/css3.png'
import jsPng from '../../assets/img/javascript.png'
import reduxPng from '../../assets/img/redux.png'
import sassPng from '../../assets/img/sass.png'
import gitPng from '../../assets/img/git.png'
import gitHubPng from '../../assets/img/gitHub.png'
import vsCodePng from '../../assets/img/vsCode.png'
import scrumPng from '../../assets/img/scrum.png'
import seoPng from '../../assets/img/seo.png'
import swaggerPng from '../../assets/img/swagger.png'

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
