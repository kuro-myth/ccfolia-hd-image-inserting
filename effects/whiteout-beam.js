// [3단계 필살기: 속도 묵직하게 다운 + 코어 구체까지 완전히 증발하는 화이트아웃 최종본]
(function() {
    const EFFECT_ID = "effects/whiteout-beam.js";

    if (!document.getElementById('ccfolia-style-whiteout')) {
        const style = document.createElement('style');
        style.id = 'ccfolia-style-whiteout';
        style.textContent = `
            /* 💡 보정: 0.3초에서 0.7초로 폭발 팽창 속도를 늦춰 묵직한 중압감을 줍니다 */
            @keyframes ccfolia-beam-expand {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; filter: blur(8px); }
                40% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; filter: blur(4px); }
                100% { transform: translate(-50%, -50%) scale(6); opacity: 1; filter: blur(0px); }
            }
            
            /* 💡 핵심 보정: 전체 화면뿐만 아니라 중앙 코어 구체도 같은 타이밍에 사르르 증발하도록 통합 애니메이션 정의 */
            @keyframes ccfolia-fade-clean {
                0% { opacity: 1; }
                40% { opacity: 1; }  /* 약 1.5초 동안은 완전 순백색 화이트아웃 유지 */
                100% { opacity: 0; } /* 이후 3.5초에 도달할 때까지 부드럽게 완전 증발 */
            }
        `;
        document.head.appendChild(style);
    }

    window.__CCFOLIA_EFFECTS__ = window.__CCFOLIA_EFFECTS__ || {};
    window.__CCFOLIA_EFFECTS__[EFFECT_ID] = {
        
        create: function(keyword, obj, rect) {
            const layer = document.createElement('div');
            layer.className = 'ccfolia-ghost-layer';
            layer.style.position = 'fixed';
            layer.style.top = '0';
            layer.style.left = '0';
            layer.style.width = '100vw';
            layer.style.height = '100vh';
            layer.style.zIndex = '9999999'; 
            layer.style.pointerEvents = 'none';
            layer.style.overflow = 'hidden';
            
            // 💡 해결책: 
            // 1. 전체 지속 시간을 3.5초(3.5s)로 늘려 연출의 깊이를 더했습니다.
            // 2. 중앙 폭발 코어 박스에도 'ccfolia-fade-clean 3.5s' 페이드아웃 애니메이션을 동일하게 부여했습니다.
            //    이제 흰색 화면이 걷힐 때 푸른 광원 코어 구체도 잔상 하나 없이 완벽하게 투명해져 사라집니다.
            layer.innerHTML = `
                <!-- 중앙 폭발 코어 (전체 화면과 싱크를 맞춰 3.5초 뒤 자동 완전 증발) -->
                <div style="position:absolute; top:50%; left:50%; width:40vw; height:40vw; border-radius:50%; background:#ffffff; box-shadow:0 0 50px 30px #ffffff, 0 0 100px 60px #00f0ff, 0 0 200px 100px #3498db; animation: ccfolia-beam-expand 0.7s cubic-bezier(0.1, 0.8, 0.2, 1) forwards, ccfolia-fade-clean 3.5s ease-out forwards;"></div>
                
                <!-- 전역 화이트아웃 플래시 레이어 -->
                <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:#ffffff; animation: ccfolia-fade-clean 3.5s ease-out forwards;"></div>
            `;
            
            // ⏱️ 3.5초 뒤에 엔진 찌꺼기 레이어를 브라우저에서 깔끔하게 청소하는 자동 자폭 타이머
            setTimeout(() => {
                layer.remove();
            }, 3500);
            
            document.body.appendChild(layer);
            return layer;
        },

        update: function(layer, rect) {
            layer.style.top = '0';
            layer.style.left = '0';
            layer.style.width = '100vw';
            layer.style.height = '100vh';
        }
    };
})();
