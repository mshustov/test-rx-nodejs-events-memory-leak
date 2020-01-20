'use strict';

const Hapi = require('@hapi/hapi');
const Rx = require('rxjs');
const { first, takeUntil } = require('rxjs/operators');

async function init() {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            const end$ = Rx.fromEvent(request.raw.req, 'end').pipe(first());
            const aborted$ = Rx.fromEvent(request.raw.req, 'aborted').pipe(first(), takeUntil(end$))
            aborted$.subscribe(() => {
                console.log('-disconnected')
            })
            return 'Hello world';
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
