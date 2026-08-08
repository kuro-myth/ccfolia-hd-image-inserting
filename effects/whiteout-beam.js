// [3단계 필살기: 중앙 코어 폭발 선행 ➡ 전체 화이트아웃 후속 발동 완벽 타이밍 교정본]
(function() {
    const EFFECT_ID = "effects/whiteout-beam.js";

    if (!document.getElementById('ccfolia-style-whiteout')) {
        const style = document.createElement('style');
        style.id = 'ccfolia-style-whiteout';
        style.textContent = `
            /* 0.5초 동안 중앙에서 사방으로 콰아아앙 터져나가는 선행 폭발 모션 */
            @keyframes ccfolia-beam-expand {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; filter: blur(5px); }
                30% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; filter: blur(2px); }
                100% { transform: translate(-50%, -50%) scale(5); opacity: 1; filter: blur(0px); }
            }
            
            /* 코어 구체 전용 페이드아웃 (화이트아웃 장막이 완전히 걷히기 전까지 자연스럽게 뒤에서 소멸) */
            @keyframes ccfolia-core-fade {
                0%, 60% { opacity: 1; }
                100% { opacity: 0; }
            }
            
            /* 💡 핵심 보정: 전체 화면 화이트아웃 장막은 0.4초 딜레이(대기) 후 순식간에 암전 기습 발동 */
            @keyframes ccfolia-screen-whiteout {
                0% { opacity: 0; }
                5% { opacity: 1; }   /* 0.4초 대기 후 0.05초만에 쾅! 하고 백색 화면 점령 */
                50% { opacity: 1; }  /* 이후 1.5초간 완벽한 화이트아웃 유지 */
                100% { opacity: 0; } /* 남은 시간 동안 사르르 원래대로 복구 */
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
            
            // 💡 바뀐 하이어라키와 타이밍 규칙:
            // 1. 코어 구체가 0.5초 동안 초고속으로 퍼져나가는 레이저 선포를 때립니다.
            // 2. 전체 화이트아웃 장막은 'animation-delay: 0.4s'를 주어, 코어가 화면을 거의 다 채울 때쯤 뒤늦게 쾅 덮쳐 가립니다.
            layer.innerHTML = `
                <!-- 1. 중앙 폭발 코어 (선행 발동) -->
                <div style="position:absolute; top:50%; left:50%; width:40vw; height:40vw; border-radius:50%; background:#ffffff; box-shadow:0 0 50px 30px #ffffff, 0 0 100px 60px #00f0ff, 0 0 200px 100px #3498db; animation: ccfolia-beam-expand 0.5s cubic-bezier(0.1, 0.8, 0.2, 1) forwards, ccfolia-core-fade 3.5s ease-out forwards;"></div>
                
                <!-- 2. 전역 화이트아웃 플래시 레이어 (0.4초 뒤늦게 튀어나와 덮치기) -->
                <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:#ffffff; animation: ccfolia-screen-whiteout 3.5s ease-out forwards; animation-delay: 0.4s; opacity: 0;"></div>
            `;
            
            // ⏱️ 전체 타임슬롯 청소 (애니메이션 딜레이 0.4초 + 지속 3.5초 = 총 3.9초 뒤 완전 자폭)
            setTimeout(() => {
                layer.remove();
            }, 3900);
            
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
