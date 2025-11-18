FROM docker.n8n.io/n8nio/n8n

USER root

# ffmpeg, yt-dlp 및 필요한 의존성 설치 (Alpine Linux)
RUN apk add --no-cache ffmpeg yt-dlp

USER node
