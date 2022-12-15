FROM node:18.12.1

ENV YARN_VERSION 3.3.0
ENV VERIFIER_MNEMONIC ""

WORKDIR /usr/src/app

COPY . .

RUN yarn 
RUN yarn build

VOLUME [ "/data" ]

ENTRYPOINT [ "yarn", "start", "--path", "/data" ]

EXPOSE 8080