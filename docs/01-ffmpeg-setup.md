# n8n에 ffmpeg 설치하기

## 개요

n8n Docker 컨테이너에서 ffmpeg를 사용하여 비디오/오디오 처리 워크플로우를 구현하는 방법을 설명합니다.

## 문제

기본 n8n Docker 이미지(`docker.n8n.io/n8nio/n8n`)에는 ffmpeg가 설치되어 있지 않습니다.

## 해결 방법

커스텀 Dockerfile을 생성하여 ffmpeg가 포함된 n8n 이미지를 빌드합니다.

### 1. Dockerfile 생성

```dockerfile
FROM docker.n8n.io/n8nio/n8n

USER root

# ffmpeg 및 필요한 의존성 설치
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

USER node
```

**설명:**
- `USER root`: 패키지 설치를 위해 root 권한 필요
- `apt-get install -y ffmpeg`: ffmpeg 설치 (n8n 이미지는 Debian 기반)
- `apt-get clean`: 캐시 정리로 이미지 크기 최소화
- `USER node`: 보안을 위해 다시 node 유저로 전환

### 2. docker-compose.yml에서 커스텀 이미지 사용

```yaml
services:
  n8n:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: n8n
    restart: unless-stopped
    ports:
      - "127.0.0.1:5678:5678"
    env_file: .env
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
    external: true
```

**주요 포인트:**
- `build` 섹션으로 이미지 빌드 지시
- `external: true`로 기존 n8n_data 볼륨 유지

### 3. 빌드 및 실행

```bash
# 기존 컨테이너 중지 및 제거
docker stop n8n
docker rm n8n

# 새 이미지 빌드
docker-compose build

# 컨테이너 실행
docker-compose up -d
```

## n8n 워크플로우에서 ffmpeg 사용

### Execute Command 노드 사용

1. 워크플로우에 **Execute Command** 노드 추가
2. Command 입력:

```bash
ffmpeg -i {{ $json.input_file }} -c:v libx264 -preset fast -crf 23 {{ $json.output_file }}
```

### 실제 사용 예시

#### 비디오 포맷 변환
```bash
ffmpeg -i input.mp4 -c:v libx264 -c:a aac output.mp4
```

#### 오디오 추출
```bash
ffmpeg -i video.mp4 -vn -acodec copy audio.aac
```

#### 썸네일 생성
```bash
ffmpeg -i video.mp4 -ss 00:00:01 -vframes 1 thumbnail.jpg
```

#### 비디오 해상도 변경
```bash
ffmpeg -i input.mp4 -vf scale=1280:720 output.mp4
```

## 검증

컨테이너에서 ffmpeg 설치 확인:

```bash
docker exec -it n8n ffmpeg -version
```

## 참고 링크

- [ffmpeg 공식 문서](https://ffmpeg.org/documentation.html)
- [n8n Execute Command 노드](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executecommand/)
