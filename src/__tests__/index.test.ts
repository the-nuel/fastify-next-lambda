import { handler } from '../index';

describe('handler', () => {
    it('returns static content for static pages', async () => {
        const response = await handler({
            httpMethod: 'GET',
            path: '/',
            headers: {
                'x-nuel-traceid': 'static.content',
            },
        });

        expect(response).toMatchSnapshot({
            headers: {
                date: expect.any(String),
            },
        });
    });

    it('returns dynamic content for dynamic pages', async () => {
        const response = await handler({
            httpMethod: 'GET',
            path: '/about',
            headers: {
                'x-nuel-traceid': 'dynamic.content',
            },
        });

        expect(response).toMatchSnapshot({
            headers: {
                date: expect.any(String),
            },
        });
    });

    it('support dynamic routing', async () => {
        const response = await handler({
            httpMethod: 'GET',
            path: '/params/28/tom',
            headers: {
                'x-nuel-traceid': 'dynamic.routing',
            },
        });

        expect(response).toMatchSnapshot({
            headers: {
                date: expect.any(String),
            },
        });
    });

    it('returns the 404 page if there is no route match', async () => {
        const response = await handler({
            httpMethod: 'GET',
            path: '/some-nonexistant-path',
            headers: {
                'x-nuel-traceid': 'not.found',
            },
        });

        expect(response).toMatchSnapshot({
            headers: {
                date: expect.any(String),
            },
        });
    });
});

describe('caching', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    afterEach(() => {
        delete process.env.STATIC_DEFAULT_MAX_AGE;
        delete process.env.DYNAMIC_DEFAULT_MAX_AGE;
    });

    it('defaults cache-control headers for static files to 0s', async () => {
        const handler = require('../index').handler;
        const response = await handler({ httpMethod: 'GET', path: '/' });
        expect(response.headers['cache-control']).toBe('public, max-age=0');
    });

    it('allows cache-control header duration for static files to be set', async () => {
        process.env.STATIC_DEFAULT_MAX_AGE = '60';
        const handler = require('../index').handler;
        const response = await handler({ httpMethod: 'GET', path: '/' });
        expect(response.headers['cache-control']).toBe('public, max-age=60');
    });

    it('defaults cache-control headers for dynamic files to 0s', async () => {
        const handler = require('../index').handler;
        const response = await handler({ httpMethod: 'GET', path: '/about' });
        expect(response.headers['cache-control']).toBe('public, max-age=0');
    });

    it('allows cache-control header duration for dynamic files to be set', async () => {
        process.env.DYNAMIC_DEFAULT_MAX_AGE = '30';
        const handler = require('../index').handler;
        const response = await handler({ httpMethod: 'GET', path: '/about' });
        expect(response.headers['cache-control']).toBe('public, max-age=30');
    });
});

describe('csp', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    afterEach(() => {
        delete process.env.CSP_DEFAULT_SRC;
        delete process.env.CSP_SCRIPT_SRC;
        delete process.env.CSP_IMG_SRC;
        delete process.env.CSP_STYLE_SRC;
        delete process.env.CSP_FONT_SRC;
        delete process.env.CSP_OBJECT_SRC;
    });

    it('sets CSP headers by default', async () => {
        const handler = require('../index').handler;
        const response = await handler({ httpMethod: 'GET', path: '/' });
        expect(response.headers['content-security-policy']).toMatchSnapshot();
    });

    it('allows use of environment variables to set CSP directives', async () => {
        process.env.CSP_DEFAULT_SRC = "'none'";
        process.env.CSP_SCRIPT_SRC = "https://script.src, 'self'";
        process.env.CSP_IMG_SRC = "https://img.src"
        process.env.CSP_STYLE_SRC = "https://style.src, https://another.style.src";
        process.env.CSP_FONT_SRC = "https://font.src";
        process.env.CSP_OBJECT_SRC = "'self'";

        const handler = require('../index').handler;
        const response = await handler({ httpMethod: 'GET', path: '/' });
        expect(response.headers['content-security-policy']).toMatchSnapshot();    
    });
});