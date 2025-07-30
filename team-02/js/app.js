// 가상 피팅룸 애플리케이션
class VirtualFittingRoom {
    constructor() {
        this.canvas = null;
        this.clothesData = [];
        this.backgroundImage = null;
        this.init();
    }

    // 초기화
    async init() {
        try {
            // Fabric.js 캔버스 초기화
            this.initCanvas();
            
            // 이벤트 리스너 등록
            this.initEventListeners();
            
            // 옷 데이터 로드
            await this.loadClothesData();
            
            console.log('가상 피팅룸이 초기화되었습니다.');
        } catch (error) {
            console.error('초기화 중 오류가 발생했습니다:', error);
            this.showError('애플리케이션 초기화에 실패했습니다.');
        }
    }

    // Fabric.js 캔버스 초기화
    initCanvas() {
        this.canvas = new fabric.Canvas('fittingCanvas', {
            backgroundColor: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
            selection: true,
            preserveObjectStacking: true
        });

        // 캔버스 기본 설정
        this.canvas.setDimensions({
            width: 500,
            height: 700
        });

        // 객체 선택 시 컨트롤 스타일 설정
        fabric.Object.prototype.set({
            transparentCorners: false,
            cornerColor: '#ff6b6b',
            cornerStrokeColor: '#ff5252',
            borderColor: '#ff5252',
            cornerSize: 12,
            padding: 5,
            cornerStyle: 'circle'
        });
    }

    // 이벤트 리스너 등록
    initEventListeners() {
        // 사진 업로드
        const photoUpload = document.getElementById('photoUpload');
        photoUpload.addEventListener('change', (e) => this.handlePhotoUpload(e));

        // 배경 제거 버튼
        const removeBackground = document.getElementById('removeBackground');
        removeBackground.addEventListener('click', () => this.removeBackground());

        // 캔버스 초기화 버튼
        const clearCanvas = document.getElementById('clearCanvas');
        clearCanvas.addEventListener('click', () => this.clearCanvas());

        // 이미지 다운로드 버튼
        const downloadImage = document.getElementById('downloadImage');
        downloadImage.addEventListener('click', () => this.downloadImage());

        // 캔버스 객체 이벤트
        this.canvas.on('object:added', () => this.updateCanvasState());
        this.canvas.on('object:removed', () => this.updateCanvasState());
    }

    // 옷 데이터 로드
    async loadClothesData() {
        try {
            const response = await fetch('clothes.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.clothesData = data.clothes;
            this.renderClothesGrid();
        } catch (error) {
            console.error('옷 데이터 로드 실패:', error);
            this.renderClothesError();
        }
    }

    // 옷 목록 렌더링
    renderClothesGrid() {
        const clothesList = document.getElementById('clothesList');
        
        if (this.clothesData.length === 0) {
            clothesList.innerHTML = `
                <div class="text-center text-amber-600 col-span-2 py-8">
                    <div class="text-3xl mb-2">😅</div>
                    <div class="font-notebook">옷장이 비어있습니다.</div>
                </div>
            `;
            return;
        }

        clothesList.innerHTML = this.clothesData.map(cloth => `
            <div class="cloth-item group" data-cloth-id="${cloth.id}">
                <div class="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden flex items-center justify-center">
                    <img 
                        src="${cloth.image}" 
                        alt="${cloth.name}"
                        class="max-w-full max-h-full object-contain transition-transform group-hover:scale-110"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                    >
                    <div class="hidden flex-col items-center justify-center text-gray-400">
                        <div class="text-2xl mb-1">👕</div>
                        <div class="text-xs">이미지 없음</div>
                    </div>
                </div>
                <div class="text-center">
                    <div class="font-semibold text-sm text-gray-800 truncate" title="${cloth.name}">
                        ${cloth.name}
                    </div>
                    <div class="text-xs text-gray-600 mt-1">
                        ${cloth.category}
                    </div>
                </div>
            </div>
        `).join('');

        // 옷 아이템 클릭 이벤트 등록
        clothesList.addEventListener('click', (e) => {
            const clothItem = e.target.closest('.cloth-item');
            if (clothItem) {
                const clothId = clothItem.dataset.clothId;
                this.addClothToCanvas(clothId);
            }
        });
    }

    // 옷 데이터 로드 실패 시 에러 표시
    renderClothesError() {
        const clothesList = document.getElementById('clothesList');
        clothesList.innerHTML = `
            <div class="text-center text-red-600 col-span-2 py-8">
                <div class="text-3xl mb-2">😰</div>
                <div class="font-notebook">옷 데이터를 불러올 수 없습니다.</div>
                <button 
                    onclick="location.reload()" 
                    class="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                >
                    다시 시도
                </button>
            </div>
        `;
    }

    // 사진 업로드 처리
    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 파일 타입 검증
        if (!file.type.startsWith('image/')) {
            this.showError('이미지 파일만 업로드할 수 있습니다.');
            return;
        }

        // 파일 크기 검증 (10MB 제한)
        if (file.size > 10 * 1024 * 1024) {
            this.showError('파일 크기가 너무 큽니다. (최대 10MB)');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.setBackgroundImage(e.target.result);
        };
        reader.onerror = () => {
            this.showError('파일을 읽는 중 오류가 발생했습니다.');
        };
        reader.readAsDataURL(file);
    }

