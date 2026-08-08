(async function() {
    // 1. 이미 실행 중인 엔진이 있다면 중복 실행 방지 및 청소
    if (window.__CCFOLIA_EFFECT_LOOP__) {
        clearInterval(window.__CCFOLIA_EFFECT_LOOP__);
        document.querySelectorAll('.ccfolia-ghost-layer').forEach(el => el.remove());
        console.log("기존 코코폴리아 연출 시스템을 재시작합니다.");
    }

    // 2. 마스터의 깃허브 주소로부터 플레이리스트 동적 로드
    // *테스트 시 본인의 깃허브 raw 주소로 변경하세요.
    const PLAYLIST_URL = "https://raw.githubusercontent.com/kuro-myth/ccfolia-hd-image-inserting/main/playlist.json";
    let playlist = {};
    try {
        const res = await fetch(PLAYLIST_URL);
        playlist = await res.json();
        console.log("연출 플레이리스트 로드 성공:", playlist);
    } catch (e) {
        console.error("플레이리스트 로드 실패. 하드코딩된 기본값으로 대체합니다.", e);
        playlist = { "[폭발]": "https://w3schools.com" }; // 테스트용 샘플 영상
    }

    // 3. 유령 레이어 관리를 위한 매핑 테이블 (메모리 유지용)
    const activeLayers = new Map(); 

    // 4. 0.3초 주기 실시간 추적 루프 함수
    const syncLoop = () => {
        // 코코폴리아의 모든 오브젝트 수집
        const ccObjects = document.querySelectorAll('[data-field-object]');
        const foundKeywords = new Set();

        ccObjects.forEach(obj => {
            // 태그 내부의 글씨나 aria-label, 혹은 자식 태그의 alt 속성 등에서 키워드 탐색
            const textContent = obj.textContent || "";
            const ariaLabel = obj.getAttribute('aria-label') || "";
            const imgAlt = obj.querySelector('img') ? obj.querySelector('img').getAttribute('alt') || "" : "";
            
            const combinedText = (textContent + ariaLabel + imgAlt).replace(/\s+/g, '');

            // 등록된 플레이리스트 키워드가 포함되어 있는지 검사
            for (const keyword in playlist) {
                if (combinedText.includes(keyword)) {
                    foundKeywords.add(keyword);
                    const mediaUrl = playlist[keyword];

                    // 화면상 절대 좌표 추출 (transform 배율/이동이 자동 계산된 결과값)
                    const rect = obj.getBoundingClientRect();
                    
                    // 패널이 완전히 화면 밖에 있거나 숨겨진 경우 처리 불필요
                    if (rect.width === 0 || rect.height === 0) continue;

                    // 아직 생성되지 않은 유령 레이어라면 새롭게 생성하여 body에 주입
                    if (!activeLayers.has(keyword)) {
                        let layer;
                        if (mediaUrl.endsWith('.mp4')) {
                            layer = document.createElement('video');
                            layer.src = mediaUrl;
                            layer.autoplay = true;
                            layer.loop = true;
                            layer.muted = true; // 브라우저 정책상 자동재생은 무음 필수
                            layer.setAttribute('playsinline', '');
                        } else {
                            layer = document.createElement('img');
                            layer.src = mediaUrl;
                        }

                        // 가상 DOM 청소 폭풍 우회를 위한 스타일링 기믹
                        layer.className = 'ccfolia-ghost-layer';
                        layer.style.position = 'fixed';
                        layer.style.zIndex = '99999'; // 코코폴리아 최상단에 배치
                        layer.style.pointerEvents = 'none'; // 📌 클릭 신호 통과 패스포트
                        layer.style.objectFit = 'cover';
                        
                        document.body.appendChild(layer);
                        activeLayers.set(keyword, layer);
                    }

                    // 위치 및 크기 자석 동기화 (카메라 이동/확대축소 실시간 대응)
                    const layer = activeLayers.get(keyword);
                    layer.style.top = `${rect.top}px`;
                    layer.style.left = `${rect.left}px`;
                    layer.style.width = `${rect.width}px`;
                    layer.style.height = `${rect.height}px`;
                }
            }
        });

        // 마스터가 코코폴리아 패널을 [비공개/삭제]하여 키워드가 사라졌다면 유령 레이어도 증발시킴
        for (const [keyword, layer] of activeLayers.entries()) {
            if (!foundKeywords.has(keyword)) {
                layer.remove();
                activeLayers.delete(keyword);
            }
        }
    };

    // 루프 실행 및 전역 변수에 등록 (언제든 끄고 켤 수 있게)
    window.__CCFOLIA_EFFECT_LOOP__ = setInterval(syncLoop, 300);
    console.log("코코폴리아 초고화질 연출 엔진 작동 중... 🎲");
})();
