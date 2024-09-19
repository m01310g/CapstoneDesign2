# 캡스톤디자인2
상승하는 물가의 부담을 해소하기 위해 이웃과 택시비/식비/배송비 등을 절감하는 서비스
## 소개 📖
### 프로젝트 설명 
가구 구성원의 수가 줄어들고 있는 요즘, 물가 상승에 따른 각 가구의 생활비 부담이 상승하고 있다. 위치 기반 게시글 노출을 통해 이웃과 함께 금전적 부담을 해소한다. 

### 주요 기능
1. 위치 기반으로 일정 반경 이내의 게시글 노출을 통한 1인 가구의 택시비/식비/배송비 등의 분할을 통한 금전적 부담 감소
2. 실시간 채팅 기능을 이용한 거래 현황 확인
3. 무단 거래 파기 시 패널티 부여 → 패널티 일정 횟수 초과 시 일정 기간 동안 서비스 이용 제한
<hr>

## Stacks ⚒️
### Environment
<img src="https://img.shields.io/badge/Visual Studio Code-007ACC?style=for-the-badge&logo=Visual Studio Code&logoColor=white"/> <img src="https://img.shields.io/badge/github-000000?style=for-the-badge&logo=github&logoColor=white"> <img src="https://img.shields.io/badge/git-F05032?style=for-the-badge&logo=git&logoColor=white">

### Development
<img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">

### Project Management
<img src="https://img.shields.io/badge/notion-000000?style=for-the-badge&logo=notion&logoColor=white">
<hr>

## Convention 📢
### Branch Name Convention
브랜치 | 설명
---|---
main | 서비스 브랜치
feature | 기능 단위 구현
develop | 기능 병합
hotfix | 버그 등 수정
### Commit Convention
메시지 | 설명
---|---
feat | 기능 구현, 추가
fix | 버그 수정, 기능 개선 등
design | css 등 style 관련 파일 변경
refactor | 코드 리팩토링
style | 코드 포맷 변경
test | 테스트 코드 추가
chore | 빌드 업무, 패키지 매니저 수정 등
rename | 파일/폴더명 수정 및 옮기는 작업 수행
remove | 파일을 삭제하는 작업 수행
docs | 문서 수
### Folder Convention
- 폴더 이름은 소문자로만 명명
- 이름이 길어진다면 하이픈(-)을 사용<br>e.g. home, community-taxi...
### File Convention
1. 컴포넌트 파일명은 대문자로 시작하도록 명명<br>e.g. Button.js, Menu.js...
2. 함수는 Camel Case를 따라 맨 처음 단어를 제외한 각 단어의 첫 글자는 대문자로 명명<br>e.g. getUserData, setMember...
### URL Convention
긴 문자열이나 읽기 어려운 문자열에 대하여 하이픈(-)을 사용<br>e.g. pathname/test-for-api
