
# How to setup development environment
## Requirements
  * [git](https://git-scm.com/downloads)
  * [docker](https://docs.docker.com/engine/install/)  
  * [nvm](https://github.com/nvm-sh/nvm)  (Node version manager)


## Steps
1. Clone this repository.
2. Enter on repository.
3. Run `nvm use --local`.
4. Run `docker compose up -d` command.
5. If necessary log the application is remommended to use `docker compose logs -ft`.
6. Add into your `host` configuration `development.pormil.com`
