import styles from './logoMobile.module.scss'
import { Link } from 'react-router'

const LogoMobile = () => {
  return (
    <div>
      <Link to="/Portfolio/" className={styles.logo} aria-label="Home">
        <div className={styles.cWithR}>
          <span className={styles.bigC}>C</span>
          <span className={styles.smallR}>R</span>
        </div>
      </Link>
    </div>
  )
}

export default LogoMobile
