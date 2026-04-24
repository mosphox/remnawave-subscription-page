import { encode } from 'uqr'

interface IProps {
    value: string
    gradientId?: string
}

export function QrTiles({ value, gradientId = 'qrSunset' }: IProps) {
    const { size, data } = encode(value)
    const tiles: React.ReactNode[] = []
    const pad = 0.12

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (!data[y][x]) continue
            tiles.push(
                <rect
                    key={`${x}-${y}`}
                    x={x + pad}
                    y={y + pad}
                    width={1 - pad * 2}
                    height={1 - pad * 2}
                    rx={0.18}
                    fill={`url(#${gradientId})`}
                />
            )
        }
    }

    return (
        <svg
            height="100%"
            preserveAspectRatio="xMidYMid meet"
            shapeRendering="geometricPrecision"
            viewBox={`0 0 ${size} ${size}`}
            width="100%"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient
                    gradientUnits="userSpaceOnUse"
                    id={gradientId}
                    x1="0"
                    x2={size}
                    y1="0"
                    y2={size}
                >
                    <stop offset="0%" stopColor="#ffb347" />
                    <stop offset="35%" stopColor="#ff6b35" />
                    <stop offset="65%" stopColor="#ff3d7f" />
                    <stop offset="100%" stopColor="#6f3fff" />
                </linearGradient>
            </defs>
            {tiles}
        </svg>
    )
}
