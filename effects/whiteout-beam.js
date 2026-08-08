// [3단계 필살기: 화면 중앙에서 폭발하여 전역을 가리는 창백한 플라즈마 화이트아웃]
(function() {
    const EFFECT_ID = "effects/whiteout-beam.js";

    if (!document.getElementById('ccfolia-style-whiteout')) {
        const style = document.createElement('style');
        style.id = 'ccfolia-style-whiteout';
        style.textContent = `
            /* 0.3초 만에 중앙에서 사방으로 빛이 초고속 폭발하는 애니메이션 */
            @keyframes ccfolia-beam-expand {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; filter: blur(5px); }
                30% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; filter: blur(2px); }
                100% { transform: translate(-50%, -50%) scale(5); opacity: 1; filter: blur(0px); }
            }
            
            /* 전체 화면을 꽉 채운 흰색 섬광이 3초간 서서히 걷히는 페이드아웃 효과 */
            @keyframes ccfolia-fade-clean {
                0%, 35% { opacity: 1; } /* 초반 1초 정도는 완벽한 화이트아웃 유지 */
                100% { opacity: 0; }     /* 이후 사르르 투명하게 증발 */
            }
        `;
        document.head.appendChild(style);
    }

    window.__CCFOLIA_EFFECTS__ = window.__CCFOLIA_EFFECTS__ || {};
    window.__CCFOLIA_EFFECTS__[EFFECT_ID] = {
        
        create: function(keyword, obj, rect) {
            // 💡 화면 전체 브라우저 뷰포트(100vw, 100vh)를 강제 점령하는 마스터 캔버스
            const layer = document.createElement('div');
            layer.className = 'ccfolia-ghost-layer';
            layer.style.position = 'fixed';
            layer.style.top = '0';
            layer.style.left = '0';
            layer.style.width = '100vw';
            layer.style.height = '100vh';
            layer.style.zIndex = '9999999'; // 공간왜곡보다도 높은 최상단 배치
            layer.style.pointerEvents = 'none';
            layer.style.overflow = 'hidden';
            
            // 1. 브라우저 정중앙(50%, 50%)에서 시작되는 창백한 플라즈마 광원 구체
            // 2. 전체를 순백으로 덮어버릴 전역 플래시 오버레이 매핑
            layer.innerHTML = `
                <!-- 중앙 폭발 코어 (창백한 푸른빛 네온 섀도우) -->
                <div style="position:absolute; top:50%; left:50%; width:40vw; height:40vw; border-radius:50%; background:#ffffff; box-shadow:0 0 50px 30px #ffffff, 0 0 100px 60px #00f0ff, 0 0 200px 100px #3498db; animation: ccfolia-beam-expand 0.3s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;"></div>
                
                <!-- 전역 화이트아웃 플래시 레이어 -->
                <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:#ffffff; animation: ccfolia-fade-clean 3s ease-out forwards;"></div>
            `;
            
            document.body.appendChild(layer);
            return layer;
        },

        update: function(layer, rect) {
            // 전역 화이트아웃이므로 토큰 위치를 무시하고 브라우저 화면 전체에 고정 박제합니다.
            layer.style.top = '0';
            layer.style.left = '0';
            layer.style.width = '100vw';
            layer.style.height = '100vh';
        }
    };
})();
