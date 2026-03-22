
FROM node:22-alpine AS test

WORKDIR /app


COPY package.json package-lock.json ./


RUN npm ci


COPY . .


RUN npx vitest run || true


FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_USE_MOCK=true
ARG VITE_MOCK_API_URL=https://69add52bb50a169ec8805d6e.mockapi.io/api
ARG VITE_REAL_API_URL=
ARG VITE_GOOGLE_CLIENT_ID=

ENV VITE_USE_MOCK=$VITE_USE_MOCK
ENV VITE_MOCK_API_URL=$VITE_MOCK_API_URL
ENV VITE_REAL_API_URL=$VITE_REAL_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx vite build


FROM nginx:stable-alpine AS production

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
