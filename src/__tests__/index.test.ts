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
