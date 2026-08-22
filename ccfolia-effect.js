// [최종 진화 완료: 오리지널 플래그 초기화 버그 완전 박멸 버전]
(async function() {
    if (window.__CCFOLIA_EFFECT_LOOP__) {
        clearTimeout(window.__CCFOLIA_EFFECT_LOOP__);
        document.querySelectorAll('.ccfolia-ghost-layer').forEach(el => el.remove());
        console.log("기존 코코폴리아 연출 시스템을 재시작합니다.");
    }

    const REPO_BASE = "https://raw.githubusercontent.com/kuro-myth/ccfolia-hd-image-inserting/main/";
    const PLAYLIST_URL = REPO_BASE + "playlist.json";
    
    let playlist = {};
    try {
        const res = await fetch(PLAYLIST_URL);
        playlist = await res.json();
        console.log("연출 플레이리스트 로드 성공.");
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

                // 1. NumberEffect 숫자 추출 엔진
                let isNumberEffect = false;
                let numKeyword = "";
                let extractedNumber = "";

                const numMatch = combinedText.match(/NumberEffect(\d+)/i);
                if (numMatch) {
                    isNumberEffect = true;
                    extractedNumber = numMatch[1];
                    numKeyword = `NumberEffect_${extractedNumber}`;
                    foundKeywords.add(numKeyword);
                }

                let targetKeyword = null;
                let effectTarget = null;

                if (isNumberEffect) {
                    targetKeyword = numKeyword;
                } else {
                    for (const keyword in playlist) {
                        if (combinedText.includes(keyword)) {
                            targetKeyword = keyword;
                            effectTarget = playlist[keyword];
                            foundKeywords.add(keyword);
                            break;
                        }
                    }
                }

                if (!targetKeyword) continue;

                // 🛑 [방어막 1] 오리지널 플래그 검사 - 이미 만료목록에 있다면 외부 루프는 복잡한 처리 다 거치고 즉시 패스
                if (window.__GLITCH_EXPIRED__ && window.__GLITCH_EXPIRED__.has(targetKeyword)) {
                    continue;
                }

                const rect = obj.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) continue;

                const existingLayer = activeLayers.get(targetKeyword);
                
                // 💡 [버그 교정 포인트] 외부 .js 연출 파일인 경우, 엘리먼트 파괴 여부를 외부 루프가 감시해서 초기화 유발하지 않도록 조건 격리
                const isScript = effectTarget && effectTarget.endsWith('.js');
                const isElementConnected = isScript ? !!existingLayer : (existingLayer && existingLayer.el && existingLayer.el.isConnected);

                if (!isElementConnected) {
                    if (existingLayer && existingLayer.el && !isScript) existingLayer.el.remove();

                    let layer;

                    // [Case 1] 숫자 단독 레이어 생성
                    if (isNumberEffect) {
                        layer = document.createElement('div');
                        layer.className = 'ccfolia-ghost-layer';
                        layer.innerHTML = `
                            <div style="
                                position: absolute; width: 100%; height: 100%;
                                display: flex; justify-content: center; align-items: center;
                                font-family: 'Impact', 'Arial Black', sans-serif;
                                font-size: ${rect.height * 0.7}px; font-weight: 900;
                                background: linear-gradient(to bottom, #fce4ec 0%, #da70d6 30%, #8a2be2 70%, #4b0082 100%);
                                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                                filter: drop-shadow(0px 0px 3px #ffffff) drop-shadow(0px 0px 1px #ffffff);
                                text-align: center; user-select: none; line-height: 1;
                            ">${extractedNumber}</div>
                        `;
                        layer.style.position = 'fixed'; layer.style.zIndex = '99999'; layer.style.pointerEvents = 'none';
                        document.body.appendChild(layer);
                        activeLayers.set(targetKeyword, { type: 'dynamic-number', el: layer });
                    } 
                    // [Case 2] 외부 .js 스크립트 가동
                    else if (isScript) {
                        const loaded = await loadExternalEffect(effectTarget);
                        if (loaded && window.__CCFOLIA_EFFECTS__[effectTarget]) {
                            layer = window.__CCFOLIA_EFFECTS__[effectTarget].create(targetKeyword, obj, rect);
                        } else {
                            continue;
                        }
                        // 스크립트 형태는 이펙트 자체의 내부 처리를 존중하기 위해 더미 래핑 저장
                        activeLayers.set(targetKeyword, { type: effectTarget, el: layer });
                    } 
                    // [Case 3] 외부 MP4 영상
                    else if (effectTarget.toLowerCase().endsWith('.mp4')) {
                        layer = document.createElement('video');
                        layer.src = effectTarget;
                        layer.className = 'ccfolia-ghost-layer';
                        layer.autoplay = true; layer.loop = true; layer.muted = true;
                        layer.setAttribute('playsinline', '');
                        layer.style.objectFit = 'cover';
                        layer.style.position = 'fixed'; layer.style.zIndex = '99999'; layer.style.pointerEvents = 'none';
                        document.body.appendChild(layer);
                        activeLayers.set(targetKeyword, { type: effectTarget, el: layer });
                    } 
                    // [Case 4] 일반 이미지나 GIF
                    else {
                        layer = document.createElement('img');
                        layer.src = effectTarget;
                        layer.className = 'ccfolia-ghost-layer';
                        layer.style.objectFit = 'cover';
                        layer.style.position = 'fixed'; layer.style.zIndex = '99999'; layer.style.pointerEvents = 'none';
                        document.body.appendChild(layer);
                        activeLayers.set(targetKeyword, { type: effectTarget, el: layer });
                    }
                }

                // [위치 자석 싱크 동기화]
                const layerInfo = activeLayers.get(targetKeyword);
                if (layerInfo && layerInfo.el) {
                    if (layerInfo.type.endsWith('.js') && window.__CCFOLIA_EFFECTS__[layerInfo.type]) {
                        // 만료 확인 검사를 한 번 더 수행하여 완벽 차단
                        if (!(window.__GLITCH_EXPIRED__ && window.__GLITCH_EXPIRED__.has(targetKeyword))) {
                            window.__CCFOLIA_EFFECTS__[layerInfo.type].update(layerInfo.el, rect);
                        }
                    } else {
                        layerInfo.el.style.top = `${rect.top}px`;
                        layerInfo.el.style.left = `${rect.left}px`;
                        layerInfo.el.style.width = `${rect.width}px`;
                        layerInfo.el.style.height = `${rect.height}px`;
                    }
                }
            }

            // ♻️ 패널 삭제/비공개 시 청소 프로세스 전면 수정
            for (const [keyword, layerInfo] of activeLayers.entries()) {
                if (!foundKeywords.has(keyword)) {
                    // 일반 미디어 레이어만 외부 엔진이 지우고, .js 스크립트 엘리먼트는 지우지 않고 방치 (스스로 죽게 놔둠)
                    if (layerInfo.el && !layerInfo.type.endsWith('.js')) {
                        layerInfo.el.remove();
                    }
                    activeLayers.delete(keyword);
                    
                    // 화면에서 실제 패널 문구가 완전히 사라졌을 때에만 만료 플래그를 지워 복구시킵니다.
                    if (window.__GLITCH_EXPIRED__) {
                        window.__GLITCH_EXPIRED__.delete(keyword);
                    }
                }
            }

        } catch (err) {
            console.error("루프 에러 발생:", err);
        } {
            window.__CCFOLIA_EFFECT_LOOP__ = setTimeout(syncLoop, 1000);
        }
    };

    window.__CCFOLIA_EFFECT_LOOP__ = setTimeout(syncLoop, 1000);
    console.log("코코폴리아 오리지널 생명주기 완벽 보존 버전 가동... 🎲");
})();