    // 배경 이미지 설정
    setBackgroundImage(imageUrl) {
        fabric.Image.fromURL(imageUrl, (img) => {
            // 이미지를 캔버스 크기에 맞게 조정
            const canvasWidth = this.canvas.width;
            const canvasHeight = this.canvas.height;
            
            const scaleX = canvasWidth / img.width;
            const scaleY = canvasHeight / img.height;
            const scale = Math.min(scaleX, scaleY);
            
            img.set({
                scaleX: scale,
                scaleY: scale,
                left: (canvasWidth - img.width * scale) / 2,
                top: (canvasHeight - img.height * scale) / 2,
                selectable: false,
                evented: false,
                excludeFromExport: false
            });

            // 기존 배경 이미지 제거
            if (this.backgroundImage) {
                this.canvas.remove(this.backgroundImage);
            }

            this.backgroundImage = img;
            this.canvas.add(img);
            this.canvas.sendToBack(img);
            this.canvas.renderAll();

            // 배경 제거 버튼 활성화
            document.getElementById('removeBackground').disabled = false;
            
            this.showSuccess('배경 이미지가 설정되었습니다!');
        }, {
            crossOrigin: 'anonymous'
        });
    }

    // 배경 이미지 제거
    removeBackground() {
        if (this.backgroundImage) {
            this.canvas.remove(this.backgroundImage);
            this.backgroundImage = null;
            this.canvas.renderAll();
            
            // 배경 제거 버튼 비활성화
            document.getElementById('removeBackground').disabled = true;
            
            this.showSuccess('배경 이미지가 제거되었습니다.');
        }
    }

    // 캔버스에 옷 추가
    addClothToCanvas(clothId) {
        const cloth = this.clothesData.find(c => c.id === clothId);
        if (!cloth) {
            this.showError('옷 정보를 찾을 수 없습니다.');
            return;
        }

        // 로딩 상태 표시
        this.showLoading(`${cloth.name} 추가 중...`);

        fabric.Image.fromURL(cloth.image, (img) => {
            if (!img.getElement()) {
                this.hideLoading();
                this.showError(`${cloth.name} 이미지를 불러올 수 없습니다.`);
                return;
            }

            // 기본 크기 설정
            const defaultWidth = cloth.defaultSize.width;
            const defaultHeight = cloth.defaultSize.height;
            
            const scaleX = defaultWidth / img.width;
            const scaleY = defaultHeight / img.height;
            
            img.set({
                left: Math.random() * (this.canvas.width - defaultWidth),
                top: Math.random() * (this.canvas.height - defaultHeight),
                scaleX: scaleX,
                scaleY: scaleY,
                selectable: true,
                evented: true,
                hasControls: true,
                hasBorders: true,
                transparentCorners: false
            });

            // 옷 정보를 객체에 저장
            img.clothInfo = cloth;

            this.canvas.add(img);
            this.canvas.setActiveObject(img);
            this.canvas.renderAll();

            this.hideLoading();
            this.showSuccess(`${cloth.name}이(가) 추가되었습니다!`);
        }, {
            crossOrigin: 'anonymous'
        });
    }

