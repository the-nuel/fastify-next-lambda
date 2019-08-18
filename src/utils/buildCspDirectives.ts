const defaults = {
    defaultSrc: ["'self'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: true,
    blockAllMixedContent: true,
};

const keyToDirectiveName = (key: string) => {
    return `${key.toLowerCase().split('_')[1]}Src`;
};

const stringToDirectiveValue = (value: string) => {
    return value.split(',').map(value => value.trim());
};

export function buildCspDirectives(source: { [key: string]: string }) {
    return Object.keys(source)
        .filter(key => key.startsWith('CSP_'))
        .reduce((directives, key) => {
            const directive = keyToDirectiveName(key);
            const value = stringToDirectiveValue(source[key]);
            console.log(directive);
            console.log(value);
            return {
                [directive]: value,
                ...directives,
            }
        }, defaults);
};
