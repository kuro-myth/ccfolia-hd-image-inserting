// [최종 교정: 숫자 스케일 자동 정밀 동기화 버전]
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
                
                // 💡 패널 감지용 텍스트 (공백 제거)
                const combinedText = (textContent + ariaLabel + imgAlt).replace(/\s+/g, '');

                let isNumberEffect = false;
                let numKeyword = "";
                let extractedNumber = "";

                // 정규식 조준경 가동
                const numMatch = combinedText.match(/NumberEffect(\d+)/i);
                if (numMatch) {
                    isNumberEffect = true;
                    extractedNumber = numMatch[1]; // 💡 [교정] 배열이 아닌 '순수 숫자 문자열'만 정확히 추출
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

                // 오리지널 플래그 검사 (공간왜곡 등 방어용)
                if (window.__GLITCH_EXPIRED__ && window.__GLITCH_EXPIRED__.has(targetKeyword)) {
                    continue;
                }

                const rect = obj.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) continue;

                const existingLayer = activeLayers.get(targetKeyword);
                const isScript = effectTarget && effectTarget.endsWith('.js');
                const isElementConnected = isScript ? !!existingLayer : (existingLayer && existingLayer.el && existingLayer.el.isConnected);

                if (!isElementConnected) {
                    if (existingLayer && existingLayer.el && !isScript) existingLayer.el.remove();

                    let layer;

                    // [Case 1] 넘버 이펙트 전용 동적 폰트 스케일링 레이어
                    if (isNumberEffect) {
                        layer = document.createElement('div');
                        layer.className = 'ccfolia-ghost-layer';
                        
                        // 💡 패널 높이(rect.height)를 자석처럼 실시간 역산하여 폰트 크기 동기화
                        // flex-오버레이를 씌워 강제로 중앙에 묶어둡니다.
                        layer.innerHTML = `
                            <div class="ccfolia-dynamic-text-node" style="
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                width: 100%;
                                height: 100%;
                                font-family: 'Impact', 'Arial Black', sans-serif;
                                font-size: ${rect.height * 0.85}px; /* 💡 패널 높이의 85% 크기로 가득 차게 세팅 */
                                font-weight: 900;
                                background: linear-gradient(to bottom, #fce4ec 0%, #da70d6 30%, #8a2be2 70%, #4b0082 100%);
                                -webkit-background-clip: text;
                                -webkit-text-fill-color: transparent;
                                filter: drop-shadow(0px 0px 4px #ffffff) drop-shadow(0px 0px 1px #ffffff);
                                text-align: center;
                                user-select: none;
                                line-height: 1;
                                white-space: nowrap;
                            ">${extractedNumber}</div>
                        `;
                        layer.style.position = 'fixed';
                        layer.style.zIndex = '99999';
                        layer.style.pointerEvents = 'none';
                        document.body.appendChild(layer);
                        activeLayers.set(targetKeyword, { type: 'dynamic-number', el: layer });
                    } 
                    // [Case 2] 외부 스크립트 실행
                    else if (isScript) {
                        const loaded = await loadExternalEffect(effectTarget);
                        if (loaded && window.__CCFOLIA_EFFECTS__[effectTarget]) {
                            layer = window.__CCFOLIA_EFFECTS__[effectTarget].create(targetKeyword, obj, rect);
                        } else {
                            continue;
                        }
                        activeLayers.set(targetKeyword, { type: effectTarget, el: layer });
                    } 
                    // [Case 3] MP4 영상
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
                    // [Case 4] 이미지 또는 GIF
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

                // [실시간 1:1 자석 위치 및 폰트 크기 리사이징 왜곡 동기화]
                const layerInfo = activeLayers.get(targetKeyword);
                if (layerInfo && layerInfo.el) {
                    if (layerInfo.type.endsWith('.js') && window.__CCFOLIA_EFFECTS__[layerInfo.type]) {
                        if (!(window.__GLITCH_EXPIRED__ && window.__GLITCH_EXPIRED__.has(targetKeyword))) {
                            window.__CCFOLIA_EFFECTS__[layerInfo.type].update(layerInfo.el, rect);
                        }
                    } else {
                        // 💡 패널 크기를 마우스로 드래그해서 키우거나 줄여도 숫자가 실시간으로 1:1 추적하며 크기가 변합니다.
                        layerInfo.el.style.top = `${rect.top}px`;
                        layerInfo.el.style.left = `${rect.left}px`;
                        layerInfo.el.style.width = `${rect.width}px`;
                        layerInfo.el.style.height = `${rect.height}px`;

                        // 넘버 이펙트인 경우 폰트 사이즈도 실시간 드래그 비율에 맞춰 다시 계산
                        if (layerInfo.type === 'dynamic-number') {
                            const textNode = layerInfo.el.querySelector('.ccfolia-dynamic-text-node');
                            if (textNode) {
                                textNode.style.fontSize = `${rect.height * 0.85}px`;
                            }
                        }
                    }
                }
            }

            // 청소 루프
            for (const [keyword, layerInfo] of activeLayers.entries()) {
                if (!foundKeywords.has(keyword)) {
                    if (layerInfo.el && !layerInfo.type.endsWith('.js')) {
                        layerInfo.el.remove();
                    }
                    activeLayers.delete(keyword);
                    if (window.__GLITCH_EXPIRED__) {
                        window.__GLITCH_EXPIRED__.delete(keyword);
                    }
                }
            }

        } catch (err) {
            console.error("루프 에러 발생:", err);
        } finally {
            window.__CCFOLIA_EFFECT_LOOP__ = setTimeout(syncLoop, 1000);
        }
    };

    window.__CCFOLIA_EFFECT_LOOP__ = setTimeout(syncLoop, 1000);
    console.log("코코폴리아 폰트 스케일 고정 매칭 완료... 🎲");
})();
