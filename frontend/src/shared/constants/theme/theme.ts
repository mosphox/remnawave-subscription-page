import { createTheme } from '@mantine/core'

import components from './overrides'

export const theme = createTheme({
    components,
    cursorType: 'pointer',
    fontFamily:
        '"Bricolage Grotesque", Vazirmatn, Apple Color Emoji, Noto Sans SC, Twemoji Country Flags, sans-serif',
    fontFamilyMonospace: 'Fira Mono, monospace',
    breakpoints: {
        xs: '25em',
        sm: '30em',
        md: '48em',
        lg: '64em',
        xl: '80em',
        '2xl': '96em',
        '3xl': '120em',
        '4xl': '160em'
    },
    scale: 1,
    fontSmoothing: true,
    focusRing: 'never',
    white: '#f5f0ff',
    black: '#0a0812',
    colors: {
        // Deep indigo-violet neutral scale (no warm cast, no boring gray)
        dark: [
            '#f5f0ff', // 0 — text
            '#d8cfec', // 1
            '#a89db8', // 2 — muted
            '#7a6e95', // 3
            '#4f4474', // 4
            '#382d5e', // 5 — border strong
            '#2c1f5a', // 6 — border subtle
            '#231a4a', // 7 — surface hi
            '#14102a', // 8 — surface
            '#0a0812'  // 9 — bg base
        ],
        // Sunset orange — primary accent
        orange: [
            '#fff1ea',
            '#ffd4bf',
            '#ffa887',
            '#ff8057',
            '#ff6b35', // 4 — primary
            '#e4551f',
            '#b83e14',
            '#892c0e',
            '#5b1c07',
            '#2e0d03'
        ],
        // Hot pink / magenta — secondary sunset highlight
        pink: [
            '#ffe4ee',
            '#ffb8d0',
            '#ff89b0',
            '#ff5c94',
            '#ff3d7f', // 4
            '#e32868',
            '#b81a50',
            '#880f38',
            '#5a0622',
            '#2d0211'
        ],
        // Sunset amber/yellow
        yellow: [
            '#fff5dc',
            '#ffe3a3',
            '#ffd06a',
            '#f9c148',
            '#f7b32b', // 4
            '#de9b1a',
            '#b07a11',
            '#82590a',
            '#553a05',
            '#2a1d02'
        ],
        // Electric mint — status active
        green: [
            '#dcffeb',
            '#a1f7c4',
            '#7df9a3',
            '#5ceb8a',
            '#44d474', // 4
            '#2fb55c',
            '#208f45',
            '#166830',
            '#0d421e',
            '#06210f'
        ],
        // Violet — secondary cool accent
        violet: [
            '#ece3ff',
            '#c7b2ff',
            '#a887ff',
            '#8a5fff',
            '#6f3fff', // 4
            '#5a29ee',
            '#421bc2',
            '#2e1190',
            '#1c0961',
            '#0d0433'
        ],
        indigo: [
            '#e1ddff',
            '#b6acff',
            '#8c7cff',
            '#6852ff',
            '#4e3ff5', // 4
            '#382bd6',
            '#2820a6',
            '#1b1778',
            '#100e4c',
            '#080624'
        ],
        // Aliased so hardcoded cyan/teal/blue/red still land in the palette
        cyan: [
            '#ece3ff',
            '#c7b2ff',
            '#a887ff',
            '#8a5fff',
            '#6f3fff',
            '#5a29ee',
            '#421bc2',
            '#2e1190',
            '#1c0961',
            '#0d0433'
        ],
        teal: [
            '#dcffeb',
            '#a1f7c4',
            '#7df9a3',
            '#5ceb8a',
            '#44d474',
            '#2fb55c',
            '#208f45',
            '#166830',
            '#0d421e',
            '#06210f'
        ],
        blue: [
            '#e1ddff',
            '#b6acff',
            '#8c7cff',
            '#6852ff',
            '#4e3ff5',
            '#382bd6',
            '#2820a6',
            '#1b1778',
            '#100e4c',
            '#080624'
        ],
        red: [
            '#ffe4ee',
            '#ffb8d0',
            '#ff89b0',
            '#ff5c94',
            '#ff3d7f',
            '#e32868',
            '#b81a50',
            '#880f38',
            '#5a0622',
            '#2d0211'
        ],
        // `amber` still referenced by our earlier edits — alias to orange
        amber: [
            '#fff1ea',
            '#ffd4bf',
            '#ffa887',
            '#ff8057',
            '#ff6b35',
            '#e4551f',
            '#b83e14',
            '#892c0e',
            '#5b1c07',
            '#2e0d03'
        ]
    },
    primaryShade: 4,
    primaryColor: 'orange',
    autoContrast: true,
    luminanceThreshold: 0.3,
    headings: {
        fontFamily:
            '"Bricolage Grotesque", Vazirmatn, Apple Color Emoji, Noto Sans SC, sans-serif',
        fontWeight: '600'
    },
    defaultRadius: 'lg'
})
