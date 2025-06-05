import styles from './LogoDesktop.module.scss'
import { Link } from 'react-router'
const LogoDesktop = () => {
  return (
    <div>
      <Link to="/" className={styles.logo} aria-label="Home">
        <div className={styles.cWithR}>
          <span className={styles.bigC}>C</span>
          <span className={styles.surname}>
            {['A', 'L', 'M', 'E', 'L', 'E', 'T'].map((letter, index) => (
              <span key={`surname-${index}`} className={styles.letter}>
                {letter}
              </span>
            ))}
          </span>
          <span className={styles.smallR}>R</span>
          <span className={styles.firstname}>
            {['O', 'M', 'A', 'I', 'N'].map((letter, index) => (
              <span key={`firstname-${index}`} className={styles.letter}>
                {letter}
              </span>
            ))}
          </span>
        </div>
      </Link>
    </div>
  )
}

export default LogoDesktop
