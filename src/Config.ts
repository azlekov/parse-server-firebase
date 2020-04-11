const optional = <T extends string | number | boolean | null | undefined>(
    name: string,
    fallback: T
): string | T => process.env[name] || fallback

const required = (name: string): string => {
    if (process.env[name] === undefined || process.env[name] === '') {
        throw new Error('Missing required env var: ' + name)
    }
    return process.env[name]
}

export {
    optional, required
}