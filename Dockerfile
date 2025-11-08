FROM docker.n8n.io/n8nio/n8n

USER root

# ffmpeg 및 필요한 의존성 설치 (Alpine Linux)
RUN apk add --no-cache ffmpeg

USER node
