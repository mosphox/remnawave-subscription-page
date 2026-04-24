// Sunset-at-night palette — map everything into our 5 accent colors.
const COLORS: Record<string, [number, number, number]> = {
    cyan: [138, 95, 255],    // violet
    teal: [125, 249, 163],   // mint
    green: [125, 249, 163],  // mint
    lime: [247, 179, 43],    // yellow
    yellow: [247, 179, 43],  // yellow
    orange: [255, 107, 53],  // sunset orange
    red: [255, 61, 127],     // hot pink
    pink: [255, 61, 127],
    grape: [168, 135, 255],
    violet: [138, 95, 255],
    indigo: [104, 82, 255],
    blue: [104, 82, 255],
    gray: [137, 125, 168],
    dark: [35, 26, 74]
}

const DEFAULT_COLOR = COLORS.orange

const hexToRgb = (hex: string): [number, number, number] | null => {
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return match ? [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)] : null
}

const getRgb = (color: string): [number, number, number] =>
    COLORS[color] ?? hexToRgb(color) ?? DEFAULT_COLOR

export interface ColorGradientStyle {
    background: string
    border: string
    boxShadow?: string
}

export const getColorGradient = (color: string): ColorGradientStyle => {
    const [r, g, b] = getRgb(color)
    return {
        background: `linear-gradient(135deg, rgba(${r},${g},${b},0.15) 0%, rgba(${r},${g},${b},0.08) 100%)`,
        border: `1px solid rgba(${r},${g},${b},0.3)`
    }
}

export const getColorGradientSolid = (color: string): ColorGradientStyle => {
    const [r, g, b] = getRgb(color)
    // Deep indigo-violet base (#14102a = 20,16,42) + subtle tint from the color.
    const dark1 = [20 + r * 0.05, 16 + g * 0.05, 42 + b * 0.05].map(Math.floor)
    const dark2 = [16 + r * 0.03, 12 + g * 0.03, 34 + b * 0.03].map(Math.floor)

    return {
        background: `linear-gradient(135deg, rgb(${dark1}) 0%, rgb(${dark2}) 100%)`,
        border: `1px solid rgba(${r},${g},${b},0.35)`,
        boxShadow: `inset 0 0 16px rgba(${r},${g},${b},0.12)`
    }
}
