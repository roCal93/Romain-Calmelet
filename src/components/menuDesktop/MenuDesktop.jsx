// MenuDesktop.jsx
import styles from './menuDesktop.module.scss'
import { NavLink } from 'react-router-dom'
import { useTranslation } from '../../hooks/useTranslation'

/**
 * Desktop navigation menu component
 * Features:
 * - Animated entrance with staggered delay
 * - Active link highlighting
 * - Hover effects with underline animation
 * - Accessibility support (aria-label, aria-current)
 */
const MenuDesktop = () => {
  const { t } = useTranslation()
  // Navigation menu items configuration
  const menuItems = [
    { path: 'presentation', label: t('navigation.presentation') },
    { path: 'portfolio', label: t('navigation.portfolio') },
    { path: 'contact', label: t('navigation.contact') },
  ]

  return (
    <nav aria-label="Menu principal">
      <ul className={styles.menu}>
        {menuItems.map((item, index) => (
          <li
            key={item.path}
            // CSS custom property for staggered animation delay
            style={{ '--animation-delay': `${0.9 - index * 0.1}s` }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`
              }
              // Accessibility: indicates current page in navigation
              aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
              tabIndex={0}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default MenuDesktop
