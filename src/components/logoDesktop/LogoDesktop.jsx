import styles from './LogoDesktop.module.scss'
import { Link } from 'react-router'

// Constantes pour les lettres
const SURNAME_LETTERS = ['A', 'L', 'M', 'E', 'L', 'E', 'T']
const FIRSTNAME_LETTERS = ['O', 'M', 'A', 'I', 'N']

const LogoDesktop = () => {
  return (
    <div>
      <Link to="/Romain-Calmelet/" className={styles.logo} aria-label="Home">
        {/* Utilise la classe sr-only globale */}
        <span className="sr-only">Calmelet Romain</span>

        <div className={styles.cWithR}>
          <span className={styles.bigC}>C</span>
          <span className={styles.surname}>
            {SURNAME_LETTERS.map((letter, index) => (
              <span key={`surname-${index}`} className={styles.letter}>
                {letter}
              </span>
            ))}
          </span>
          <span className={styles.smallR}>R</span>
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
