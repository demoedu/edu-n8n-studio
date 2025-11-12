# X(Twitter) 자동발행 워크플로우 📱✨

RSS 피드에서 최신 뉴스를 가져와 AI로 매력적인 트윗을 생성하고 자동으로 X(Twitter)에 발행하는 n8n 워크플로우입니다.

## 📋 워크플로우 개요

### 실행 흐름
```
Schedule Trigger (매 6시간마다)
  → RSS 피드 읽기 (Hacker News)
  → 최신 3개 선택 및 필터링
  → AI로 트윗 생성 (OpenAI GPT-4o-mini)
  → 트윗 텍스트 추출
  → X에 자동 발행
```

### 주요 기능
- ✅ **자동 스케줄링**: 매일 오전 9시부터 6시간마다 자동 실행
- ✅ **RSS 피드 통합**: 원하는 블로그/뉴스 사이트의 RSS 피드 연동
- ✅ **AI 콘텐츠 생성**: OpenAI를 사용해 매력적인 트윗 자동 생성
- ✅ **자동 발행**: 생성된 트윗을 X(Twitter)에 자동 포스팅
- ✅ **커스터마이징 가능**: 프롬프트, 스케줄, RSS 피드 등 자유롭게 변경 가능

---

## 🚀 설치 및 설정

### 1. n8n에 워크플로우 가져오기

#### 방법 1: JSON 파일로 가져오기
1. n8n 대시보드 접속
2. 우측 상단 **"+"** 버튼 클릭 → **"Import from file"** 선택
3. `x-auto-post-workflow.json` 파일 업로드
4. 워크플로우가 자동으로 생성됨

#### 방법 2: JSON 복사/붙여넣기
1. n8n 대시보드에서 **"+"** → **"Import from URL or text"**
2. `x-auto-post-workflow.json` 파일 내용 전체 복사
3. 붙여넣기 후 Import

---

### 2. 필수 인증 설정

워크플로우가 작동하려면 다음 인증 정보를 설정해야 합니다:

#### ① OpenAI API 키 설정
1. **OpenAI 노드** ("AI 트윗 생성") 클릭
2. **Credential** 섹션에서 **"Create New Credential"** 클릭
3. OpenAI API Key 입력
   - API 키가 없다면 https://platform.openai.com/api-keys 에서 발급
4. **Save** 클릭

#### ② X (Twitter) 인증 설정
1. **X 노드** ("X 트윗 발행") 클릭
2. **Credential** 섹션에서 **"Create New Credential"** 클릭
3. Twitter OAuth 인증 완료
   - Twitter Developer Portal에서 API 키 발급 필요
   - 발급 방법: https://developer.twitter.com/en/docs/twitter-api/getting-started/getting-access-to-the-twitter-api

**중요**: X API는 무료 플랜 제한이 있을 수 있으므로 사전에 확인하세요.

---

### 3. 워크플로우 커스터마이징

#### RSS 피드 변경
기본값: Hacker News RSS (`https://news.ycombinator.com/rss`)

**변경 방법**:
1. **"RSS Feed Reader"** 노드 클릭
2. **URL** 필드에 원하는 RSS 피드 URL 입력
   - 예시:
     - 나무위키: `https://namu.wiki/RecentChanges?format=rss`
     - Medium: `https://medium.com/feed/@username`
     - 개인 블로그: `https://yourblog.com/rss`
3. **Save** 클릭

#### 스케줄 변경
기본값: 매일 오전 9시부터 6시간마다 실행

**변경 방법**:
1. **"Schedule Trigger"** 노드 클릭
2. **Rule** → **Interval** 섹션 수정
   - `field`: 실행 단위 (hours, days, weeks 등)
   - `hoursInterval`: 간격 (예: 6 = 6시간마다)
   - `triggerAtHour`: 시작 시간 (예: 9 = 오전 9시)

**예시 설정**:
```json
// 매일 오전 10시, 오후 2시, 오후 6시에 실행
{
  "field": "hours",
  "hoursInterval": 4,
  "triggerAtHour": 10
}

// 매일 오전 9시에만 실행
{
  "field": "days",
  "daysInterval": 1,
  "triggerAtHour": 9
}
```

#### AI 프롬프트 커스터마이징
기본값: 한국어로 280자 이내 트윗 생성

**변경 방법**:
1. **"AI 트윗 생성"** 노드 클릭
2. **Prompt** → **Messages** → **System** 메시지 수정
3. 원하는 톤, 스타일, 언어로 변경

**예시 프롬프트**:
```
당신은 테크 전문 인플루언서입니다.
주어진 기사를 바탕으로 전문적이고 통찰력 있는 트윗을 작성해주세요.

요구사항:
- 280자 이내
- 전문 용어 사용 가능
- 이모지 1개만 사용
- 해시태그 없음
- 영어로 작성
```

#### 생성 개수 변경
기본값: RSS에서 최신 3개 항목 선택

**변경 방법**:
1. **"필터 및 변환"** 노드 클릭
2. **JavaScript Code** 수정:
```javascript
// .slice(0, 3) 부분을 원하는 개수로 변경
.slice(0, 5)  // 5개로 변경
```

---

## 🎯 사용법

### 워크플로우 활성화
1. 모든 설정이 완료되면 **우측 상단의 "Active" 토글** 클릭
2. 워크플로우가 활성화되면 자동으로 스케줄에 따라 실행됩니다

### 수동 실행 (테스트)
1. **왼쪽 상단 "Execute Workflow"** 버튼 클릭
2. 각 노드를 클릭하여 결과 확인
3. 마지막 노드까지 정상 실행되는지 확인

