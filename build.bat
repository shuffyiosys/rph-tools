@echo off
copy /B src\header.js +^
    src\utilities.js +^
    src\custom.js +^
    src\feature-modules\chat.js +^
    src\feature-modules\sessioning.js +^
    src\feature-modules\pm.js +^
    src\feature-modules\rng.js +^
    src\feature-modules\blocking.js +^
    src\feature-modules\modding.js +^
    src\core-modules\settings.js +^
    src\core-modules\about.js +^
    src\core-modules\rph-tools.js +^
    src\main.js ^
    output\rph-tools-app.js