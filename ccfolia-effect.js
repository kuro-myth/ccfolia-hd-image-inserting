(async function() {
    // 1. 중복 실행 방지 및 청소
    if (window.__CCFOLIA_EFFECT_LOOP__) {
        clearInterval(window.__CCFOLIA_EFFECT_LOOP__);
        document.querySelectorAll('.ccfolia-ghost-layer').forEach(el => el.remove());
        console.log("기존 코코폴리아 연출 시스템을 재시작합니다.");
    }

    const REPO_BASE = "https://raw.githubusercontent.com/kuro-myth/ccfolia-hd-image-inserting/main/";
    const PLAYLIST_URL = REPO_BASE + "playlist.json";
    
    let playlist = {};
    try {
        const res = await fetch(PLAYLIST_URL);
        playlist = await res.json();
        console.log("연출 플레이리스트 로드 성공:");
    } catch (e) {
        console.error("플레이리스트 로드 실패.");
        return;
    }

    // 외부 연출 파일(.js)들을 동적으로 불러오기 위한 로더 함수
    window.__CCFOLIA_EFFECTS__ = window.__CCFOLIA_EFFECTS__ || {};
    async function loadExternalEffect(scriptName) {
        if (window.__CCFOLIA_EFFECTS__[scriptName]) return true; // 이미 로드됨
        try {
            const res = await fetch(REPO_BASE + scriptName);
            const text = await res.text();
            eval(text); // 브라우저 메모리에 연출 오토로딩
            return true;
        } catch(e) {
            console.error(`${scriptName} 연출 파일 로드 에러:`, e);
            return false;
        }
    }

    const activeLayers = new Map(); 

    // 2. 0.3초 주기 통합 감시 루프
    const syncLoop = async () => {
        const ccObjects = document.querySelectorAll('[data-field-object]');
        const foundKeywords = new Set();

        for (const obj of ccObjects) {
            const labelEl = obj.querySelector('[aria-label]');
            const ariaLabel = labelEl ? labelEl.getAttribute('aria-label') : "";
            const textContent = obj.textContent || "";
            const imgAlt = obj.querySelector('img') ? obj.querySelector('img').getAttribute('alt') || "" : "";
            
            const combinedText = (textContent + ariaLabel + imgAlt).replace(/\s+/g, '');

            for (const keyword in playlist) {
                if (combinedText.includes(keyword)) {
                    foundKeywords.add(keyword);
                    const effectTarget = playlist[keyword];

                    const rect = obj.getBoundingClientRect();
                    if (rect.width === 0 || rect.height === 0) continue;

                    // 레이어가 없는 경우 최초 빌드 프로세스
                    if (!activeLayers.has(keyword)) {
                        let layer;

                        // Case A: 분리된 외부 자바스크립트 연출 파일인 경우 (.js)
                        if (effectTarget.endsWith('.js')) {
                            const loaded = await loadExternalEffect(effectTarget);
                            if (loaded && window.__CCFOLIA_EFFECTS__[effectTarget]) {
                                layer = window.__CCFOLIA_EFFECTS__[effectTarget].create(keyword, obj, rect);
                            } else {
                                continue; // 로드 실패 시 스킵
                            }
                        } 
                        // Case B: 일반 외부 MP4 동영상인 경우
                        else if (effectTarget.toLowerCase().endsWith('.mp4')) {
                            layer = document.createElement('video');
                            layer.src = effectTarget;
                            layer.autoplay = true; layer.loop = true; layer.muted = true;
                            layer.setAttribute('playsinline', '');
                            layer.style.objectFit = 'cover';
                            layer.style.position = 'fixed'; layer.style.zIndex = '99999'; layer.style.pointerEvents = 'none';
                            document.body.appendChild(layer);
                        } 
                        // Case C: 일반 이미지나 GIF인 경우
                        else {
                            layer = document.createElement('img');
                            layer.src = effectTarget;
                            layer.style.objectFit = 'cover';
                            layer.style.position = 'fixed'; layer.style.zIndex = '99999'; layer.style.pointerEvents = 'none';
                            document.body.appendChild(layer);
                        }

                        activeLayers.set(keyword, { type: effectTarget, el: layer });
                    }

                    // [실시간 동기화]: 위치 및 크기 자석 싱크 업데이트 위임
                    const layerInfo = activeLayers.get(keyword);
                    if (layerInfo.type.endsWith('.js') && window.__CCFOLIA_EFFECTS__[layerInfo.type]) {
                        // 자바스크립트 연출 파일 내부에 정의된 고유의 update 공식 실행
                        window.__CCFOLIA_EFFECTS__[layerInfo.type].update(layerInfo.el, rect);
                    } else {
                        // 일반 미디어 파일은 엔진이 기본 1:1 싱크 제어
                        layerInfo.el.style.top = `${rect.top}px`;
                        layerInfo.el.style.left = `${rect.left}px`;
                        layerInfo.el.style.width = `${rect.width}px`;
                        layerInfo.el.style.height = `${rect.height}px`;
                    }
                }
            }
        }

        // 삭제 처리
        for (const [keyword, layerInfo] of activeLayers.entries()) {
            if (!foundKeywords.has(keyword)) {
                layerInfo.el.remove();
                activeLayers.delete(keyword);
            }
        }
    };

    window.__CCFOLIA_EFFECT_LOOP__ = setInterval(syncLoop, 300);
    console.log("코코폴리아 모듈러 연출 시스템 고도화 완료... 🎲");
})();
