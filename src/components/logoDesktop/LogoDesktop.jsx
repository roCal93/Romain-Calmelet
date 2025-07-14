import styles from './LogoDesktop.module.scss'
import { Link } from 'react-router'

// Letter constants for name display
const SURNAME_LETTERS = ['A', 'L', 'M', 'E', 'L', 'E', 'T']
const FIRSTNAME_LETTERS = ['O', 'M', 'A', 'I', 'N']

const LogoDesktop = () => {
  return (
    <div>
      <Link to="/" className={styles.logo} aria-label="Home">
        {/* Screen reader only text for accessibility */}
        <span className="sr-only">Calmelet Romain</span>

        <div className={styles.cWithR}>
          {/* Large "C" with rotation animation */}
          <span className={styles.bigC}>C</span>

          {/* Surname letters with staggered appearance */}
          <span className={styles.surname}>
            {SURNAME_LETTERS.map((letter, index) => (
              <span key={`surname-${index}`} className={styles.letter}>
                {letter}
              </span>
            ))}
          </span>

          {/* Small "R" with translation animation */}
          <span className={styles.smallR}>R</span>

          {/* Firstname letters with staggered appearance */}
          <span className={styles.firstname}>
            {FIRSTNAME_LETTERS.map((letter, index) => (
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
