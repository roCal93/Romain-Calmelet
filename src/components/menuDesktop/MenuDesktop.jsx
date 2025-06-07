import styles from './menuDesktop.module.scss'
import { Link } from 'react-router'

const MenuDesktop = () => {
  return (
    <div>
      <ul className={styles.menu}>
        <li>
          <Link to="presentation" className={styles.link}>
            PRESENTATION
          </Link>
        </li>
        <li>
          <Link to="portfolio" className={styles.link}>
            PORTFOLIO
          </Link>
        </li>
        <li>
          <Link to="contact" className={styles.link}>
            CONTACT
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default MenuDesktop
