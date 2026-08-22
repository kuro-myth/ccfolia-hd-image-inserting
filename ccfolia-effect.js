// [최적화 완료: 메모리 누수 방지 + 깔끔한 보라색 숫자 연출 엔진]
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

                // --------------------------------------------------------
                // 💡 NumberEffect 숫자 추출 매퍼 (배경 제외 텍스트 전용)
                // --------------------------------------------------------
                let isNumberEffect = false;
                let numKeyword = "";
                let extractedNumber = "";

                const numMatch = combinedText.match(/NumberEffect(\d+)/i);
                if (numMatch) {
                    isNumberEffect = true;
                    extractedNumber = numMatch[1]; // 첫 번째 캡처 그룹에서 숫자만 추출
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

                const rect = obj.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) continue;

                const existingLayer = activeLayers.get(targetKeyword);
                const isElementConnected = existingLayer && existingLayer.el && existingLayer.el.isConnected;

                if (!isElementConnected) {
                    if (existingLayer && existingLayer.el) existingLayer.el.remove();

                    let layer;

                    // [Case 1] 깔끔한 숫자 단독 레이어 생성
                    if (isNumberEffect) {
                        layer = document.createElement('div');
                        layer.className = 'ccfolia-ghost-layer';
                        
                        // 뒷배경 없이 이미지와 동일한 폰트 외곽선 및 보라색 네온 그라데이션 구현
                        layer.innerHTML = `
                            <div style="
                                position: absolute;
                                width: 100%;
                                height: 100%;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                font-family: 'Impact', 'Arial Black', sans-serif;
                                font-size: ${rect.height * 0.7}px; /* 패널 크기에 맞춰 글자 크기 최적화 */
                                font-weight: 900;
                                background: linear-gradient(to bottom, #fce4ec 0%, #da70d6 30%, #8a2be2 70%, #4b0082 100%);
                                -webkit-background-clip: text;
                                -webkit-text-fill-color: transparent;
                                filter: drop-shadow(0px 0px 3px #ffffff) drop-shadow(0px 0px 1px #ffffff);
                                text-align: center;
                                user-select: none;
                                line-height: 1;
                            ">${extractedNumber}</div>
                        `;
                        layer.style.position = 'fixed';
                        layer.style.zIndex = '99999';
                        layer.style.pointerEvents = 'none';
                        document.body.appendChild(layer);

                        activeLayers.set(targetKeyword, { type: 'dynamic-number', el: layer });
                    } 
                    // [Case 2] 외부 .js 스크립트 실행
                    else if (effectTarget.endsWith('.js')) {
                        const loaded = await loadExternalEffect(effectTarget);
                        if (loaded && window.__CCFOLIA_EFFECTS__[effectTarget]) {
                            layer = window.__CCFOLIA_EFFECTS__[effectTarget].create(targetKeyword, obj, rect);
                        } else {
                            continue;
                        }
                        activeLayers.set(targetKeyword, { type: effectTarget, el: layer });
                    } 
                    // [Case 3] 외부 MP4 영상 재생
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
                    // [Case 4] 일반 이미지나 GIF 출력
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

                // [위치 추적 자석 싱크]
                const layerInfo = activeLayers.get(targetKeyword);
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

            // 패널이 사라지거나 비공개 처리되었을 때 유령 레이어 자동 파괴
            for (const [keyword, layerInfo] of activeLayers.entries()) {
                if (!foundKeywords.has(keyword)) {
                    if (layerInfo.el) layerInfo.el.remove();
                    activeLayers.delete(keyword);
                }
            }
        } catch (err) {
            console.error("루프 에러 발생:", err);
        } finally {
            window.__CCFOLIA_EFFECT_LOOP__ = setTimeout(syncLoop, 1000);
        }
    };

    window.__CCFOLIA_EFFECT_LOOP__ = setTimeout(syncLoop, 1000);
    console.log("코코폴리아 텍스트 넘버 연출 엔진 세팅 완료... 🎲");
})();
