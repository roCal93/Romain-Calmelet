// Récupération des couleurs CSS
export const getColors = (property) => {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(property)
        .trim()
}

// Application d'opacité aux couleurs
export const applyOpacity = (color, opacity) => {
    if (!color) return 'rgba(0,0,0,0)'

    // Si c'est déjà rgba, remplacer l'opacité
    if (color.startsWith('rgba')) {
        return color.replace(/[\d.]+\)$/g, `${opacity})`)
    }

    // Si c'est hex, convertir en rgba
    if (color.startsWith('#')) {
        const hex = color.slice(1)
        const r = parseInt(hex.slice(0, 2), 16)
        const g = parseInt(hex.slice(2, 4), 16)
        const b = parseInt(hex.slice(4, 6), 16)
        return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }

    // Si c'est rgb, ajouter l'opacité
    if (color.startsWith('rgb')) {
        return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`)
    }

    return color
}

// Cache pour les couleurs converties
const colorCache = new Map()

export const getCachedColor = (property, opacity = 1) => {
    const key = `${property}-${opacity}`

    if (!colorCache.has(key)) {
        const baseColor = getColors(property)
        colorCache.set(key, applyOpacity(baseColor, opacity))
    }

    return colorCache.get(key)
}