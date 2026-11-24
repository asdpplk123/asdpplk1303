# 구황작물 농사 · 자생 채집 & 식물 도감 시뮬레이션

Three.js 기반 3D 농사·자연 채집 시뮬레이션 및 구황작물 도감 웹 애플리케이션입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

## 빌드 확인

```bash
npm run lint
npm run build
```

## GitHub 업로드 & Vercel 배포 방법

1. 압축을 푼 폴더에서 Git 저장소를 초기화하고 GitHub에 푸시합니다.
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <YOUR_GITHUB_REPO_URL>
   git push -u origin main
   ```
2. [Vercel](https://vercel.com) 대시보드에서 **Add New... → Project**를 선택하고 해당 GitHub 저장소를 연결합니다.
3. Framework Preset은 자동으로 **Vite**로 인식됩니다 (`Build Command: npm run build`, `Output Directory: dist`). **Deploy**를 누르면 바로 배포됩니다.
