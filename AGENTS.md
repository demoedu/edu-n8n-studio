# n8n Project Documentation

> 워크플로우 자동화 플랫폼 n8n의 종합 가이드

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [n8n MCP 도구 시스템](#n8n-mcp-도구-시스템)
3. [워크플로우 패턴](#워크플로우-패턴)
4. [Expression 문법](#expression-문법)
5. [검증 시스템](#검증-시스템)
6. [노드 설정](#노드-설정)
7. [Code 노드 (JavaScript/Python)](#code-노드)
8. [주요 통계](#주요-통계)

---

## 프로젝트 개요

### n8n이란?

n8n은 **fair-code 분산형 워크플로우 자동화 플랫폼**입니다.

**핵심 특징:**

- 537개 이상의 노드 (통합 기능)
- 270개 AI 도구 지원
- 2,653개 템플릿 라이브러리
- 시각적 워크플로우 빌더
- Code 노드를 통한 JavaScript/Python 지원

---

## n8n MCP 도구 시스템

### 도구 카테고리

n8n-mcp는 **40개 이상의 도구**를 제공하며 다음과 같이 분류됩니다:

#### 1. 노드 발견 도구

- `search_nodes` - 키워드로 노드 검색 (99.9% 성공률)
- `list_nodes` - 카테고리별 노드 목록
- `get_node_essentials` - 노드 필수 정보 (91.7% 성공률, 권장)
- `get_node_info` - 전체 노드 문서 (복잡한 경우만 사용)
- `search_node_properties` - 특정 속성 검색

#### 2. 검증 도구

- `validate_node_minimal` - 필수 필드만 검증
- `validate_node_operation` - 전체 노드 검증
- `validate_workflow` - 워크플로우 구조 검증
- `validate_workflow_connections` - 연결만 검증
- `validate_workflow_expressions` - Expression만 검증

#### 3. 워크플로우 관리 도구

- `n8n_create_workflow` - 워크플로우 생성
- `n8n_update_partial_workflow` - 부분 업데이트 (99.0% 성공률, 가장 많이 사용)
- `n8n_get_workflow` - 워크플로우 조회
- `n8n_list_workflows` - 워크플로우 목록
- `n8n_delete_workflow` - 워크플로우 삭제
- `n8n_validate_workflow` - ID로 워크플로우 검증
- `n8n_autofix_workflow` - 자동 수정

#### 4. 템플릿 도구

- `search_templates` - 키워드로 템플릿 검색
- `get_template` - 템플릿 상세 정보
- `list_node_templates` - 특정 노드 사용 템플릿
- `search_templates_by_metadata` - AI 생성 메타데이터로 검색

#### 5. 유틸리티

- `tools_documentation` - 도구 문서 조회
- `get_database_statistics` - 통계 정보
- `n8n_health_check` - API 상태 확인

### 중요 개념

#### nodeType 형식 차이

**검색/검증 도구용:**

```
nodes-base.slack
nodes-base.httpRequest
nodes-langchain.agent
```

**워크플로우 도구용:**

```
n8n-nodes-base.slack
n8n-nodes-base.httpRequest
@n8n/n8n-nodes-langchain.agent
```

#### 도구 사용 패턴

**노드 발견 워크플로우 (평균 18초):**

```
1. search_nodes({query: "slack"})
2. get_node_essentials({nodeType: "nodes-base.slack"})
3. [선택] get_node_documentation({nodeType: "nodes-base.slack"})
```

**검증 루프 (평균 23초 분석 + 58초 수정):**

```
1. validate_node_operation({nodeType, config, profile: "runtime"})
2. 에러 확인 및 분석
3. 설정 수정
4. 다시 검증 (보통 2-3회 반복)
```

**워크플로우 편집 (평균 56초 간격):**

```
1. n8n_create_workflow({name, nodes, connections})
2. n8n_validate_workflow({id})
3. n8n_update_partial_workflow({id, operations: [...]})
4. 반복...
```

### 검증 프로파일

- `minimal` - 필수 필드만 (빠름, 관대함)
- `runtime` - 값 + 타입 검증 (권장, 배포 전)
- `ai-friendly` - false positive 감소 (AI 생성 설정용)
- `strict` - 최대 검증 (프로덕션)

### 자동 정리 시스템

워크플로우 업데이트 시 자동으로 수정:

- Binary 연산자 (equals, contains) → `singleValue` 제거
- Unary 연산자 (isEmpty, isNotEmpty) → `singleValue: true` 추가
- IF/Switch 노드 → 메타데이터 추가

---

## 워크플로우 패턴

### 5가지 핵심 패턴

#### 1. Webhook 처리 (가장 일반적)

**사용 시기:** 외부 시스템에서 데이터 수신

```
Webhook → Validate → Transform → Respond/Notify
```

**예시:**

- Stripe 결제 webhook → 데이터베이스 업데이트 → 확인 전송
- Slack 명령 → 처리 → 응답
- GitHub webhook → 이슈 생성

#### 2. HTTP API 통합

**사용 시기:** 외부 API에서 데이터 가져오기

```
Trigger → HTTP Request → Transform → Action → Error Handler
```

**예시:**

- GitHub 이슈 가져오기 → 변환 → Jira 티켓 생성
- REST API 동기화
- 데이터 파이프라인

#### 3. 데이터베이스 작업

**사용 시기:** 데이터베이스 읽기/쓰기/동기화

```
Schedule → Query → Transform → Write → Verify
```

**예시:**

- Postgres 레코드 읽기 → 변환 → MySQL에 쓰기
- 데이터베이스 간 동기화
- ETL 워크플로우

#### 4. AI Agent 워크플로우

**사용 시기:** AI 대화형 인터페이스, 도구 액세스

```
Trigger → AI Agent (Model + Tools + Memory) → Output
```

**예시:**

- 문서 검색 + 데이터베이스 쿼리 + 이메일 전송 가능한 AI 챗봇
- 다단계 추론 작업
- 대화형 AI

#### 5. 예약 작업

**사용 시기:** 정기적 자동화

```
Schedule → Fetch → Process → Deliver → Log
```

**예시:**

- 일일 분석 리포트 생성 및 전송
- 주기적 데이터 가져오기
- 유지보수 작업

### 워크플로우 생성 체크리스트

**계획 단계:**

- [ ] 패턴 식별 (webhook, API, database, AI, scheduled)
- [ ] 필요한 노드 목록 작성
- [ ] 데이터 흐름 이해
- [ ] 에러 처리 전략 계획

**구현 단계:**

- [ ] 적절한 트리거로 워크플로우 생성
- [ ] 데이터 소스 노드 추가
- [ ] 인증/자격증명 설정
- [ ] 변환 노드 추가 (Set, Code, IF)
- [ ] 출력/액션 노드 추가
- [ ] 에러 처리 설정

**검증 단계:**

- [ ] 각 노드 설정 검증
- [ ] 전체 워크플로우 검증
- [ ] 샘플 데이터로 테스트
- [ ] 엣지 케이스 처리

**배포 단계:**

- [ ] 워크플로우 설정 검토
- [ ] 워크플로우 활성화 ⚠️ **수동 활성화 필요**
- [ ] 초기 실행 모니터링
- [ ] 워크플로우 목적 및 데이터 흐름 문서화

---

## Expression 문법

### 기본 형식

모든 동적 콘텐츠는 **이중 중괄호** 사용:

```
{{expression}}
```

### 핵심 변수

#### \$json - 현재 노드 출력

```javascript
{
  {
    $json.fieldName;
  }
}
{
  {
    $json.nested.property;
  }
}
{
  {
    $json.items[0].name;
  }
}
```

#### \$node - 다른 노드 참조

```javascript
{
  {
    $node['Node Name'].json.fieldName;
  }
}
{
  {
    $node['HTTP Request'].json.data;
  }
}
```

#### \$now - 현재 타임스탬프

```javascript
{
  {
    $now.toFormat('yyyy-MM-dd');
  }
}
{
  {
    $now.plus({ days: 7 });
  }
}
```

#### \$env - 환경 변수

```javascript
{
  {
    $env.API_KEY;
  }
}
{
  {
    $env.DATABASE_URL;
  }
}
```

### 🚨 중요: Webhook 데이터 구조

**가장 흔한 실수:** Webhook 데이터는 루트에 없음!

```javascript
❌ 잘못됨: {{$json.name}}
✅ 올바름: {{$json.body.name}}
```

**이유:** Webhook 노드는 들어오는 데이터를 `.body` 속성 아래에 래핑합니다.

### Expression 사용하지 말아야 할 곳

- ❌ Code 노드 (JavaScript 직접 사용)
- ❌ Webhook 경로
- ❌ 자격증명 필드

### 일반적인 패턴

```javascript
// 중첩 필드
{
  {
    $json.user.email;
  }
}

// 배열 접근
{
  {
    $json.data[0].name;
  }
}

// 조건부 콘텐츠
{
  {
    $json.status === 'active' ? 'Active User' : 'Inactive User';
  }
}

// 기본값
{
  {
    $json.email || 'no-email@example.com';
  }
}

// 날짜 조작
{
  {
    $now.plus({ days: 7 }).toFormat('yyyy-MM-dd');
  }
}
```

---

## 검증 시스템

### 검증 철학

**일찍, 자주 검증**

검증은 일반적으로 반복적:

- 검증 피드백 루프 예상
- 보통 2-3회 검증 → 수정 사이클
- 평균: 23초 에러 분석, 58초 수정

### 에러 심각도

#### 1. 에러 (반드시 수정)

워크플로우 실행을 차단 - 활성화 전에 해결 필요

**유형:**

- `missing_required` - 필수 필드 누락
- `invalid_value` - 허용되지 않는 값
- `type_mismatch` - 잘못된 데이터 타입
- `invalid_reference` - 존재하지 않는 노드 참조
- `invalid_expression` - Expression 문법 오류

#### 2. 경고 (수정 권장)

실행을 차단하지 않지만 문제 가능성

**유형:**

- `best_practice` - 권장사항
- `deprecated` - 구식 API/기능 사용
- `performance` - 성능 문제 가능성

#### 3. 제안 (선택사항)

워크플로우 개선 가능

### 검증 루프 패턴

```
1. 노드 설정
   ↓
2. validate_node_operation (23초 에러 분석)
   ↓
3. 에러 메시지 꼼꼼히 읽기
   ↓
4. 에러 수정
   ↓
5. validate_node_operation 재실행 (58초 수정)
   ↓
6. 유효할 때까지 반복 (보통 2-3회)
```

### False Positive

기술적으로는 "틀렸지만" 사용 사례에서 허용 가능한 검증 경고:

- "에러 처리 누락" - 간단한 워크플로우에서는 괜찮음
- "재시도 로직 없음" - 재시도 로직이 있는 API
- "속도 제한 없음" - 내부 API
- "무제한 쿼리" - 작은 데이터셋

False positive 줄이기: `ai-friendly` 프로파일 사용

---

## 노드 설정

### 설정 철학

**점진적 공개:** 최소한으로 시작, 필요에 따라 복잡성 추가

- get_node_essentials가 가장 많이 사용되는 발견 패턴
- 설정 편집 간 평균 56초
- essentials 기반 설정 91.7% 성공률

### 작업 중심 설정

**모든 필드가 항상 필요한 것은 아님** - operation에 따라 다름!

**예시:** Slack 노드

```javascript
// operation='post'
{
  "resource": "message",
  "operation": "post",
  "channel": "#general",  // post에 필요
  "text": "Hello!"        // post에 필요
}

// operation='update'
{
  "resource": "message",
  "operation": "update",
  "messageId": "123",     // update에 필요 (다름!)
  "text": "Updated!"      // update에 필요
  // channel은 update에 불필요
}
```

### 속성 의존성

**다른 필드 값에 따라 필드가 나타나거나 사라짐**

**예시:** HTTP Request 노드

```javascript
// method='GET'
{
  "method": "GET",
  "url": "https://api.example.com"
  // sendBody 표시 안 됨 (GET은 body 없음)
}

// method='POST'
{
  "method": "POST",
  "url": "https://api.example.com",
  "sendBody": true,       // 이제 표시됨!
  "body": {               // sendBody=true일 때 필요
    "contentType": "json",
    "content": {...}
  }
}
```

### 설정 워크플로우

```
1. 노드 타입 및 operation 식별
   ↓
2. get_node_essentials 사용
   ↓
3. 필수 필드 설정
   ↓
4. 설정 검증
   ↓
5. 의존성 불명확 → get_property_dependencies
   ↓
6. 필요에 따라 선택적 필드 추가
   ↓
7. 재검증
   ↓
8. 배포
```

### get_node_essentials vs get_node_info

**get_node_essentials 사용 시기 (91.7% 성공률):**

- 설정 시작할 때
- 빠른 개요 필요할 때
- 필수 필드만 필요할 때

**get_node_info 사용 시기 (80% 성공률):**

- essentials가 불충분할 때
- 전체 스키마 필요할 때
- 고급 옵션 탐색할 때

**권장:** essentials 먼저 시도, 필요할 때만 info 사용

---

## Code 노드

### JavaScript Code 노드

#### 빠른 시작

```javascript
// 기본 템플릿
const items = $input.all();

// 데이터 처리
const processed = items.map((item) => ({
  json: {
    ...item.json,
    processed: true,
    timestamp: new Date().toISOString(),
  },
}));

return processed;
```

#### 필수 규칙

1. **"Run Once for All Items" 모드 선택** (대부분의 경우 권장)
2. **데이터 액세스:** `$input.all()`, `$input.first()`, 또는 `$input.item`
3. **중요:** `[{json: {...}}]` 형식으로 반환 필수
4. **중요:** Webhook 데이터는 `$json.body` 아래에 (`$json` 직접 아님)
5. **내장 함수:** $helpers.httpRequest(), DateTime (Luxon), $jmespath() 사용 가능

#### 모드 선택

**Run Once for All Items (권장 - 기본값):**

- 입력 개수와 관계없이 **한 번** 실행
- 데이터 액세스: `$input.all()`
- 최적: 집계, 필터링, 배치 처리, 변환
- 성능: 여러 항목에 대해 빠름 (단일 실행)

**Run Once for Each Item:**

- 각 입력 항목에 대해 **개별** 실행
- 데이터 액세스: `$input.item`
- 최적: 항목별 로직, 독립적 작업
- 성능: 대규모 데이터셋에 느림

#### 일반적인 패턴

```javascript
// 1. 여러 소스 데이터 집계
const allItems = $input.all();
const combined = allItems.map((item) => ({
  json: {
    source: item.json.name,
    data: item.json.data,
  },
}));

// 2. 정규식 필터링
const pattern = /\\b([A-Z]{2,5})\\b/g;
const text = $json.body.text;
const matches = text.match(pattern);

// 3. 데이터 변환 및 강화
const transformed = items.map((item) => ({
  json: {
    first_name: item.json.name.split(' ')[0],
    email: item.json.email,
    created_at: new Date().toISOString(),
  },
}));

// 4. Top N 필터링
const topItems = items.sort((a, b) => b.json.score - a.json.score).slice(0, 10);

// 5. 집계 및 리포팅
const total = items.reduce((sum, item) => sum + item.json.amount, 0);
return [
  {
    json: {
      total,
      count: items.length,
      average: total / items.length,
    },
  },
];
```

#### 내장 함수

```javascript
// HTTP 요청
const response = await $helpers.httpRequest({
  method: 'GET',
  url: 'https://api.example.com/data',
  headers: { Authorization: 'Bearer token' },
});

// DateTime (Luxon)
const now = DateTime.now();
const formatted = now.toFormat('yyyy-MM-dd');
const tomorrow = now.plus({ days: 1 });

// JMESPath
const adults = $jmespath(data, 'users[?age >= `18`]');
```

### Python Code 노드 (Beta)

#### ⚠️ 중요: JavaScript 우선

**권장:** **95%의 경우 JavaScript 사용**. Python은 다음 경우에만:

- 특정 Python 표준 라이브러리 함수 필요
- Python 문법이 훨씬 익숙함
- Python에 더 적합한 데이터 변환

#### 빠른 시작

```python
# 기본 템플릿
items = _input.all()

# 데이터 처리
processed = []
for item in items:
    processed.append({
        "json": {
            **item["json"],
            "processed": True,
            "timestamp": datetime.now().isoformat()
        }
    })

return processed
```

#### 필수 규칙

1. **JavaScript 먼저 고려** - 필요한 경우에만 Python 사용
2. **데이터 액세스:** `_input.all()`, `_input.first()`, 또는 `_input.item`
3. **중요:** `[{"json": {...}}]` 형식으로 반환 필수
4. **중요:** Webhook 데이터는 `_json["body"]` 아래에
5. **중요 제한사항:** **외부 라이브러리 없음** (requests, pandas, numpy 불가)
6. **표준 라이브러리만:** json, datetime, re, base64, hashlib, urllib.parse, math, random, statistics

#### 사용 가능한 표준 라이브러리

```python
# ✅ 사용 가능
import json
from datetime import datetime, timedelta
import re
import base64
import hashlib
import urllib.parse
import math
import random
from statistics import mean, median, stdev

# ❌ 사용 불가
import requests  # ModuleNotFoundError!
import pandas
import numpy
```

#### 일반적인 패턴

```python
# 1. 데이터 변환
items = _input.all()
return [
    {
        "json": {
            "id": item["json"].get("id"),
            "name": item["json"].get("name", "Unknown").upper(),
            "processed": True
        }
    }
    for item in items
]

# 2. 필터링 및 집계
total = sum(item["json"].get("amount", 0) for item in items)
valid_items = [item for item in items if item["json"].get("amount", 0) > 0]

# 3. 정규식 문자열 처리
import re
email_pattern = r'\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b'
emails = re.findall(email_pattern, text)

# 4. 통계 분석
from statistics import mean, median, stdev
values = [item["json"].get("value", 0) for item in items if "value" in item["json"]]
return [{
    "json": {
        "mean": mean(values),
        "median": median(values),
        "stdev": stdev(values) if len(values) > 1 else 0
    }
}]
```

#### Python vs JavaScript 선택

**Python 사용 시기:**

- ✅ `statistics` 모듈 통계 작업 필요
- ✅ Python 문법이 훨씬 익숙함
- ✅ 리스트 컴프리헨션에 잘 맞는 로직
- ✅ 특정 표준 라이브러리 함수 필요

**JavaScript 사용 시기:**

- ✅ HTTP 요청 필요 ($helpers.httpRequest())
- ✅ 고급 날짜/시간 필요 (DateTime/Luxon)
- ✅ 더 나은 n8n 통합 원함
- ✅ **95%의 경우** (권장)

### 공통 Code 노드 체크리스트

배포 전 확인:

- [ ] 코드가 비어있지 않음
- [ ] return 문 존재
- [ ] 올바른 반환 형식: `[{json: {...}}]` (JS) 또는 `[{"json": {...}}]` (Python)
- [ ] 올바른 데이터 액세스
- [ ] 외부 라이브러리 없음 (Python)
- [ ] 에러 처리
- [ ] Webhook 데이터는 `.body` 또는 `["body"]` 통해 액세스
- [ ] 적절한 모드 선택 (대부분 "All Items")
- [ ] 일관된 출력 구조

---

## 주요 통계

### 노드 통계

- **총 노드:** 537개
- **AI 도구:** 270개
- **트리거 노드:** 104개
- **문서 커버리지:** 87%

### 도구 성공률

- `search_nodes`: 99.9%
- `list_nodes`: 99.6%
- `get_node_essentials`: 91.7%
- `get_node_info`: 80%
- `validate_node_minimal`: 97.4%
- `validate_workflow`: 95.5%
- `n8n_create_workflow`: 96.8%
- `n8n_update_partial_workflow`: 99.0%

### 템플릿 통계

- **총 템플릿:** 2,653개
- **가장 인기 있는 패턴:** Webhook 처리 (35%)
- **평균 워크플로우 복잡도:**
  - 단순 (3-5 노드): 42%
  - 중간 (6-10 노드): 38%
  - 복잡 (11+ 노드): 20%

### 사용 패턴

- **노드 발견:** search → essentials 평균 18초
- **검증 루프:** 평균 23초 분석 + 58초 수정, 2-3회 반복
- **워크플로우 편집:** 평균 56초 간격으로 반복 업데이트

### 가장 일반적인 트리거

1. Webhook - 35%
2. Schedule (주기적 작업) - 28%
3. Manual (테스트/관리) - 22%
4. Service triggers (Slack, email 등) - 15%

### 가장 일반적인 변환

1. Set (필드 매핑) - 68%
2. Code (사용자 정의 로직) - 42%
3. IF (조건부 라우팅) - 38%
4. Switch (다중 조건) - 18%

### 가장 일반적인 출력

1. HTTP Request (APIs) - 45%
2. Slack - 32%
3. Database writes - 28%
4. Email - 24%

---

## 모범 사례

### ✅ 해야 할 것

1. **get_node_essentials 먼저 사용** (91.7% vs 80%)
2. **검증 프로파일 명시** (runtime 권장)
3. **스마트 파라미터 사용** (branch, case)
4. **검증 주도 개발** - 검증이 설정을 안내하도록
5. **반복적 워크플로우 구축** (평균 56초 간격)
6. **중요한 변경 후 검증**
7. **자동 정리 신뢰** - 연산자 구조 자동 수정

### ❌ 하지 말아야 할 것

1. **get_node_info 즉시 사용** (essentials 먼저!)
2. **nodeType 접두사 잊기** (nodes-base.\*)
3. **검증 프로파일 건너뛰기**
4. **한 번에 워크플로우 구축** (반복하세요!)
5. **자동 정리 무시**
6. **검증 건너뛰고 배포**
7. **모든 경고 무시** (일부는 중요함!)

---

## 관련 Skills

프로젝트에서 사용 가능한 n8n Skills:

1. **n8n-mcp-tools-expert** - MCP 도구 사용 마스터
2. **n8n-workflow-patterns** - 검증된 워크플로우 아키텍처 패턴
3. **n8n-expression-syntax** - Expression 문법 및 검증
4. **n8n-validation-expert** - 검증 에러 해석 및 수정
5. **n8n-node-configuration** - 작업별 노드 설정
6. **n8n-code-javascript** - JavaScript Code 노드 작성
7. **n8n-code-python** - Python Code 노드 작성

---

## 빠른 참조

### 일반적인 워크플로우

```
1. search_nodes → 노드 찾기
2. get_node_essentials → 설정 이해
3. validate_node_operation → 설정 확인
4. n8n_create_workflow → 구축
5. n8n_validate_workflow → 검증
6. n8n_update_partial_workflow → 반복
```

### 필수 명령어

```bash
# n8n 통계 확인
get_database_statistics()

# 도구 문서
tools_documentation()
tools_documentation({topic: "search_nodes", depth: "full"})

# API 상태 확인
n8n_health_check()
```

### 가장 중요한 것들

1. **get_node_essentials 사용**, get_node_info 아님 (5KB vs 100KB, 91.7% vs 80%)
2. nodeType 형식 차이: `nodes-base.*` (검색) vs `n8n-nodes-base.*` (워크플로우)
3. **검증 프로파일 지정** (runtime 권장)
4. **스마트 파라미터 사용** (branch="true", case=0)
5. **자동 정리**가 업데이트 시 모든 노드에서 실행됨
6. 워크플로우는 **반복적으로** 구축됨 (평균 56초 간격)

---
