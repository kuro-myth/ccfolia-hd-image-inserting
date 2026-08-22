// [메모리 누수 및 비동기 락 완벽 해결 버전]
(async function() {
    if (window.__CCFOLIA_EFFECT_LOOP__) {
        clearTimeout(window.__CCFOLIA_EFFECT_LOOP__); // setInterval 대신 구조 변경
        document.querySelectorAll('.ccfolia-ghost-layer').forEach(el => el.remove());
        console.log("기존 코코폴리아 연출 시스템을 재시작합니다.");
    }

    const REPO_BASE = "https://githubusercontent.com";
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

    window.__CCFOLIA_EFFECTS__ = window.__CCFOLIA_EFFECTS__ || {};
    async function loadExternalEffect(scriptName) {
        if (window.__CCFOLIA_EFFECTS__[scriptName]) return true;
        try {
            const res = await fetch(REPO_BASE + scriptName);
            const text = await res.text();
            eval(text);
            return true;
        } catch(e) {
            console.error(`${scriptName} 연출 파일 로드 에러:`, e);
            return false;
        }
    }

    const activeLayers = new Map(); 

    // 구조 개조: 무조건 이전 감시가 완벽히 끝난 뒤에만 1초 뒤 다음 감시를 예약 (병목 원천 차단)
    const syncLoop = async () => {
        try {
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

                        // 💡 [교정 부위] 장부에 있더라도 실제 브라우저 화면(DOM)에서 강제로 지워졌다면 재생성하도록 조건 강화
                        const existingLayer = activeLayers.get(keyword);
                        const isElementConnected = existingLayer && existingLayer.el && existingLayer.el.isConnected;

                        if (!isElementConnected) {
                            // 기존에 찌꺼기가 남아있었다면 청소
                            if (existingLayer && existingLayer.el) existingLayer.el.remove();

                            let layer;
                            if (effectTarget.endsWith('.js')) {
                                const loaded = await loadExternalEffect(effectTarget);
                                if (loaded && window.__CCFOLIA_EFFECTS__[effectTarget]) {
                                    layer = window.__CCFOLIA_EFFECTS__[effectTarget].create(keyword, obj, rect);
                                } else {
                                    continue;
                                }
                            } 
                            else if (effectTarget.toLowerCase().endsWith('.mp4')) {
                                layer = document.createElement('video');
                                layer.src = effectTarget;
                                layer.className = 'ccfolia-ghost-layer';
                                layer.autoplay = true; layer.loop = true; layer.muted = true;
                                layer.setAttribute('playsinline', '');
                                layer.style.objectFit = 'cover';
                                layer.style.position = 'fixed'; layer.style.zIndex = '99999'; layer.style.pointerEvents = 'none';
                                document.body.appendChild(layer);
                            } 
                            else {
                                layer = document.createElement('img');
                                layer.src = effectTarget;
                                layer.className = 'ccfolia-ghost-layer';
                                layer.style.objectFit = 'cover';
                                layer.style.position = 'fixed'; layer.style.zIndex = '99999'; layer.style.pointerEvents = 'none';
                                document.body.appendChild(layer);
                            }

                            activeLayers.set(keyword, { type: effectTarget, el: layer });
                        }

                        // 실시간 동기화 위임
                        const layerInfo = activeLayers.get(keyword);
                        if (layerInfo && layerInfo.el) {
                            if (layerInfo.type.endsWith('.js') && window.__CCFOLIA_EFFECTS__[layerInfo.type]) {
                                window.__CCFOLIA_EFFECTS__[layerInfo.type].update(layerInfo.el, rect);
                            } else {
                                layerInfo.el.style.top = `${rect.top}px`;
                                layerInfo.el.style.left = `${rect.left}px`;
                                layerInfo.el.style.width = `${rect.width}px`;
                                layerInfo.el.style.height = `${rect.height}px`;
                            }
                        }
                    }
                }
            }

            // 삭제 처리
            for (const [keyword, layerInfo] of activeLayers.entries()) {
                if (!foundKeywords.has(keyword)) {
                    if (layerInfo.el) layerInfo.el.remove();
                    activeLayers.delete(keyword);
                }
            }
        } catch (err) {
            console.error("루프 실행 중 에러 발생 (무시하고 다음 루프 진행):", err);
        } finally {
            // 💡 현재 감시 사이클이 정상적이든 에러가 났든 완전히 끝난 시점으로부터 '정확히 1초 뒤'에 다음 루프를 실행하도록 예약
            window.__CCFOLIA_EFFECT_LOOP__ = setTimeout(syncLoop, 1000);
        }
    };

    // 최초 루프 가동
    window.__CCFOLIA_EFFECT_LOOP__ = setTimeout(syncLoop, 1000);
    console.log("코코폴리아 안전성 최적화 모듈러 연출 시스템 고도화 완료... 🎲");
})();
