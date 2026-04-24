export interface ParsedField {
    label: string
    value: string
    mono?: boolean
    sensitive?: boolean
    multiline?: boolean
}

export type ProtocolSlug =
    | 'vless'
    | 'vmess'
    | 'shadowsocks'
    | 'trojan'
    | 'hysteria2'
    | 'tuic'
    | 'socks'
    | 'http'
    | 'unknown'

export interface ParsedConfig {
    protocol: string
    protocolSlug: ProtocolSlug
    name: string
    host?: string
    port?: string
    summary: string
    fields: ParsedField[]
    fullLink: string
}

const getNameFromHash = (url: string): string => {
    const i = url.lastIndexOf('#')
    if (i === -1) return 'Unnamed'
    const raw = url.slice(i + 1)
    try {
        return decodeURIComponent(raw) || 'Unnamed'
    } catch {
        return raw || 'Unnamed'
    }
}

const tryBase64Decode = (s: string): string | null => {
    try {
        let b = s.replace(/-/g, '+').replace(/_/g, '/')
        while (b.length % 4) b += '='
        return atob(b)
    } catch {
        return null
    }
}

const parseQuery = (qs: string): Record<string, string> => {
    const out: Record<string, string> = {}
    for (const pair of qs.split('&')) {
        if (!pair) continue
        const idx = pair.indexOf('=')
        const k = idx === -1 ? pair : pair.slice(0, idx)
        const v = idx === -1 ? '' : pair.slice(idx + 1)
        try {
            out[decodeURIComponent(k)] = decodeURIComponent(v)
        } catch {
            out[k] = v
        }
    }
    return out
}

const splitHostPort = (hp: string): { host: string; port: string } => {
    const clean = hp.split('?')[0].split('/')[0]
    const idx = clean.lastIndexOf(':')
    if (idx === -1) return { host: clean, port: '' }
    return { host: clean.slice(0, idx), port: clean.slice(idx + 1) }
}

const pushOptional = (
    fields: ParsedField[],
    label: string,
    value: string | undefined,
    opts?: Partial<ParsedField>
) => {
    if (value === undefined || value === null || value === '') return
    fields.push({ label, value: String(value), mono: true, ...opts })
}

