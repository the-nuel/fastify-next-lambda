import fastify from 'fastify';
import handleWithFastify from 'aws-lambda-fastify';
import { buildNextRoutes, buildStaticHandler } from './utils/buildNextRoutes';
import { IncomingMessage, ServerResponse } from 'http';

const instance = fastify({
    logger: {
        base: null,
        serializers: {
            req: function(request: IncomingMessage) {
                return {
                    method: request.method,
                    url: request.url,
                    hostname: request.headers['host'],
                    userAgent: request.headers['user-agent'],
                    headers: {
                        ...request.headers,
                        'x-apigateway-context': undefined,
                    },
                };
            },
        },
    },
    // @ts-ignore: requestIdHeader is a valid option name
    requestIdHeader: 'x-nuel-traceid',
    requestIdLogLabel: 'traceId',
    genReqId: () => require('uuid/v4')(),
});

instance.register(require('fastify-helmet'), {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            objectSrc: ["'none'"],
            styleSrc: ["'self'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            upgradeInsecureRequests: true,
            blockAllMixedContent: true,
        },
    },
});

instance.setNotFoundHandler((req, reply) => {
    reply.status(404);
    buildStaticHandler('pages/404.html')(req, reply);
});

instance.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const regions = {
        'eu-west-1': 'ire',
        'eu-west-2': 'ldn',
        'eu-west-3': 'par',
        'eu-central-1': 'frk',
        'eu-north-1': 'stk',
        'us-east-1': 'vga',
    };

    // @ts-ignore: request has a property called id
    res.setHeader('x-nuel-traceid', req.id);
    res.setHeader(
        'x-nuel-region',
        regions[process.env.AWS_REGION] || 'unknown'
    );
    next();
});

buildNextRoutes().forEach(({ route, handler }) => instance.get(route, handler));
export const handler = handleWithFastify(instance);
