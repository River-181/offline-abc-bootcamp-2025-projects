# 2팀 프로젝트 저장소 - 가상 피팅룸

## 프로젝트 소개
웹 기반 가상 피팅룸 애플리케이션입니다. 사용자가 전신 사진을 업로드하고 다양한 옷 스티커를 드래그해서 가상으로 입어볼 수 있습니다.

## 주요 기능
- 📸 전신 사진 업로드 및 배경 설정
- 👗 다양한 옷 아이템 선택 (JSON 데이터 기반)
- 🎨 Fabric.js를 활용한 드래그, 크기 조절, 회전 기능
- 💾 완성된 피팅 이미지 PNG 다운로드
- 📱 반응형 디자인 (모바일 친화적)
- ✨ 종이 질감 배경과 손글씨 폰트로 아날로그 감성

## 기술 스택
- **Frontend**: HTML5, JavaScript (ES6+), CSS3
- **라이브러리**: 
  - Fabric.js (캔버스 조작)
  - Tailwind CSS (스타일링)
  - Google Fonts (Caveat, Kalam)
- **데이터**: JSON 파일 기반 옷 아이템 관리

## 폴더 구조
```
team-02/
├── index.html              # 메인 페이지
├── js/
│   └── app.js              # 메인 애플리케이션 로직
├── css/
│   └── style.css           # 커스텀 스타일
├── assets/
│   └── clothes/            # 옷 이미지 파일들
│       ├── white_shirt.png
│       ├── blue_tshirt.png
│       ├── classic_jeans.png
│       ├── pleats_skirt.png
│       ├── summer_dress.png
│       ├── leather_jacket.png
│       ├── knit_sweater.png
│       └── denim_shorts.png
├── clothes.json            # 옷 아이템 데이터
└── README.md
```

## 사용 방법
1. `index.html` 파일을 브라우저에서 열기
2. "전신 사진 업로드" 버튼을 클릭하여 배경 이미지 설정
3. 가상 옷장에서 원하는 옷 아이템 클릭
4. 캔버스에서 옷을 드래그하여 위치 조정
5. 모서리를 드래그하여 크기 조절
6. "저장하기" 버튼으로 완성된 이미지 다운로드

## 주요 클래스 및 메서드
### VirtualFittingRoom 클래스
- `init()`: 애플리케이션 초기화
- `initCanvas()`: Fabric.js 캔버스 설정
- `loadClothesData()`: JSON에서 옷 데이터 로드
- `handlePhotoUpload()`: 사진 업로드 처리
- `addClothToCanvas()`: 캔버스에 옷 추가
- `downloadImage()`: 이미지 다운로드

## 키보드 단축키
- `Delete`: 선택된 옷 아이템 삭제
- `Ctrl/Cmd + Z`: 선택된 객체 삭제 (간단한 실행취소)

## 브라우저 호환성
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 개발 노트
- SVG 형태의 예시 이미지가 포함되어 있습니다. 실제 사용 시 PNG 이미지로 교체하세요.
- `clothes.json` 파일을 수정하여 새로운 옷 아이템을 추가할 수 있습니다.
- 반응형 디자인으로 모바일에서도 사용 가능합니다.

## 향후 개선 사항
- [ ] 더 많은 옷 카테고리 추가
- [ ] 색상 변경 기능
- [ ] 레이어 순서 조정 기능
- [ ] 소셜 미디어 공유 기능
- [ ] 실제 PNG 이미지 에셋 교체

## 멤버

