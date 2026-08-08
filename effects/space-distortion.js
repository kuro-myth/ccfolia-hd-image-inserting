// [방안 C 고도화: 2초간 강렬하게 폭발한 뒤 자동 원상복구되는 시한폭탄형 공간 왜곡 필터]
(function() {
    const EFFECT_ID = "effects/space-distortion.js";

    window.__CCFOLIA_EFFECTS__ = window.__CCFOLIA_EFFECTS__ || {};
    window.__CCFOLIA_EFFECTS__[EFFECT_ID] = {
        
        create: function(keyword, obj, rect) {
            // 1. 이미 심어진 SVG 필터가 없다면 body에 주입
            if (!document.getElementById('ccfolia-svg-distortion-filter')) {
                const svgContainer = document.createElement('div');
                svgContainer.id = 'ccfolia-svg-distortion-filter';
                svgContainer.style.position = 'absolute';
                svgContainer.style.width = '0';
                svgContainer.style.height = '0';
                svgContainer.style.overflow = 'hidden';
                
                svgContainer.innerHTML = `
                    <svg xmlns="http://w3.org">
                        <filter id="ccfolia-glitch-filter">
                            <feTurbulence id="ccfolia-noise-prop" type="fractalNoise" baseFrequency="0.05 0.95" numOctaves="1" result="noise" seed="0" />
                            <feDisplacementMap in="SourceGraphic" in2="noise" scale="70" xChannelSelector="R" yChannelSelector="G" />
                        </filter>
                    </svg>
                `;
                document.body.appendChild(svgContainer);
            }

            // 2. 코코폴리아 전체 화면인 #root 상자에 필터 적용
            const rootContainer = document.getElementById('root');
            if (rootContainer) {
                rootContainer.style.filter = "url(#ccfolia-glitch-filter)";
                rootContainer.style.transition = "none"; 
            }

            // 3. 지익지익 실시간 50ms 초고속 난수 루프 가동
            if (!window.__CCFOLIA_GLITCH_TIMER__) {
                const noiseElement = document.getElementById('ccfolia-noise-prop');
                window.__CCFOLIA_GLITCH_TIMER__ = setInterval(() => {
                    if (noiseElement) {
                        noiseElement.setAttribute('seed', Math.floor(Math.random() * 100));
                        if (Math.random() > 0.7) {
                            noiseElement.setAttribute('baseFrequency', `0.02 ${0.5 + Math.random() * 0.5}`);
                        } else {
                            noiseElement.setAttribute('baseFrequency', "0.05 0.95");
                        }
                    }
                }, 50);
            }

            // 🎯 [핵심 추가]: 2초(2000ms) 뒤에 필터를 끄고 청소하는 시한폭탄 타이머
            // 2초 뒤 화면은 즉시 정상화되지만, 마스터가 코코폴리아 패널 이름을 지울 때까지 
            // 감시 엔진(ccfolia-effect.js)이 이 연출을 계속 새로고침해서 강제 중복 가동하는 것을 방지하기 위해 
            // "한 번 터진 키워드"라는 플래그(window.__GLITCH_EXPIRED__)를 심어 제어합니다.
            window.__GLITCH_EXPIRED__ = window.__GLITCH_EXPIRED__ || new Set();

            if (!window.__GLITCH_EXPIRED__.has(keyword)) {
                setTimeout(() => {
                    // 0.05초 난수 루프 파괴
                    if (window.__CCFOLIA_GLITCH_TIMER__) {
                        clearInterval(window.__CCFOLIA_GLITCH_TIMER__);
                        window.__CCFOLIA_GLITCH_TIMER__ = null;
                    }
                    
                    // #root 필터 복구 및 부드러운 화면 전환 복원 효과
                    const root = document.getElementById('root');
                    if (root) {
                        root.style.transition = "filter 0.5s ease-out"; // 0.5초 동안 사르르 부드럽게 원래대로 복구
                        root.style.filter = "none";
                    }

                    // SVG 도면 삭제
                    const filterEl = document.getElementById('ccfolia-svg-distortion-filter');
                    if (filterEl) filterEl.remove();

                    // 만료 목록에 등록하여 패널이 완전히 닫힐 때까지 재실행 차단
                    window.__GLITCH_EXPIRED__.add(keyword);
                    console.log("공간 왜곡 연출이 안전하게 자동 종료되었습니다.");
                }, 2000); // ⏱️ 정확히 2초(2000ms) 지속
            }

            // 엔진 구조 유지를 위한 더미 레이어 반환
            const dummyLayer = document.createElement('div');
            dummyLayer.className = 'ccfolia-ghost-layer';
            dummyLayer.style.display = 'none';
            return dummyLayer;
        },

        update: function(layer, rect) {
            // 이미 2초가 지나 만료되었다면 엔진이 #root에 다시 필터를 씌우지 못하게 차단
            const rootContainer = document.getElementById('root');
            if (rootContainer && window.__CCFOLIA_GLITCH_TIMER__) {
                if (!rootContainer.style.filter.includes('ccfolia-glitch-filter')) {
                    rootContainer.style.filter = "url(#ccfolia-glitch-filter)";
                }
            }
        }
    };

    // 💡 마스터가 코코폴리아 패널을 [비공개/숨김/삭제]하여 키워드 자체가 완전히 사라졌을 때
    // 만료 플래그 목록에서도 청소해 주어야, 다음번에 마스터가 다시 [공간왜곡] 패널을 켰을 때 새롭게 2초 동안 또 터집니다.
    const originalRemove = HTMLElement.prototype.remove;
    HTMLElement.prototype.remove = function() {
        if (this.className === 'ccfolia-ghost-layer') {
            // 타이머 긴급 누출 방지
            if (window.__CCFOLIA_GLITCH_TIMER__) {
                clearInterval(window.__CCFOLIA_GLITCH_TIMER__);
                window.__CCFOLIA_GLITCH_TIMER__ = null;
            }
            const root = document.getElementById('root');
            if (root) root.style.filter = "none";
            
            // 모든 글리치 만료 플래그 초기화
            if (window.__GLITCH_EXPIRED__) {
                window.__GLITCH_EXPIRED__.clear();
            }
        }
        return originalRemove.apply(this, arguments);
    };
})();
