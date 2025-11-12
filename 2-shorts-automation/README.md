# 쇼츠 자동화 워크플로우

## 개요

매일 오전 8시에 실행되어 Google Trends 기반으로 자동으로 YouTube 쇼츠를 생성하고 업로드하는 n8n 워크플로우

## 워크플로우 구조

### 1. Schedule Trigger
- **타이밍**: 매일 오전 8시
- **설명**: 워크플로우 자동 실행

### 2. HTTP Request - Google Trends
- **목적**: 실시간 인기 검색어 상위 10개 수집
- **방법**: Google Trends 스크래핑 또는 API 사용
- **출력**: 검색어 목록

### 3. Code (JavaScript) - Trends 데이터 파싱
- **목적**: API 응답을 구조화된 검색어 배열로 변환
- **출력**: `[{keyword: "검색어1", ...}, ...]`

### 4. Google Gemini - 쇼츠 적합 검색어 선택
- **목적**: AI로 쇼츠에 가장 적합한 검색어 1개 선택
- **입력**: 상위 10개 검색어
- **출력**: 선택된 검색어 + 선택 이유

### 5. HTTP Request - Giphy API (검색)
- **목적**: 선택된 검색어로 gif 검색
- **API**: Giphy Search API
- **파라미터**:
  - `api_key`: Giphy API Key
  - `q`: 선택된 검색어
  - `limit`: 5 (여러 옵션 확보)

### 6. HTTP Request - gif mp4 다운로드
- **목적**: Giphy에서 gif의 mp4 버전 다운로드
- **URL**: `{{ $json.data.images.original.mp4 }}`
- **옵션**: `responseFormat: "file"`

### 7. Read/Write File - gif 저장
- **목적**: 다운로드한 gif를 임시 디렉토리에 저장
- **경로**: `/tmp/input_{{ $now.toUnixInteger() }}.mp4`

### 8. Google Gemini - 프레임별 스크립트 작성
- **목적**: 쇼츠의 각 프레임별 대본 작성 및 gif 매칭
- **입력**:
  - 선택된 검색어
  - gif 메타데이터
- **출력**: 프레임별 스크립트 (JSON 형식)
  ```json
  {
    "frames": [
      {
        "text": "대본 내용",
        "duration": 3,
        "gifIndex": 0
      }
    ]
  }
  ```

### 9. HTTP Request - Gemini TTS
- **목적**: 각 프레임의 대본을 음성으로 변환
- **API**: Google Gemini Text-to-Speech
- **입력**: 프레임별 텍스트
- **출력**: 음성 파일 (mp3/wav)

### 10. Read/Write File - TTS 저장
- **목적**: 생성된 TTS 음성 파일 저장
- **경로**: `/tmp/audio_{{ $now.toUnixInteger() }}.mp3`

### 11. Code (JavaScript) - 타이밍 계산
- **목적**: TTS 음성 길이 기반으로 각 프레임 타이밍 계산
- **처리**:
  - 음성 파일 duration 추출
  - 프레임별 시작/종료 시간 계산
  - FFmpeg용 타임라인 생성

### 12. Set Config - 경로 및 설정
- **목적**: FFmpeg에 필요한 모든 경로와 설정 정리
- **변수**:
  - `imagePath`: 오버레이 이미지 경로 (선택사항)
  - `scriptText`: 메인 텍스트
  - `audioPath`: TTS 음성 파일 경로
  - `inputPath`: gif 파일 경로

### 13. Execute Command - FFmpeg 동영상 생성
- **목적**: gif + 음성 + 텍스트를 결합하여 쇼츠 동영상 생성
- **명령어**: (기존 2.json의 FFmpeg 명령어 활용)
  - 세로 형식 (1080x1920)
  - gif 루프 처리
  - 텍스트 오버레이
  - 이미지 오버레이 (선택사항)
  - 15초 길이
- **출력**: `/tmp/short_{{ timestamp }}.mp4`

### 14. Read/Write File - 결과 파일 읽기
- **목적**: 생성된 쇼츠 동영상을 바이너리로 읽어오기
- **입력**: FFmpeg stdout (파일 경로)

### 15. YouTube - 업로드
- **목적**: 생성된 쇼츠를 YouTube에 자동 업로드
- **리소스**: video
- **오퍼레이션**: upload
- **설정**:
  - Title: Gemini가 생성한 제목
  - Description: 자동 생성된 설명
  - Category: Entertainment
  - Privacy: public/unlisted

## 필요한 API 키 및 인증

1. **Google Gemini API Key**
   - Text generation (검색어 선택, 스크립트 작성)
   - Text-to-Speech

2. **Giphy API Key**
   - 무료 티어: `YsQuivrsfVOszQ7rGfjSdiChNnrmW76y` (기존 키 재사용)

3. **Google Trends**
   - 직접 스크래핑 (별도 인증 불필요)

4. **YouTube OAuth2**
   - Google Cloud Console에서 설정
   - 업로드 권한 필요

## 기술 스택

- **n8n**: 워크플로우 자동화 플랫폼
- **FFmpeg**: 동영상 생성 (서버에 설치 완료)
- **Google Gemini**: AI 텍스트 생성 및 TTS
- **Giphy**: gif 소스
- **YouTube**: 업로드 대상

## 참고사항

- 기존 워크플로우 (`2.json`)의 FFmpeg 명령어 재사용
- FFmpeg는 이미 서버에 설치되어 있음
- 임시 파일은 `/tmp` 디렉토리 사용
- 실행 후 임시 파일 자동 삭제
