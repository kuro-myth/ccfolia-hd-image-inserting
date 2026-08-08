// [5배 확장 기믹 + 중심축 기준 단방향 시계바늘 최종 결합 버전]
(function() {
    // 1. 애니메이션 도면 주입 (중심축 회전)
    if (!document.getElementById('ccfolia-style-ho1-awakening')) {
        const style = document.createElement('style');
        style.id = 'ccfolia-style-ho1-awakening';
        style.textContent = `
            /* 4개의 바늘이 제각각 다른 가속도와 방향으로 무한 회전 */
            @keyframes ccfolia-rotate-needle1 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes ccfolia-rotate-needle2 { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } } /* 역방향 */
            @keyframes ccfolia-rotate-needle3 { from { transform: rotate(30deg); } to { transform: rotate(390deg); } }  /* 1시 시작 */
            @keyframes ccfolia-rotate-needle4 { from { transform: rotate(60deg); } to { transform: rotate(420deg); } }  /* 2시 시작 */
            
            /* 신성하게 깜빡이는 빛의 파동 효과 */
            @keyframes ccfolia-light-pulse {
                0%, 100% { opacity: 0.85; filter: blur(1px); }
                50% { opacity: 1; filter: blur(2px); }
            }
        `;
        document.head.appendChild(style);
    }

    window.__CCFOLIA_EFFECTS__ = window.__CCFOLIA_EFFECTS__ || {};
    window.__CCFOLIA_EFFECTS__["effects/ho1-awakening.js"] = {
        
        create: function(keyword, obj, rect) {
            const layer = document.createElement('div');
            layer.className = 'ccfolia-ghost-layer';
            layer.style.position = 'fixed';
            layer.style.zIndex = '99999'; 
            layer.style.pointerEvents = 'none'; 
            layer.style.overflow = 'visible'; 
            
            // 💡 핵심 기믹: 
            // 1. 바늘 역할을 할 div의 크기를 딱 전체 상자의 절반(height: 50%)으로 자릅니다.
            // 2. transform-origin을 'center bottom'(아래쪽 중앙)으로 설정하면, 정확히 상자 중심이 시작점이 됩니다.
            // 3. 그라데이션을 아래(중심)에서 위(바깥쪽)로 쏘아 올려 반대편 빛을 완벽히 제거합니다.
            layer.innerHTML = `
                <!-- 1번 바늘: 가장 길고 제일 빠르게 회전 (20초 주행) -->
                <div style="position:absolute; bottom:50%; left:50%; width:8px; height:180%; transform:translateX(-50%); transform-origin: center bottom; animation: ccfolia-rotate-needle1 20s linear infinite, ccfolia-light-pulse 2s ease-in-out infinite; background:linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0.8) 40%, transparent); box-shadow:0 -10px 25px #ffffff, 0 -15px 45px #3498db;"></div>
                
                <!-- 2번 바늘: 중간 길이, 역방향으로 묵직하게 회전 (32초 주행) -->
                <div style="position:absolute; bottom:50%; left:50%; width:6px; height:140%; transform:translateX(-50%); transform-origin: center bottom; animation: ccfolia-rotate-needle2 32s linear infinite, ccfolia-light-pulse 3s ease-in-out infinite; background:linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0.7) 40%, transparent); box-shadow:0 -10px 20px #ffffff, 0 -15px 35px #2ecc71;"></div>
                
                <!-- 3번 바늘: 조금 짧은 길이, 1시 방향에서 시작 (45초 주행) -->
                <div style="position:absolute; bottom:50%; left:50%; width:5px; height:110%; transform:translateX(-50%); transform-origin: center bottom; animation: ccfolia-rotate-needle3 45s linear infinite, ccfolia-light-pulse 2.5s ease-in-out infinite; background:linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0.6) 40%, transparent); box-shadow:0 -10px 15px #ffffff, 0 -15px 30px #3498db;"></div>
                
                <!-- 4번 바늘: 가장 짧고 강력한 코어 바늘, 2시 방향에서 시작 (60초 주행) -->
                <div style="position:absolute; bottom:50%; left:50%; width:10px; height:80%; transform:translateX(-50%); transform-origin: center bottom; animation: ccfolia-rotate-needle4 60s linear infinite, ccfolia-light-pulse 1.5s ease-in-out infinite; background:linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0.9) 40%, transparent); box-shadow:0 -10px 30px #ffffff, 0 -15px 50px #e74c3c;"></div>
                
                <!-- 캐릭터 발밑 중심축을 단단히 고정해주는 광원 코어 서클 -->
                <div style="position:absolute; top:50%; left:50%; width:100%; height:100%; transform:translate(-50%, -50%); border-radius:50%; background:rgba(255,255,255,0.3); box-shadow:0 0 30px 10px #ffffff, 0 0 50px 20px rgba(52,152,219,0.6); filter:blur(1px);"></div>
            `;
            
            document.body.appendChild(layer);
            return layer;
        },

        update: function(layer, rect) {
            // 🎯 [5배 확장 기믹 정상 복구] 
            // 전체 연출을 감싸는 유령 프레임 자체를 토큰 크기의 5배로 넓혀, 사방으로 빛바늘이 뻗어 나갈 공간을 확보합니다.
            const scaleSize = 5;
            const w = rect.width * scaleSize;
            const h = rect.height * scaleSize;
            
            layer.style.width = `${w}px`;
            layer.style.height = `${h}px`;
            layer.style.left = `${rect.left - (w - rect.width) / 2}px`;
            layer.style.top = `${rect.top - (h - rect.height) / 2}px`;
        }
    };
})();
