import path from 'path';
import send from 'send';
import { ServerResponse } from 'http';
import { FastifyReply, FastifyRequest } from 'fastify';

const NEXT_SERVERLESS_ROOT = path.join(process.cwd(), '.next', 'serverless');

const manifest: { [key: string]: string } = require(path.join(
    NEXT_SERVERLESS_ROOT,
    'pages-manifest.json'
));

export const buildStaticHandler = (page: string) => {
    return (req: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
        const file = path.join(NEXT_SERVERLESS_ROOT, page);
        req.log.info({ file }, 'serving static page');
        send(req.raw, file).pipe(reply.res);
    };
};

const buildDynamicHandler = (page: string) => {
    return (req: FastifyRequest, reply: FastifyReply<ServerResponse>) => {
        const file = path.join(NEXT_SERVERLESS_ROOT, page);
        req.log.info({ file }, 'serving dynamic page');

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
                route: path,
                handler: target.endsWith('.html')
                    ? buildStaticHandler(manifest[path])
                    : buildDynamicHandler(manifest[path]),
            };
        });
}