### 실행 내역 확인
1. n8n 대시보드 → **"Executions"** 탭
2. 워크플로우 이름 클릭하여 실행 로그 확인
3. 에러 발생 시 해당 노드 클릭하여 에러 메시지 확인

---

## 🔧 문제 해결

### 문제 1: RSS 피드가 읽히지 않음
**원인**: RSS URL이 잘못되었거나 접근 불가
**해결**:
- 브라우저에서 RSS URL을 직접 열어 작동 확인
- CORS 문제가 있을 경우 다른 RSS 피드 사용

### 문제 2: OpenAI API 에러
**원인**: API 키가 잘못되었거나 크레딧 부족
**해결**:
- OpenAI 대시보드에서 API 키 재확인
- Usage 페이지에서 크레딧 잔액 확인

### 문제 3: X(Twitter) 포스팅 실패
**원인**: Twitter API 인증 문제 또는 API 제한
**해결**:
- Twitter Developer Portal에서 API 권한 확인
- API 사용량 제한 확인 (Free tier는 제한 있음)
- OAuth 재인증

### 문제 4: 중복 트윗 발행
**원인**: RSS 피드에서 같은 항목이 반복 선택됨
**해결**:
- "필터 및 변환" 노드에 중복 제거 로직 추가
- 발행된 트윗 기록을 데이터베이스에 저장하여 중복 체크

---

## 📊 노드별 상세 설명

### 1. Schedule Trigger
- **역할**: 정해진 시간에 워크플로우 자동 실행
- **설정 가능 항목**:
  - 실행 간격 (시간, 일, 주 단위)
  - 시작 시간
  - 시간대 (기본: Asia/Seoul)

### 2. RSS Feed Reader
- **역할**: RSS 피드에서 최신 글 가져오기
- **출력 데이터**:
  - `title`: 글 제목
  - `link`: 원본 URL
  - `description`: 글 요약
  - `pubDate`: 발행 날짜

### 3. 필터 및 변환 (Code Node)
- **역할**: RSS 항목 중 최신 3개 선택 및 데이터 정제
- **주요 로직**:
  - 날짜순 정렬 (최신순)
  - 상위 3개 항목 선택
  - 필요한 필드만 추출

### 4. AI 트윗 생성 (OpenAI)
- **역할**: RSS 글을 바탕으로 트윗 생성
- **모델**: GPT-4o-mini (빠르고 저렴)
- **설정**:
  - Temperature: 0.8 (창의성 중간)
  - Max Tokens: 200 (트윗 길이 제한)

### 5. 트윗 텍스트 추출 (Code Node)
- **역할**: OpenAI 응답에서 순수 텍스트만 추출
- **주요 로직**:
  - AI 응답 파싱
  - 원본 데이터 메타데이터 추가

### 6. X 트윗 발행
- **역할**: 생성된 트윗을 X에 발행
- **필수 설정**: Twitter OAuth 인증
- **제한사항**: API rate limit 확인 필요

---

## 🎨 고급 커스터마이징

### 이미지 포함 트윗
현재 워크플로우는 텍스트만 발행합니다. 이미지를 추가하려면:

1. **HTTP Request** 노드 추가하여 RSS의 이미지 URL 다운로드
2. **X 노드**에서 `media` 파라미터 설정
3. 이미지와 함께 트윗 발행

### 여러 소셜미디어 동시 발행
X뿐만 아니라 다른 플랫폼에도 동시 발행:

1. 워크플로우 분기 추가 (IF 노드 사용)
2. **LinkedIn**, **Facebook**, **Instagram** 노드 추가
3. 플랫폼별 포맷에 맞게 콘텐츠 변환

### 중복 방지 시스템
같은 콘텐츠 재발행 방지:

1. **Database** 노드 추가 (PostgreSQL, MySQL 등)
2. 발행한 RSS 링크를 데이터베이스에 저장
3. 새로운 항목만 필터링하여 발행

### 감정 분석 추가
긍정적인 뉴스만 선별하여 발행:

1. **Sentiment Analysis** 노드 추가
2. RSS 항목의 감정 점수 분석
3. 긍정적인 항목만 트윗 생성

---

## 📈 성능 최적화

### API 비용 절감
- **OpenAI 모델 변경**: GPT-4o-mini 대신 GPT-3.5-turbo 사용
- **배치 처리**: 여러 항목을 한 번에 처리하여 API 호출 수 줄이기
- **캐싱**: 동일 RSS 항목 재처리 방지

### 실행 시간 단축
- **병렬 처리**: 여러 RSS 피드를 동시에 읽기
- **타임아웃 설정**: 느린 응답 차단
- **데이터 압축**: 불필요한 필드 제거

---

## 📝 체크리스트

### 배포 전 확인사항
- [ ] OpenAI API 키 설정 완료
- [ ] X(Twitter) OAuth 인증 완료
- [ ] RSS 피드 URL 정상 작동 확인
- [ ] 수동 실행으로 전체 플로우 테스트
- [ ] 스케줄 시간 확인 (시간대 주의)
- [ ] 워크플로우 활성화 (Active 토글 ON)

### 운영 중 체크사항
- [ ] 일일 실행 내역 확인
- [ ] API 사용량 모니터링
- [ ] 에러 발생 시 즉시 대응
- [ ] 트윗 품질 확인 및 프롬프트 개선

---

## 🆘 지원 및 문의

### 유용한 링크
- [n8n 공식 문서](https://docs.n8n.io/)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [X API 문서](https://developer.twitter.com/en/docs)
- [n8n 커뮤니티](https://community.n8n.io/)

### 라이선스
이 워크플로우는 자유롭게 사용, 수정, 배포 가능합니다.

---

**제작**: Claude + n8n
**버전**: 1.0.0
**최종 업데이트**: 2025-01-12
