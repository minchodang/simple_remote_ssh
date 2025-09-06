# SSH Easy - 간편한 SSH 연결 도구

🚀 복잡한 SSH 연결을 간단하게! 호스트를 저장하고 쉽게 관리할 수 있는 CLI 도구입니다.

## 특징

-   🔗 **간편한 연결**: 저장된 호스트에 한 번의 명령으로 연결
-   📋 **호스트 관리**: SSH 호스트 추가, 편집, 삭제
-   🎯 **대화형 인터페이스**: 직관적인 호스트 선택
-   🏷️ **태그 시스템**: 호스트를 태그로 분류
-   🔑 **키 파일 지원**: SSH 키 파일 자동 관리
-   ⚡ **빠른 접근**: `ssh-easy` 또는 `se` 짧은 명령어

## 설치

```bash
# 개발 모드에서 설치 (현재 디렉토리에서)
cd packages/cli
npm link
```

## 사용법

### 기본 명령어

```bash
# 도움말 보기
ssh-easy --help
se --help

# 호스트 목록 보기
ssh-easy list
se ls

# 새 호스트 추가
ssh-easy add
se a

# 호스트에 연결 (대화형 선택)
ssh-easy
se

# 특정 호스트에 연결
ssh-easy connect my-server
se c my-server

# 호스트 편집
ssh-easy edit my-server
se e my-server

# 호스트 삭제
ssh-easy remove my-server
se rm my-server
```

### 연결 옵션

```bash
# 사용자명 지정하여 연결
ssh-easy connect my-server --user root
se c my-server -u root

# 포트 지정하여 연결
ssh-easy connect my-server --port 2222
se c my-server -p 2222

# 사용자명과 포트 모두 지정
ssh-easy connect my-server -u admin -p 2222
```

## 호스트 추가 예시

```bash
$ ssh-easy add

➕ 새로운 SSH 호스트 추가

? 호스트 이름 (별칭): my-server
? 호스트 주소 (IP 또는 도메인): 192.168.1.100
? 사용자명: ubuntu
? 포트 번호: 22
? SSH 키 파일 경로 (선택사항): ~/.ssh/id_rsa
? 설명 (선택사항): 개발 서버
? 태그 (쉼표로 구분, 선택사항): dev, ubuntu

✅ 호스트가 성공적으로 추가되었습니다!

📋 추가된 호스트 정보:
   이름: my-server
   주소: ubuntu@192.168.1.100:22
   키 파일: ~/.ssh/id_rsa
   설명: 개발 서버
   태그: dev, ubuntu

💡 연결하려면: ssh-easy connect my-server
```

## 호스트 목록 예시

```bash
$ ssh-easy list

📋 저장된 SSH 호스트 목록:

1. my-server ubuntu@192.168.1.100:22 - 개발 서버 [dev, ubuntu]
   🔑 Key: ~/.ssh/id_rsa
2. prod-server root@prod.example.com:22 - 운영 서버 [prod]
3. test-db admin@test-db.local:3306 - 테스트 DB [test, database]

총 3개의 호스트가 저장되어 있습니다.

💡 사용법:
  연결: ssh-easy connect <호스트명> 또는 ssh-easy c <호스트명>
  편집: ssh-easy edit <호스트명> 또는 ssh-easy e <호스트명>
  삭제: ssh-easy remove <호스트명> 또는 ssh-easy rm <호스트명>
```

## 설정 파일

호스트 정보는 `~/.ssh-easy/config.json`에 저장됩니다.

```json
{
    "hosts": [
        {
            "name": "my-server",
            "host": "192.168.1.100",
            "user": "ubuntu",
            "port": 22,
            "keyPath": "~/.ssh/id_rsa",
            "description": "개발 서버",
            "tags": ["dev", "ubuntu"]
        }
    ],
    "defaultUser": "ubuntu",
    "defaultPort": 22
}
```

## 개발

```bash
# 의존성 설치
pnpm install

# 개발 모드 (watch)
pnpm dev

# 빌드
pnpm build

# 전역 링크
npm link
```

## 라이선스

MIT
