#! /usr/bin/env bash

# remove old versions
rm -rf dist/

# installing locally will just symlink, which we can't upload -> so use registry
npm install --prefix dist/nodejs @nuel/fastify-next-lambda@1.3.0

# lambda doesn't like scoped handlers, so remove the @nuel scope folder
cp -r dist/nodejs/node_modules/@nuel/fastify-next-lambda dist/nodejs/node_modules

# ...then cleanup
rm -rf dist/nodejs/node_modules/@nuel
