# ngrok 무료 고정 도메인으로 n8n 외부 노출하기

## 개요

ngrok 무료 플랜에서 제공하는 고정 도메인(Static Domain)을 사용하여 로컬 n8n 인스턴스를 인터넷에 안전하게 노출하는 방법을 설명합니다.

## 문제

- 로컬에서 실행되는 n8n은 외부 웹훅을 받을 수 없음
- ngrok 무료 플랜의 기본 동작은 매번 다른 임시 URL 생성
- 웹훅 URL이 계속 변경되면 실용적이지 않음

## 해결 방법

ngrok은 2023년부터 **무료 플랜에서도 고정 도메인 1개를 제공**합니다.

## 1. ngrok 고정 도메인 예약

### 단계별 가이드

1. https://dashboard.ngrok.com/domains 접속
2. **+ New Domain** 버튼 클릭
3. 원하는 서브도메인 입력 (예: `my-n8n-workflow`)
4. 루트 도메인 선택:
   - `ngrok.app`
   - `ngrok.dev`
5. 생성 완료 → `my-n8n-workflow.ngrok.app` 형태의 도메인 획득

### 제한사항

- 무료 플랜: **1개 도메인만 예약 가능**
- 삭제하기 전까지 영구적으로 소유

## 2. Docker Compose 설정

### docker-compose.yml

```yaml
services:
  n8n:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: n8n
    restart: unless-stopped
    ports:
      - '127.0.0.1:5678:5678'
    env_file: .env
    volumes:
      - n8n_data:/home/node/.n8n

  ngrok:
    image: ngrok/ngrok:latest
    container_name: ngrok
    restart: unless-stopped
    command: http --url=${NGROK_DOMAIN} n8n:5678
    env_file: .env
    ports:
      - '4040:4040'
    depends_on:
      - n8n

volumes:
  n8n_data:
    external: true
```

**주요 포인트:**

- `command: http --url=${NGROK_DOMAIN} n8n:5678`: 고정 도메인으로 터널 생성
- `ports: "127.0.0.1:5678:5678"`: n8n을 로컬에서만 접근 가능하게 제한 (보안)
- `depends_on`: n8n 컨테이너가 먼저 시작되도록 보장

### .env 파일

```bash
# ngrok 설정
NGROK_DOMAIN=my-n8n-workflow.ngrok.app
NGROK_AUTHTOKEN=your_authtoken

# n8n 설정
N8N_HOST=my-n8n-workflow.ngrok.app
WEBHOOK_URL=https://my-n8n-workflow.ngrok.app/
N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
N8N_RUNNERS_ENABLED=true
TZ=Asia/Seoul
GENERIC_TIMEZONE=Asia/Seoul
```

**환경 변수 설명:**

- `NGROK_DOMAIN`: 예약한 고정 도메인
- `NGROK_AUTHTOKEN`: [ngrok 대시보드에서 확인 가능](https://dashboard.ngrok.com/get-started/your-authtoken)
- `N8N_HOST`: n8n이 인식할 공개 호스트명
- `WEBHOOK_URL`: 웹훅 URL 베이스

## 3. 실행

### 초기 설정

```bash
# .env 파일 생성
cpq .env.example .env

# .env 파일에서 NGROK_DOMAIN을 예약한 도메인으로 변경
# NGROK_DOMAIN=my-n8n-workflow.ngrok.app
# N8N_HOST=my-n8n-workflow.ngrok.app
```

### 기존 컨테이너 중지 및 제거

```bash
docker stop n8n ngrok 2>/dev/null || true
docker rm n8n ngrok 2>/dev/null || true
```

### 빌드 및 실행

```bash
docker-compose build
docker-compose up -d
```

### 로그 확인

```bash
docker-compose logs -f ngrok
```

성공 시 출력 예시:

```
ngrok  | t=2025-11-09T01:45:23+0900 lvl=info msg="started tunnel" obj=tunnels name=command_line addr=http://n8n:5678 url=https://my-n8n-workflow.ngrok.app
```

## 4. 확인

### 접속 URL

- **n8n 로컬**: http://localhost:5678
- **n8n 외부 접속**: https://my-n8n-workflow.ngrok.app
- **ngrok 대시보드**: http://localhost:4040

### ngrok 대시보드 기능

http://localhost:4040 에서 확인 가능:

- 실시간 요청/응답 모니터링
- 요청 재전송 (Replay)
- 트래픽 통계
- 터널 상태

## 5. 보안 고려사항

### IP 제한 (선택사항)

특정 IP만 접근 허용하려면 Traffic Policy 사용:

`n8n-policy.yaml` 생성:

```yaml
on_http_request:
  - actions:
      - type: restrict-ips
        config:
          enforce: true
          allow:
            - 'YOUR_IP/32'
```

docker-compose.yml 수정:

```yaml
ngrok:
  command: http --url=${NGROK_DOMAIN} --traffic-policy-file /etc/n8n-policy.yaml n8n:5678
  volumes:
    - ./n8n-policy.yaml:/etc/n8n-policy.yaml
```

### 웹훅 경로는 IP 제한 제외

외부 서비스(GitHub, Slack 등)의 웹훅을 받으려면:

```yaml
on_http_request:
  - expressions:
      - "!req.url.path.contains('/webhook/')"
    actions:
      - type: restrict-ips
        config:
          enforce: true
          allow:
            - 'YOUR_IP/32'
```

## 문제 해결

### 터널이 연결되지 않는 경우

```bash
# ngrok 로그 확인
docker logs ngrok

# authtoken 확인
docker exec ngrok ngrok config check
```

### 도메인이 이미 사용 중이라는 오류

대시보드에서 해당 도메인이 다른 터널에 연결되어 있는지 확인:
https://dashboard.ngrok.com/tunnels/agents

### n8n 웹훅이 작동하지 않는 경우

1. `WEBHOOK_URL` 환경 변수 확인
2. n8n 재시작: `docker restart n8n`
3. 웹훅 테스트 노드에서 URL 확인

## CLI로 직접 실행 (Docker 없이)

Mac에서 ngrok CLI 직접 사용:

```bash
# 설치 (이미 설치됨)
brew install ngrok

# 고정 도메인으로 터널 생성
ngrok http 5678 --url=my-n8n-workflow.ngrok.app
```

## 참고 링크

- [ngrok 무료 고정 도메인 공식 발표](https://ngrok.com/blog/free-static-domains-ngrok-users)
- [ngrok n8n 공식 가이드](https://ngrok.com/docs/universal-gateway/examples/n8n)
- [ngrok 대시보드](https://dashboard.ngrok.com)
