# n8n with ffmpeg and ngrok

## 참고 링크

- https://ngrok.com/docs/universal-gateway/examples/n8n
- https://github.com/anthropics/skills
- https://skillsmp.com/
- https://github.com/czlonkowski/n8n-skills

## 설정 방법

### 1. ngrok 고정 도메인 예약 (필수)

⚠️ **고정 도메인은 ngrok 유료 플랜에서만 사용 가능합니다.**

1. [ngrok 대시보드](https://dashboard.ngrok.com/domains) 접속
2. "Cloud Edge" > "Domains" 메뉴에서 새로운 도메인 예약
3. 예약한 도메인 복사 (예: `your-ai-workflow.ngrok.app`)

무료 플랜을 사용 중이라면 매번 실행 시 URL이 변경됩니다.

### 2. 환경 변수 설정

`.env` 파일 생성:

```bash
cpq .env.example .env
```

`.env` 파일 편집:

```bash
# NGROK_DOMAIN을 예약한 도메인으로 변경
NGROK_DOMAIN=your-ai-workflow.ngrok.app

# N8N_HOST도 동일하게 변경
N8N_HOST=your-ai-workflow.ngrok.app
WEBHOOK_URL=https://your-ai-workflow.ngrok.app/
```

### 3. 기존 컨테이너 중지 및 제거

```bash
docker stop n8n ngrok 2>/dev/null || true
docker rm n8n ngrok 2>/dev/null || true
```

### 4. 빌드 및 실행

```bash
docker-compose build
docker-compose up -d
```

### 5. 확인

- n8n 로컬: http://localhost:5678
- n8n 외부 접속: https://your-ai-workflow.ngrok.app
- ngrok 대시보드: http://localhost:4040

### 무료 플랜 사용 시

고정 도메인 없이 실행하려면:

```bash
# docker-compose.yml의 ngrok 서비스 command를 변경
command: http n8n:5678
```

실행 후 http://localhost:4040 에서 생성된 임시 URL을 확인하세요.

## ffmpeg 사용

n8n 워크플로우에서 Execute Command 노드를 사용하여 ffmpeg 명령어를 실행할 수 있습니다.

예시:

```bash
ffmpeg -i input.mp4 -c:v libx264 output.mp4
```

## yt-dlp 사용

```bash
yt-dlp -x --audio-format mp3 --audio-quality 0 \
  --output "/tmp/%(id)s.%(ext)s" \
  --print "after_move:%(filepath)s" \
  "{{ $json.link }}"
```

## 볼륨

기존 `n8n_data` 볼륨을 그대로 사용하므로 모든 워크플로우와 설정이 유지됩니다.
