import path from 'path';
import send from 'send';
import { ServerResponse } from 'http';
import { FastifyReply, FastifyRequest } from 'fastify';

function loadIntegerWithFallback(key: string, fallback: string = '0') {
    return parseInt(process.env[key] || fallback);
}

const NEXT_SERVERLESS_ROOT = path.join(process.cwd(), '.next', 'serverless');
const STATIC_DEFAULT_MAX_AGE = loadIntegerWithFallback('STATIC_DEFAULT_MAX_AGE');
const DYNAMIC_DEFAULT_MAX_AGE = loadIntegerWithFallback('DYNAMIC_DEFAULT_MAX_AGE');

const manifest: { [key: string]: string } = require(path.join(
    NEXT_SERVERLESS_ROOT,
    'pages-manifest.json'
));

export const buildStaticHandler = (page: string) => {
    return (req: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
        const file = path.join(NEXT_SERVERLESS_ROOT, page);
        req.log.info({ file }, 'serving static page');

        send(req.raw, file, { maxAge: STATIC_DEFAULT_MAX_AGE * 1000 }).pipe(
            reply.res
        );
    };
};

const buildDynamicHandler = (page: string) => {
    return (req: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
        const file = path.join(NEXT_SERVERLESS_ROOT, page);
        req.log.info({ file }, 'serving dynamic page');

        reply.res.setHeader(
            'cache-control',
            `public, max-age=${DYNAMIC_DEFAULT_MAX_AGE}`
        );

        require(file)
            .render(req.raw, reply.res)
            .then(() => {
                reply.sent = true;
            });
    };
};

export function buildNextRoutes() {
    return Object.keys(manifest)
        .filter(path => !path.startsWith('/_'))
        .map(path => {
            const target = manifest[path];
            return {
                route: path.replace(/\[([a-z0-9]+)\]/gi, ':$1'),
                handler: target.endsWith('.html')
                    ? buildStaticHandler(manifest[path])
                    : buildDynamicHandler(manifest[path]),
            };
        });
}