const parseShadowsocks = (link: string): ParsedConfig => {
    const name = getNameFromHash(link)
    const body = link.replace(/^ss:\/\//, '').split('#')[0]

    let method = ''
    let password = ''
    let host = ''
    let port = ''

    if (body.includes('@')) {
        const atIdx = body.lastIndexOf('@')
        const creds = body.slice(0, atIdx)
        const hp = body.slice(atIdx + 1)
        const decoded = tryBase64Decode(creds) ?? creds
        const colonIdx = decoded.indexOf(':')
        method = colonIdx === -1 ? decoded : decoded.slice(0, colonIdx)
        password = colonIdx === -1 ? '' : decoded.slice(colonIdx + 1)
        ;({ host, port } = splitHostPort(hp))
    } else {
        const decoded = tryBase64Decode(body) ?? body
        const atIdx = decoded.indexOf('@')
        const creds = decoded.slice(0, atIdx)
        const hp = decoded.slice(atIdx + 1)
        const colonIdx = creds.indexOf(':')
        method = colonIdx === -1 ? creds : creds.slice(0, colonIdx)
        password = colonIdx === -1 ? '' : creds.slice(colonIdx + 1)
        ;({ host, port } = splitHostPort(hp))
    }

    const fields: ParsedField[] = []
    pushOptional(fields, 'Host', host)
    pushOptional(fields, 'Port', port)
    pushOptional(fields, 'Method', method)
    pushOptional(fields, 'Password', password, { sensitive: true })

    return {
        protocol: 'Shadowsocks',
        protocolSlug: 'shadowsocks',
        name,
        host,
        port,
        summary: host && port ? `${host}:${port}` : host || '',
        fullLink: link,
        fields
    }
}

const parseVless = (link: string): ParsedConfig => {
    const name = getNameFromHash(link)
    const rest = link.replace(/^vless:\/\//, '').split('#')[0]
    const qIdx = rest.indexOf('?')
    const core = qIdx === -1 ? rest : rest.slice(0, qIdx)
    const qs = qIdx === -1 ? '' : rest.slice(qIdx + 1)
    const atIdx = core.lastIndexOf('@')
    const uuid = atIdx === -1 ? '' : core.slice(0, atIdx)
    const hp = atIdx === -1 ? core : core.slice(atIdx + 1)
    const { host, port } = splitHostPort(hp)
    const p = qs ? parseQuery(qs) : {}

    const fields: ParsedField[] = []
    pushOptional(fields, 'Host', host)
    pushOptional(fields, 'Port', port)
    pushOptional(fields, 'UUID', uuid, { sensitive: true })
    pushOptional(fields, 'Network', p.type)
    pushOptional(fields, 'Security', p.security)
    pushOptional(fields, 'Encryption', p.encryption)
    pushOptional(fields, 'Flow', p.flow)
    pushOptional(fields, 'SNI', p.sni)
    pushOptional(fields, 'Fingerprint', p.fp)
    pushOptional(fields, 'ALPN', p.alpn)
    pushOptional(fields, 'Public Key', p.pbk, { sensitive: true })
    pushOptional(fields, 'Short ID', p.sid)
    pushOptional(fields, 'SpiderX', p.spx)
    pushOptional(fields, 'Path', p.path)
    pushOptional(fields, 'HTTP Host', p.host)
    pushOptional(fields, 'Service Name', p.serviceName)
    pushOptional(fields, 'Mode', p.mode)
    pushOptional(fields, 'Header Type', p.headerType)

    return {
        protocol: 'VLESS',
        protocolSlug: 'vless',
        name,
        host,
        port,
        summary: host && port ? `${host}:${port}` : host || '',
        fullLink: link,
        fields
    }
}

const parseTrojan = (link: string): ParsedConfig => {
    const name = getNameFromHash(link)
    const rest = link.replace(/^trojan:\/\//, '').split('#')[0]
    const qIdx = rest.indexOf('?')
    const core = qIdx === -1 ? rest : rest.slice(0, qIdx)
    const qs = qIdx === -1 ? '' : rest.slice(qIdx + 1)
    const atIdx = core.indexOf('@')
    const rawPass = atIdx === -1 ? '' : core.slice(0, atIdx)
    const hp = atIdx === -1 ? core : core.slice(atIdx + 1)
    const { host, port } = splitHostPort(hp)
    const p = qs ? parseQuery(qs) : {}

    let password = rawPass
    try {
        password = decodeURIComponent(rawPass)
    } catch {
        /* noop */
    }

    const fields: ParsedField[] = []
    pushOptional(fields, 'Host', host)
    pushOptional(fields, 'Port', port)
    pushOptional(fields, 'Password', password, { sensitive: true })
    pushOptional(fields, 'Network', p.type)
    pushOptional(fields, 'Security', p.security)
    pushOptional(fields, 'SNI', p.sni)
    pushOptional(fields, 'Fingerprint', p.fp)
    pushOptional(fields, 'ALPN', p.alpn)
    pushOptional(fields, 'Path', p.path)
    pushOptional(fields, 'HTTP Host', p.host)
    pushOptional(fields, 'Service Name', p.serviceName)
    if (p.allowInsecure === '1') pushOptional(fields, 'Allow Insecure', 'Yes')

    return {
        protocol: 'Trojan',
        protocolSlug: 'trojan',
        name,
        host,
        port,
        summary: host && port ? `${host}:${port}` : host || '',
        fullLink: link,
        fields
    }
}

const parseVmess = (link: string): ParsedConfig => {
    const body = link.replace(/^vmess:\/\//, '').split('#')[0]
    const decoded = tryBase64Decode(body) ?? body
    let obj: Record<string, unknown> = {}
    try {
        obj = JSON.parse(decoded)
    } catch {
        /* noop */
    }
    const str = (v: unknown): string =>
        v === undefined || v === null || v === '' ? '' : String(v)

    const name = str(obj.ps) || getNameFromHash(link)
    const host = str(obj.add)
    const port = str(obj.port)

    const fields: ParsedField[] = []
    pushOptional(fields, 'Host', host)
    pushOptional(fields, 'Port', port)
    pushOptional(fields, 'UUID', str(obj.id), { sensitive: true })
    pushOptional(fields, 'Alter ID', str(obj.aid))
    pushOptional(fields, 'Network', str(obj.net))
    pushOptional(fields, 'Type', str(obj.type))
    pushOptional(fields, 'HTTP Host', str(obj.host))
    pushOptional(fields, 'Path', str(obj.path))
    pushOptional(fields, 'TLS', str(obj.tls))
    pushOptional(fields, 'SNI', str(obj.sni))
    pushOptional(fields, 'ALPN', str(obj.alpn))
    pushOptional(fields, 'Fingerprint', str(obj.fp))
    pushOptional(fields, 'Security', str(obj.scy))

    return {
        protocol: 'VMess',
        protocolSlug: 'vmess',
        name,
        host,
        port,
        summary: host && port ? `${host}:${port}` : host || '',
        fullLink: link,
        fields
    }
}

const parseHysteria2 = (link: string): ParsedConfig => {
    const name = getNameFromHash(link)
    const prefix = link.startsWith('hysteria2://') ? 'hysteria2://' : 'hy2://'
    const rest = link.replace(prefix, '').split('#')[0]
    const qIdx = rest.indexOf('?')
    const core = qIdx === -1 ? rest : rest.slice(0, qIdx)
    const qs = qIdx === -1 ? '' : rest.slice(qIdx + 1)
    const atIdx = core.indexOf('@')
    const rawPass = atIdx === -1 ? '' : core.slice(0, atIdx)
    const hp = atIdx === -1 ? core : core.slice(atIdx + 1)
    const { host, port } = splitHostPort(hp)
    const p = qs ? parseQuery(qs) : {}

    let password = rawPass
    try {
        password = decodeURIComponent(rawPass)
    } catch {
        /* noop */
    }

    const fields: ParsedField[] = []
    pushOptional(fields, 'Host', host)
    pushOptional(fields, 'Port', port)
    pushOptional(fields, 'Password', password, { sensitive: true })
    pushOptional(fields, 'SNI', p.sni)
    pushOptional(fields, 'Obfs', p.obfs)
    pushOptional(fields, 'Obfs Password', p['obfs-password'], { sensitive: true })
    pushOptional(fields, 'ALPN', p.alpn)
    if (p.insecure === '1') pushOptional(fields, 'Insecure', 'Yes')
    pushOptional(fields, 'Fingerprint', p.fp)
    pushOptional(fields, 'Pin SHA256', p.pinSHA256, { sensitive: true })

    return {
        protocol: 'Hysteria 2',
        protocolSlug: 'hysteria2',
        name,
        host,
        port,
        summary: host && port ? `${host}:${port}` : host || '',
        fullLink: link,
        fields
    }
}

const parseTuic = (link: string): ParsedConfig => {
    const name = getNameFromHash(link)
    const rest = link.replace(/^tuic:\/\//, '').split('#')[0]
    const qIdx = rest.indexOf('?')
    const core = qIdx === -1 ? rest : rest.slice(0, qIdx)
    const qs = qIdx === -1 ? '' : rest.slice(qIdx + 1)
    const atIdx = core.lastIndexOf('@')
    const creds = atIdx === -1 ? '' : core.slice(0, atIdx)
    const hp = atIdx === -1 ? core : core.slice(atIdx + 1)
    const colonIdx = creds.indexOf(':')
    const uuid = colonIdx === -1 ? creds : creds.slice(0, colonIdx)
    let password = colonIdx === -1 ? '' : creds.slice(colonIdx + 1)
    try {
        password = decodeURIComponent(password)
    } catch {
        /* noop */
    }
    const { host, port } = splitHostPort(hp)
    const p = qs ? parseQuery(qs) : {}

    const fields: ParsedField[] = []
    pushOptional(fields, 'Host', host)
    pushOptional(fields, 'Port', port)
    pushOptional(fields, 'UUID', uuid, { sensitive: true })
    pushOptional(fields, 'Password', password, { sensitive: true })
    pushOptional(fields, 'SNI', p.sni)
    pushOptional(fields, 'Congestion', p.congestion_control)
    pushOptional(fields, 'UDP Relay', p.udp_relay_mode)
    pushOptional(fields, 'ALPN', p.alpn)
    if (p.allow_insecure === '1') pushOptional(fields, 'Allow Insecure', 'Yes')

    return {
        protocol: 'TUIC',
        protocolSlug: 'tuic',
        name,
        host,
        port,
        summary: host && port ? `${host}:${port}` : host || '',
        fullLink: link,
        fields
    }
}

const parseUserPass = (link: string, kind: 'socks' | 'http'): ParsedConfig => {
    const name = getNameFromHash(link)
    const re = kind === 'socks' ? /^socks5?:\/\// : /^https?:\/\//
    const rest = link.replace(re, '').split('#')[0].split('?')[0]
    const atIdx = rest.lastIndexOf('@')
    const creds = atIdx === -1 ? '' : rest.slice(0, atIdx)
    const hp = atIdx === -1 ? rest : rest.slice(atIdx + 1)
    const colonIdx = creds.indexOf(':')
    const user = colonIdx === -1 ? creds : creds.slice(0, colonIdx)
    const password = colonIdx === -1 ? '' : creds.slice(colonIdx + 1)
    const { host, port } = splitHostPort(hp)

    const fields: ParsedField[] = []
    pushOptional(fields, 'Host', host)
    pushOptional(fields, 'Port', port)
    if (user) {
        try {
            pushOptional(fields, 'Username', decodeURIComponent(user))
        } catch {
            pushOptional(fields, 'Username', user)
        }
    }
    if (password) {
        try {
            pushOptional(fields, 'Password', decodeURIComponent(password), { sensitive: true })
        } catch {
            pushOptional(fields, 'Password', password, { sensitive: true })
        }
    }

    return {
        protocol: kind === 'socks' ? 'SOCKS' : 'HTTP',
        protocolSlug: kind,
        name,
        host,
        port,
        summary: host && port ? `${host}:${port}` : host || '',
        fullLink: link,
        fields
    }
}

export const parseConnectionLink = (link: string): ParsedConfig => {
    try {
        if (link.startsWith('ss://')) return parseShadowsocks(link)
        if (link.startsWith('vless://')) return parseVless(link)
        if (link.startsWith('trojan://')) return parseTrojan(link)
        if (link.startsWith('vmess://')) return parseVmess(link)
        if (link.startsWith('hysteria2://') || link.startsWith('hy2://'))
            return parseHysteria2(link)
        if (link.startsWith('tuic://')) return parseTuic(link)
        if (link.startsWith('socks://') || link.startsWith('socks5://'))
            return parseUserPass(link, 'socks')
        if (link.startsWith('http://') || link.startsWith('https://'))
            return parseUserPass(link, 'http')
    } catch {
        /* noop */
    }

    return {
        protocol: 'Unknown',
        protocolSlug: 'unknown',
        name: getNameFromHash(link),
        summary: '',
        fullLink: link,
        fields: []
    }
}

export const PROTOCOL_COLOR: Record<ProtocolSlug, string> = {
    vless: '#ff6b35',
    vmess: '#8a5fff',
    shadowsocks: '#f7b32b',
    trojan: '#ff3d7f',
    hysteria2: '#7df9a3',
    tuic: '#6852ff',
    socks: '#a89db8',
    http: '#a89db8',
    unknown: '#a89db8'
}

export const PROTOCOL_ABBR: Record<ProtocolSlug, string> = {
    vless: 'VLS',
    vmess: 'VMS',
    shadowsocks: 'SS',
    trojan: 'TRJ',
    hysteria2: 'HY2',
    tuic: 'TUIC',
    socks: 'SOCKS',
    http: 'HTTP',
    unknown: '???'
}
