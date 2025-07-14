import styles from './footer.module.scss'

/**
 * Footer component that displays copyright information
 * @returns {JSX.Element} Footer element with copyright text
 */
const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* Copyright notice with site creation year */}
      <p>&copy; 2025 Romain Calmelet</p>
    </footer>
  )
}

export default Footer
