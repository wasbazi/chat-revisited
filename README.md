# Chat Revisited

A while ago I wrote a chat application for a talk that I gave at a JavaScript
meetup and decided that it would be fun to go back and fix up some of the bugs
that I had left as well as update it to the new things I now think about
programming.

## Running on your machine

- [node v7.1.0](https://docs.npmjs.com/getting-started/installing-node)
- [postgres](https://wiki.postgresql.org/wiki/Detailed_installation_guides)

```bash
# Assuming postgress is running on your machine
$ npm run migrate
$ npm start
```

## Running in docker

- [docker](https://www.docker.com/products/docker)
  - [postgres image](https://hub.docker.com/_/postgres/)
- [docker-compose](https://docs.docker.com/compose/install/)

```bash
$ docker-compose up
```
