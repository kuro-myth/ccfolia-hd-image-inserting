// [방안 C: 코코폴리아 전체 픽셀을 찢어발기는 강렬한 공간 왜곡 필터]
(function() {
    const EFFECT_ID = "effects/space-distortion.js";

    window.__CCFOLIA_EFFECTS__ = window.__CCFOLIA_EFFECTS__ || {};
    window.__CCFOLIA_EFFECTS__[EFFECT_ID] = {
        
        // [생성 함수]: 키워드가 감지되면 브라우저 연산 장치에 SVG 노이즈 도면을 이식합니다.
        create: function(keyword, obj, rect) {
            // 1. 이미 심어진 SVG 필터가 없다면 body에 주입
            if (!document.getElementById('ccfolia-svg-distortion-filter')) {
                const svgContainer = document.createElement('div');
                svgContainer.id = 'ccfolia-svg-distortion-filter';
                svgContainer.style.position = 'absolute';
                svgContainer.style.width = '0';
                svgContainer.style.height = '0';
                svgContainer.style.overflow = 'hidden';
                
                // 수학적 프랙탈 노이즈로 픽셀 좌표를 무작위로 털어버리는 필터 도면
                svgContainer.innerHTML = `
                    <svg xmlns="http://w3.org">
                        <filter id="ccfolia-glitch-filter">
                            <!-- baseFrequency로 자글거림 밀도 조절, seed를 바꾸면 모양이 요동칩니다 -->
                            <feTurbulence id="ccfolia-noise-prop" type="fractalNoise" baseFrequency="0.05 0.95" numOctaves="1" result="noise" seed="0" />
                            <!-- scale="70": 화면을 양옆으로 찢어발기는 왜곡의 한계 강도 (숫자가 클수록 대폭 파괴됨) -->
                            <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" xChannelSelector="R" yChannelSelector="G" />
                        </filter>
                    </svg>
                `;
                document.body.appendChild(svgContainer);
            }

            // 2. 코코폴리아 전체 화면인 #root 상자를 통째로 저격해서 필터 적용
            const rootContainer = document.getElementById('root');
            if (rootContainer) {
                rootContainer.style.filter = "url(#ccfolia-glitch-filter)";
                rootContainer.style.transition = "none"; // 왜곡 중에는 부드러운 애니메이션 제거로 지연 최소화
            }

            // 3. 지익지익 실시간으로 화면이 미쳐 날뛰도록 0.05초(50ms) 초고속 난수 루프 가동
            if (!window.__CCFOLIA_GLITCH_TIMER__) {
                const noiseElement = document.getElementById('ccfolia-noise-prop');
                window.__CCFOLIA_GLITCH_TIMER__ = setInterval(() => {
                    if (noiseElement) {
                        // 0부터 100 사이의 무작위 시드값을 던져 노이즈 패턴을 실시간 파괴
                        noiseElement.setAttribute('seed', Math.floor(Math.random() * 100));
                        
                        // 간헐적으로 왜곡 각도(주파수)를 뒤틀어 "지직, 지지직" 하는 정전기 느낌 추가
                        if (Math.random() > 0.7) {
                            noiseElement.setAttribute('baseFrequency', `0.02 ${0.5 + Math.random() * 0.5}`);
                        } else {
                            noiseElement.setAttribute('baseFrequency', "0.05 0.95");
                        }
                    }
                }, 50);
            }

            // 엔진 규칙상 리턴할 가상의 더미 레이어 빈 div 하나 반환
            const dummyLayer = document.createElement('div');
            dummyLayer.className = 'ccfolia-ghost-layer';
            dummyLayer.style.display = 'none';
            return dummyLayer;
        },

        // [동기화 함수]: 화면이 왜곡되는 중에도 엔진이 멈추지 않게 방어 코드 가동
        update: function(layer, rect) {
            // #root 자체를 필터링 중이므로 별도 좌표 계산은 불필요합니다.
            // 만약 연출 도중 강제로 필터가 풀리는 리액트 렌더링 폭풍이 불면 여기서 재차 묶어줍니다.
            const rootContainer = document.getElementById('root');
            if (rootContainer && !rootContainer.style.filter.includes('ccfolia-glitch-filter')) {
                rootContainer.style.filter = "url(#ccfolia-glitch-filter)";
            }
        }
    };

    // 💡 청소 기믹 (엔진이 이 연출을 비공개/삭제 처리하여 끌 때 원상복구 시키는 인터셉터 루틴)
    // 원래 ccfolia-effect.js 엔진이 레이어를 .remove()할 때 #root의 필터도 완전히 지워주도록 유턴 장치를 마련합니다.
    const originalRemove = HTMLElement.prototype.remove;
    HTMLElement.prototype.remove = function() {
        if (this.className === 'ccfolia-ghost-layer' && window.__CCFOLIA_GLITCH_TIMER__) {
            // 타이머 해제 및 원상 복구
            clearInterval(window.__CCFOLIA_GLITCH_TIMER__);
            window.__CCFOLIA_GLITCH_TIMER__ = null;
            
            const rootContainer = document.getElementById('root');
            if (rootContainer) rootContainer.style.filter = "none";
            
            const filterEl = document.getElementById('ccfolia-svg-distortion-filter');
            if (filterEl) filterEl.remove();
        }
        return originalRemove.apply(this, arguments);
    };
})();
