# Portfolio

`index.html`을 브라우저에서 열면 바로 확인할 수 있는 정적 포트폴리오입니다.
전체 콘텐츠 최대 너비는 `styles.css`의 `--shell: 1480px`로 설정되어 있습니다.

## 이미지 교체

이미지를 `assets/images` 폴더에 아래 이름으로 넣으면 자동으로 표시됩니다.

- `hero.jpg`
- `profile.jpg`
- `project-01.jpg`
- `project-02.jpg`
- `project-03.jpg`
- `project-04.jpg`
- `project-05.jpg`
- `design-01.jpg`
- `design-02.jpg`
- `design-03.jpg`
- `design-04.jpg`

다른 파일명이나 외부 이미지 주소를 사용하려면 `index.html`의
`data-image="./assets/images/..."` 값만 변경하면 됩니다.

## 프로젝트 영상 팝업

프로젝트 썸네일을 클릭하면 영상과 프로젝트 설명이 담긴 팝업이 열립니다.
영상 파일은 `assets/videos` 폴더에 아래 이름으로 넣으면 됩니다.

- `project-01.mp4`
- `project-02.mp4`
- `project-03.mp4`
- `project-04.mp4`
- `project-05.mp4`

모달은 영상의 실제 해상도를 자동으로 확인합니다.

- 가로형 영상은 원본 비율에 맞는 가로형 모달로 표시됩니다.
- 세로형 영상은 원본 비율에 맞는 세로형 모달로 표시됩니다.
- 정방형 영상도 `1:1` 레이아웃으로 자동 전환됩니다.

각 프로젝트의 제목, 분류, 영상 경로, 설명, 담당 업무와 기여 내용은
`index.html`의 `data-project`가 붙은 `<article>` 안에서 수정할 수 있습니다.

## 디자인 상세 팝업

Design Archive 카드도 클릭하면 이미지와 상세 설명이 담긴 팝업이 열립니다.
이미지는 `assets/images/design-01.jpg`부터 `design-04.jpg`까지 연결되어 있습니다.

각 디자인의 제목, 분류, 연도, 원본 이미지, 설명, 담당 업무와 기여 내용은
`index.html`의 `data-design`이 붙은 `<article>` 안에서 수정할 수 있습니다.

## 이력서 PDF

Contact의 원형 버튼을 클릭하면 이력서가 다운로드됩니다.
PDF 파일을 `assets/documents/resume.pdf` 경로에 넣으면 됩니다.

## 도구 아이콘

AI Workflow의 ChatGPT, Gemini, Kling 아이콘은 홈페이지 색상에 맞춘
단색 SVG 심볼로 `index.html`에 포함되어 있습니다.
# portfolio2