    // 캔버스 초기화
    clearCanvas() {
        if (confirm('정말로 모든 옷을 제거하시겠습니까?')) {
            // 배경 이미지를 제외한 모든 객체 제거
            const objects = this.canvas.getObjects().filter(obj => obj !== this.backgroundImage);
            objects.forEach(obj => this.canvas.remove(obj));
            this.canvas.renderAll();
            
            this.showSuccess('캔버스가 초기화되었습니다.');
        }
    }

    // 이미지 다운로드
    downloadImage() {
        try {
            // 캔버스를 이미지로 변환
            const dataURL = this.canvas.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: 2 // 고해상도를 위해 2배 크기로 내보내기
            });

            // 다운로드 링크 생성
            const link = document.createElement('a');
            link.download = `virtual-fitting-${new Date().getTime()}.png`;
            link.href = dataURL;
            
            // 다운로드 실행
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showSuccess('이미지가 저장되었습니다!');
        } catch (error) {
            console.error('이미지 다운로드 오류:', error);
            this.showError('이미지 저장에 실패했습니다.');
        }
    }

    // 캔버스 상태 업데이트
    updateCanvasState() {
        // 캔버스에 객체가 있는지 확인하여 UI 상태 업데이트
        const hasObjects = this.canvas.getObjects().length > (this.backgroundImage ? 1 : 0);
        // 필요시 여기에 UI 상태 업데이트 로직 추가
    }

    // 성공 메시지 표시
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    // 에러 메시지 표시
    showError(message) {
        this.showNotification(message, 'error');
    }

    // 알림 표시
    showNotification(message, type = 'info') {
        // 기존 알림 제거
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast-notification fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 font-notebook transform transition-all duration-300 translate-x-full`;
        
        // 타입별 스타일 설정
        const styles = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        
        toast.className += ` ${styles[type] || styles.info}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // 애니메이션으로 표시
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // 로딩 표시
    showLoading(message = '로딩 중...') {
        const loading = document.createElement('div');
        loading.id = 'loadingOverlay';
        loading.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        loading.innerHTML = `
            <div class="bg-white rounded-lg p-6 text-center font-notebook">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
                <div class="text-amber-800">${message}</div>
            </div>
        `;
        document.body.appendChild(loading);
    }

    // 로딩 숨김
    hideLoading() {
        const loading = document.getElementById('loadingOverlay');
        if (loading) {
            loading.remove();
        }
    }
}

// DOM이 로드된 후 애플리케이션 시작
document.addEventListener('DOMContentLoaded', () => {
    // 브라우저 호환성 체크
    if (typeof fabric === 'undefined') {
        alert('Fabric.js 라이브러리를 불러올 수 없습니다. 인터넷 연결을 확인해주세요.');
        return;
    }

    // 가상 피팅룸 앱 인스턴스 생성
    window.fittingRoom = new VirtualFittingRoom();
});

// 키보드 단축키 추가
document.addEventListener('keydown', (e) => {
    if (!window.fittingRoom) return;

    // Ctrl/Cmd + Z: 실행 취소 (간단한 구현)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        // 선택된 객체 삭제
        const activeObject = window.fittingRoom.canvas.getActiveObject();
        if (activeObject && activeObject !== window.fittingRoom.backgroundImage) {
            window.fittingRoom.canvas.remove(activeObject);
            window.fittingRoom.canvas.renderAll();
        }
    }

    // Delete 키: 선택된 객체 삭제
    if (e.key === 'Delete') {
        const activeObject = window.fittingRoom.canvas.getActiveObject();
        if (activeObject && activeObject !== window.fittingRoom.backgroundImage) {
            window.fittingRoom.canvas.remove(activeObject);
            window.fittingRoom.canvas.renderAll();
        }
    }
});

// 창 크기 변경 시 캔버스 반응형 조정
window.addEventListener('resize', () => {
    if (window.fittingRoom && window.fittingRoom.canvas) {
        // 모바일에서 캔버스 크기 조정
        if (window.innerWidth < 768) {
            const container = document.querySelector('#fittingCanvas').parentElement;
            const containerWidth = container.clientWidth - 32; // 패딩 고려
            const scale = Math.min(containerWidth / 500, 1);
            
            window.fittingRoom.canvas.setZoom(scale);
        } else {
            window.fittingRoom.canvas.setZoom(1);
        }
        window.fittingRoom.canvas.renderAll();
    }
});
