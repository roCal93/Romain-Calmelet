import { memo } from 'react'
import LogoSocial from '../logoSocial/LogoSocial'
import AlternatingContactLogo from '../alternatingContactLogo/AlternatingContactLogo'

const StaticLogos = memo(
  ({ activeGame, staticPositions, handleLogoClick, isMobile }) => {
    if (activeGame) return null

    return (
      <>
        <LogoSocial
          type="linkedin"
          position={staticPositions.linkedin}
          onClick={handleLogoClick}
          isMobile={isMobile}
        />
        <LogoSocial
          type="github"
          position={staticPositions.github}
          onClick={handleLogoClick}
          isMobile={isMobile}
        />
        <AlternatingContactLogo
          position={staticPositions.phone}
          onClick={() => handleLogoClick('phone')}
          isMobile={isMobile}
        />
      </>
    )
  }
)

StaticLogos.displayName = 'StaticLogos'

export default StaticLogos
