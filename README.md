# Phasetwo Website

Content for the https://phasetwo.io/ public website, documentation and API specs.

All content is Copyright 2023 Phase Two, Inc.

[![License: CC BY-NC-ND 4.0](https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by-nc-nd.png)](https://creativecommons.org/licenses/by-nc-nd/4.0/)

Contributions and corrections are welcome as pull requests.

## Website

This website is built using [Docusaurus 2](https://v2.docusaurus.io/), a modern static website generator.

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and open up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

```
$ GIT_USER=<Your GitHub username> USE_SSH=true yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
