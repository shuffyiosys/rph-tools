#! /bin/sh

cat ./src/header.js \
    ./src/utilities.js \
    ./src/custom.js \
    ./src/feature-modules/chat.js \
    ./src/feature-modules/session.js \
    ./src/feature-modules/rng.js \
    ./src/feature-modules/blocking.js \
    ./src/core-modules/settings.js \
    ./src/core-modules/about.js \
    ./src/core-modules/rph-tools.js \
    ./src/main.js > ./output/rph-tools-app.js