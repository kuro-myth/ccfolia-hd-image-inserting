// [부모 프레임 고정 + 내부 회전축 실제 크기 부여 5배 확장 버전]
(function() {
    if (!document.getElementById('ccfolia-style-ho1-awakening')) {
        const style = document.createElement('style');
        style.id = 'ccfolia-style-ho1-awakening';
        style.textContent = `
            /* 중심점을 유지한 채 박스 자체가 회전하도록 translate와 rotate 분리 고정 */
            @keyframes ccfolia-pivot-speed1 { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
            @keyframes ccfolia-pivot-speed2 { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(-360deg); } }
            @keyframes ccfolia-pivot-speed3 { from { transform: translate(-50%, -50%) rotate(30deg); } to { transform: translate(-50%, -50%) rotate(390deg); } }
            @keyframes ccfolia-pivot-speed4 { from { transform: translate(-50%, -50%) rotate(60deg); } to { transform: translate(-50%, -50%) rotate(420deg); } }
            
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
            
            // 💡 핵심 해결 기믹:
            // 1. 회전축 역할을 하는 상자의 크기를 토큰과 똑같은 100%로 지정합니다.
            // 2. 이 상자들을 top:50%, left:50% 중앙에 정확히 포개고 회전을 시킵니다.
            // 3. 자식 빛기둥들은 부모 크기(토큰 크기)를 온전히 상속받으므로, height: 500%를 주면 '진짜 토큰 크기의 5배'로 사방으로 길게 뻗어나갑니다.
            layer.innerHTML = `
                <!-- 1번 시계바늘 (토큰 크기 5배 / 20초 주행) -->
                <div style="position:absolute; top:50%; left:50%; width:100%; height:100%; animation: ccfolia-pivot-speed1 20s linear infinite;">
                    <div style="position:absolute; bottom:50%; left:50%; width:8px; height:500%; transform:translateX(-50%); animation: ccfolia-light-pulse 2s ease-in-out infinite; background:linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0.7) 40%, transparent); box-shadow:0 -10px 25px #ffffff, 0 -15px 45px #3498db; transform-origin: center bottom;"></div>
                </div>
                
                <!-- 2번 시계바늘 (토큰 크기 4배 / 32초 역방향 주행) -->
                <div style="position:absolute; top:50%; left:50%; width:100%; height:100%; animation: ccfolia-pivot-speed2 32s linear infinite;">
                    <div style="position:absolute; bottom:50%; left:50%; width:6px; height:400%; transform:translateX(-50%); animation: ccfolia-light-pulse 3s ease-in-out infinite; background:linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0.6) 40%, transparent); box-shadow:0 -10px 20px #ffffff, 0 -15px 35px #2ecc71; transform-origin: center bottom;"></div>
                </div>
                
                <!-- 3번 시계바늘 (토큰 크기 3배 / 45초 주행 / 1시 시작) -->
                <div style="position:absolute; top:50%; left:50%; width:100%; height:100%; animation: ccfolia-pivot-speed3 45s linear infinite;">
                    <div style="position:absolute; bottom:50%; left:50%; width:5px; height:300%; transform:translateX(-50%); animation: ccfolia-light-pulse 2.5s ease-in-out infinite; background:linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0.5) 40%, transparent); box-shadow:0 -10px 15px #ffffff, 0 -15px 30px #3498db; transform-origin: center bottom;"></div>
                </div>
                
                <!-- 4번 시계바늘 (토큰 크기 2배 / 60초 주행 / 2시 시작) -->
                <div style="position:absolute; top:50%; left:50%; width:100%; height:100%; animation: ccfolia-pivot-speed4 60s linear infinite;">
                    <div style="position:absolute; bottom:50%; left:50%; width:10px; height:200%; transform:translateX(-50%); animation: ccfolia-light-pulse 1.5s ease-in-out infinite; background:linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0.8) 40%, transparent); box-shadow:0 -10px 30px #ffffff, 0 -15px 50px #e74c3c; transform-origin: center bottom;"></div>
                </div>
                
                <!-- 캐릭터 발밑 중심축 보조 광원 코어 (토큰 크기 100% 밀착형) -->
                <div style="position:absolute; top:50%; left:50%; width:100%; height:100%; transform:translate(-50%, -50%); border-radius:50%; background:rgba(255,255,255,0.25); box-shadow:0 0 25px 5px #ffffff, inset 0 0 15px rgba(52,152,219,0.5); filter:blur(1px);"></div>
            `;
            
            document.body.appendChild(layer);
            return layer;
        },

        update: function(layer, rect) {
            // 외부 유령 프레임은 오차가 생기지 않도록 토큰 실제 사각형과 1:1로 완벽 밀착시킵니다.
            layer.style.top = `${rect.top}px`;
            layer.style.left = `${rect.left}px`;
            layer.style.width = `${rect.width}px`;
            layer.style.height = `${rect.height}px`;
        }
    };
})();
