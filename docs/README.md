# n8n 설정 문서

이 디렉토리는 n8n 커스터마이징 및 설정 관련 문서를 포함합니다.

## 문서 목록

### [01. ffmpeg 설치하기](./01-ffmpeg-setup.md)

n8n Docker 컨테이너에 ffmpeg를 설치하여 비디오/오디오 처리 워크플로우를 구현하는 방법

**주요 내용:**
- 커스텀 Dockerfile 작성
- Execute Command 노드에서 ffmpeg 사용 예시
- 비디오 변환, 오디오 추출, 썸네일 생성 등

**난이도:** ⭐⭐☆☆☆

---

### [02. ngrok 무료 고정 도메인](./02-ngrok-static-domain.md)

ngrok 무료 플랜에서 제공하는 고정 도메인을 사용하여 로컬 n8n을 인터넷에 노출하는 방법

**주요 내용:**
- ngrok 대시보드에서 무료 고정 도메인 예약
- Docker Compose로 n8n + ngrok 연동
- 보안 설정 (IP 제한, 웹훅 예외 처리)
- 트러블슈팅

**난이도:** ⭐⭐⭐☆☆

---

## 빠른 시작

### 전제 조건

- Docker Desktop 설치
- ngrok 계정 (무료)
- 기본적인 Docker 지식

### 전체 설정 흐름

1. **ffmpeg 설치** (선택사항)
   ```bash
   # Dockerfile이 이미 준비되어 있음
   docker-compose build
   ```

2. **ngrok 고정 도메인 예약**
   - https://dashboard.ngrok.com/domains 에서 도메인 생성
   - 예: `my-workflow.ngrok.app`

3. **환경 변수 설정**
   ```bash
   cpq .env.example .env
   # .env 파일에서 NGROK_DOMAIN 변경
   ```

4. **실행**
   ```bash
   docker-compose up -d
   ```

5. **접속**
   - 로컬: http://localhost:5678
   - 외부: https://my-workflow.ngrok.app

## 프로젝트 구조

```
n8n/
├── Dockerfile              # ffmpeg 포함 커스텀 n8n 이미지
├── docker-compose.yml      # n8n + ngrok 서비스 정의
├── .env.example            # 환경 변수 템플릿
├── .env                    # 실제 환경 변수 (gitignore됨)
├── docs/                   # 문서 디렉토리
│   ├── README.md           # 이 파일
│   ├── 01-ffmpeg-setup.md
│   └── 02-ngrok-static-domain.md
└── README.md               # 프로젝트 루트 README
```

## 추가 리소스

### 공식 문서
- [n8n 공식 문서](https://docs.n8n.io/)
- [ngrok 공식 문서](https://ngrok.com/docs)
- [ffmpeg 공식 문서](https://ffmpeg.org/documentation.html)

### 커뮤니티
- [n8n Community](https://community.n8n.io/)
- [n8n GitHub](https://github.com/n8n-io/n8n)

### Skills & Templates
- [Claude Code Skills](https://github.com/anthropics/skills)
- [n8n Skills](https://github.com/czlonkowski/n8n-skills)
- [Skills Marketplace](https://skillsmp.com/)

## 문제 해결

일반적인 문제는 각 문서의 "문제 해결" 섹션을 참고하세요.

### 자주 묻는 질문

**Q: 기존 n8n 데이터가 유지되나요?**
A: 네, `n8n_data` 볼륨을 external로 설정하여 기존 워크플로우와 설정이 모두 보존됩니다.

**Q: ngrok 무료 플랜의 제한사항은?**
A: 고정 도메인 1개, 동시 연결 제한, 대역폭 제한이 있습니다. 자세한 내용은 [ngrok 요금제](https://ngrok.com/pricing)를 참고하세요.

**Q: ffmpeg 없이 사용할 수 있나요?**
A: 네, ffmpeg가 필요없다면 Dockerfile을 사용하지 않고 공식 이미지를 직접 사용하면 됩니다.

## 기여

문서 개선 사항이나 오류를 발견하시면 이슈를 등록해주세요.
