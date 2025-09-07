---
'simple-remote-ssh': major
---

# 🎉 Simple Remote SSH v1.0.0 - 첫 번째 메이저 릴리즈

## ✨ 주요 기능

### SSH 호스트 관리

-   **호스트 추가**: `simple-ssh add` - 대화형 호스트 정보 입력
-   **호스트 목록**: `simple-ssh list` - 저장된 호스트 목록 보기
-   **호스트 편집**: `simple-ssh edit <호스트명>` - 호스트 정보 수정
-   **호스트 삭제**: `simple-ssh remove <호스트명>` - 호스트 제거

### SSH 연결

-   **대화형 연결**: `simple-ssh` - 호스트 선택 후 연결
-   **직접 연결**: `simple-ssh connect <호스트명>` - 특정 호스트에 바로 연결
-   **연결 옵션**: 사용자명, 포트 오버라이드 지원

### 인증 방식

-   **SSH 키 파일**: 보안성이 높은 키 기반 인증
-   **비밀번호**: 연결 시점 대화형 입력
-   **기본 SSH 설정**: 시스템 기본 설정 활용

### 부가 기능

-   **태그 시스템**: 호스트 분류 및 관리
-   **설명 필드**: 호스트별 메모
-   **컬러풀한 UI**: 직관적인 사용자 인터페이스

## 🚀 설치 및 사용법

```bash
# 전역 설치
npm install -g simple-remote-ssh

# 사용법
simple-ssh --help
```

## 💾 설정 파일

호스트 정보는 `~/.ssh-easy/config.json`에 안전하게 저장됩니다.
