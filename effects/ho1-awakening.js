// [제안해주신 5배 크기 박스 자체 회전 아키텍처 버전]
(function() {
    if (!document.getElementById('ccfolia-style-ho1-awakening')) {
        const style = document.createElement('style');
        style.id = 'ccfolia-style-ho1-awakening';
        style.textContent = `
            /* 5배 거대 박스들 자체를 제자리에서 돌려버리는 단순하고 명확한 애니메이션 */
            @keyframes ccfolia-giant-spin1 { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
            @keyframes ccfolia-giant-spin2 { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(-360deg); } }
            @keyframes ccfolia-giant-spin3 { from { transform: translate(-50%, -50%) rotate(30deg); } to { transform: translate(-50%, -50%) rotate(390deg); } }
            @keyframes ccfolia-giant-spin4 { from { transform: translate(-50%, -50%) rotate(60deg); } to { transform: translate(-50%, -50%) rotate(420deg); } }
            
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
            
            // 💡 제안해주신 구조의 핵심 시각화:
            // 1. 큰 박스의 크기는 100% 이며, 이 상자 자체가 top:50%, left:50%, transform: translate(-50%, -50%)로 정중앙 회전합니다.
            // 2. 내부의 빛기둥 막대는 [정중앙(top:50%) ➡ 상단(top:0%)]까지 뻗어 나갑니다 (height: 50%).
            // 3. 바깥쪽으로 얼마나 더 멀리 뿜어낼지는 top 값을 마이너스(-) 영역으로 올려서 자유롭게 조절합니다.
            layer.innerHTML = `
                <!-- 1번 거대 회전 박스 (20초 주행) -->
<div style="position:absolute; top:50%; left:50%; width:100%; height:100%; animation: ccfolia-giant-spin1 20s linear infinite; overflow:visible;">
    <!-- 💡 보정: 투명도를 100% 꽉 채우고, 하얀색 박스 섀도우를 다중 레이어로 겹쳐 레이저처럼 쨍한 광량을 확보 -->
    <div style="position:absolute; bottom:50%; left:50%; width:8px; height:250%; transform:translateX(-50%); animation: ccfolia-light-pulse 2s ease-in-out infinite; background: linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0.9) 30%, transparent 100%); box-shadow: 0 0 10px #ffffff, 0 0 20px #ffffff, 0 0 40px #3498db, 0 0 70px #3498db; backdrop-filter: brightness(1.5);"></div>
</div>

<!-- 2번 거대 회전 박스 (32초 역방향 주행) -->
<div style="position:absolute; top:50%; left:50%; width:100%; height:100%; animation: ccfolia-giant-spin2 32s linear infinite; overflow:visible;">
    <div style="position:absolute; bottom:50%; left:50%; width:6px; height:200%; transform:translateX(-50%); animation: ccfolia-light-pulse 3s ease-in-out infinite; background: linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0.9) 30%, transparent 100%); box-shadow: 0 0 10px #ffffff, 0 0 20px #ffffff, 0 0 40px #2ecc71, 0 0 70px #2ecc71; backdrop-filter: brightness(1.5);"></div>
</div>

<!-- 3번 거대 회전 박스 (45초 주행) -->
<div style="position:absolute; top:50%; left:50%; width:100%; height:100%; animation: ccfolia-giant-spin3 45s linear infinite; overflow:visible;">
    <div style="position:absolute; bottom:50%; left:50%; width:5px; height:150%; transform:translateX(-50%); animation: ccfolia-light-pulse 2.5s ease-in-out infinite; background: linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0.9) 30%, transparent 100%); box-shadow: 0 0 8px #ffffff, 0 0 15px #ffffff, 0 0 35px #3498db, 0 0 60px #3498db; backdrop-filter: brightness(1.5);"></div>
</div>

<!-- 4번 거대 회전 박스 (60초 주행) -->
<div style="position:absolute; top:50%; left:50%; width:100%; height:100%; animation: ccfolia-giant-spin4 60s linear infinite; overflow:visible;">
    <div style="position:absolute; bottom:50%; left:50%; width:10px; height:100%; transform:translateX(-50%); animation: ccfolia-light-pulse 1.5s ease-in-out infinite; background: linear-gradient(to top, #ffffff 0%, rgba(255,255,255,1) 40%, transparent 100%); box-shadow: 0 0 12px #ffffff, 0 0 25px #ffffff, 0 0 50px #e74c3c, 0 0 80px #e74c3c; backdrop-filter: brightness(1.5);"></div>
</div>

                
                <!-- 캐릭터 발밑 중심축 보조 광원 코어 (토큰 크기 100% 밀착형) -->
                <div style="position:absolute; top:50%; left:50%; width:100%; height:100%; transform:translate(-50%, -50%); border-radius:50%; background:rgba(255,255,255,0.25); box-shadow:0 0 25px 5px #ffffff, inset 0 0 15px rgba(52,152,219,0.5); filter:blur(1px);"></div>
            `;
            
            document.body.appendChild(layer);
            return layer;
        },

        update: function(layer, rect) {
            // 외부 유령 베이스 레이어는 토큰의 겉 테두리와 정확히 1:1 결합해 흔들림 없는 완벽한 중심 원점을 유지합니다.
            layer.style.top = `${rect.top}px`;
            layer.style.left = `${rect.left}px`;
            layer.style.width = `${rect.width}px`;
            layer.style.height = `${rect.height}px`;
        }
    };
})();
