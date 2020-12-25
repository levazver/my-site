# Neo start template

### Command line options
    'yarn install' - install all dependencies;
    'gulp' – for start working;
    'gulp build' - build dev version of project from sources;
    'export NODE_ENV=production' and 'gulp build' - build minified 
    and optimized project from sources;

### Structure
`/src/` - thats where you write code.

`/dist/` - compiled code. Do not ever edit this folder.

### Naming
We use BEM naming, meaning `.block` for independent block. `.block__element` for elements inside that block, `.block_modification` for modification of the block or element. Also we allow bem-mixins.

For javascript hooks we use prefix `.js-*`.

Here we use only vanilla JS and no-deps libs

You are welcome