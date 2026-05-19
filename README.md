# 김대근 취업 포트폴리오 홈페이지

제공된 이력서 이미지와 논문 PDF 내용을 바탕으로 만든 보안 중심 정적 포트폴리오입니다.
전체 흐름은 실제 공장에서의 로봇 제어, 기업과제, 연구 검증 성과가 이어지도록 구성했습니다.

## 구성

- `index.html`: 단일 페이지 포트폴리오
- `styles.css`: 반응형 스타일
- `app.js`: 메뉴, 현재 섹션 표시, 이메일 표시, 인쇄 동작
- `assets/profile-daekeun-kim.jpg`: 이력서 이미지에서 공개용으로 크롭한 프로필 사진

## 실행

브라우저에서 아래 파일을 직접 열면 됩니다.

```text
C:\Users\kdksg\Documents\홈페이지\index.html
```

## 외부 공개

현재 이 폴더에는 원격 저장소가 연결되어 있지 않습니다. 외부인이 보려면 GitHub Pages, Netlify, Cloudflare Pages 같은 정적 호스팅에 업로드해야 합니다.

### GitHub Pages

1. GitHub에서 새 저장소를 만듭니다.
2. 이 폴더를 저장소에 push합니다.
3. GitHub 저장소의 `Settings > Pages`에서 branch 배포를 켭니다.
4. 공개 URL을 받은 뒤 이력서나 지원서에 연결합니다.

### Netlify 또는 Cloudflare Pages

- 빌드 명령은 비워 둡니다.
- 배포 폴더는 저장소 루트로 지정합니다.
- `_headers` 파일이 지원되는 호스팅에서는 보안 헤더가 함께 적용됩니다.

## 보안 기준

- 외부 CDN, 외부 폰트, 분석 스크립트, 입력 폼을 사용하지 않습니다.
- 전화번호와 상세 주소는 공개 페이지에 넣지 않았습니다.
- 이메일은 클릭 후 표시되도록 처리했습니다.
- `Content-Security-Policy`, `referrer=no-referrer`, `object-src 'none'`, `frame-ancestors 'none'` 메타 정책을 포함했습니다.
- 정적 호스팅용 `_headers`, `robots.txt`, `.nojekyll` 파일을 추가했습니다.

## 내용 출처

- `RESUME_continental.png`, `지원서2026.png`
- `KICS2026_PSD.pdf`, `KICS2026_김대근.pdf`
- `ICROS 2026 SJY_dk.pdf`, `ICROS 2026 김대근OCC.pdf`, `ICROS.pdf`
- `jcci.pdf`, `JCCI2026- PSD.pdf`
