// 독립 연출 모듈은 엔진으로부터 (키워드, 대상 토큰 엘리먼트, 현재 화면 좌표)를 주입받아 구동됩니다.
(function() {
    const REPO_BASE = "https://raw.githubusercontent.com/kuro-myth/ccfolia-hd-image-inserting/main/";

    // 1. 이 연출 고유의 CSS 스타일(회전 애니메이션 도면) 최초 1회만 주입
    if (!document.getElementById('ccfolia-style-ho1-awakening')) {
        const style = document.createElement('style');
        style.id = 'ccfolia-style-ho1-awakening';
        style.textContent = `
            @keyframes ccfolia-rotate-speed1 { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
            @keyframes ccfolia-rotate-speed2 { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(-360deg); } }
            @keyframes ccfolia-rotate-speed3 { from { transform: translate(-50%, -50%) rotate(30deg); } to { transform: translate(-50%, -50%) rotate(390deg); } }
            @keyframes ccfolia-rotate-speed4 { from { transform: translate(-50%, -50%) rotate(60deg); } to { transform: translate(-50%, -50%) rotate(420deg); } }
            @keyframes ccfolia-light-pulse { 0%, 100% { opacity: 0.85; filter: blur(1px); } 50% { opacity: 1; filter: blur(2px); } }
        `;
        document.head.appendChild(style);
    }

    // 2. 엔진이 외부에서 호출할 수 있도록 글로벌 네임스페이스에 연출 함수 등록
    window.__CCFOLIA_EFFECTS__ = window.__CCFOLIA_EFFECTS__ || {};
    window.__CCFOLIA_EFFECTS__["effects/ho1-awakening.js"] = {
        
        // [생성 함수]: 최초 감시 루프에 걸렸을 때 HTML 유령 레이어 조립
        create: function(keyword, obj, rect) {
            const layer = document.createElement('div');
            layer.className = 'ccfolia-ghost-layer';
            layer.style.position = 'fixed';
            layer.style.zIndex = '99999'; 
            layer.style.pointerEvents = 'none'; 
            layer.style.overflow = 'visible'; 
            
            // 12방향 독립 시계바늘 기둥 구조 주입
            layer.innerHTML = `
                <div style="position:absolute; top:50%; left:50%; width:8px; height:180%; transform-origin:center; animation: ccfolia-rotate-speed1 20s linear infinite, ccfolia-light-pulse 2s ease-in-out infinite; background:linear-gradient(to top, transparent, rgba(255,255,255,0.95) 50%, transparent); box-shadow:0 0 25px #ffffff, 0 0 50px #3498db;"></div>
                <div style="position:absolute; top:50%; left:50%; width:6px; height:140%; transform-origin:center; animation: ccfolia-rotate-speed2 32s linear infinite, ccfolia-light-pulse 3s ease-in-out infinite; background:linear-gradient(to top, transparent, rgba(255,255,255,0.9) 50%, transparent); box-shadow:0 0 20px #ffffff, 0 0 40px #2ecc71;"></div>
                <div style="position:absolute; top:50%; left:50%; width:5px; height:110%; transform-origin:center; animation: ccfolia-rotate-speed3 45s linear infinite, ccfolia-light-pulse 2.5s ease-in-out infinite; background:linear-gradient(to top, transparent, rgba(255,255,255,0.85) 50%, transparent); box-shadow:0 0 15px #ffffff, 0 0 35px #3498db;"></div>
                <div style="position:absolute; top:50%; left:50%; width:10px; height:80%; transform-origin:center; animation: ccfolia-rotate-speed4 60s linear infinite, ccfolia-light-pulse 1.5s ease-in-out infinite; background:linear-gradient(to top, transparent, rgba(255,255,255,1) 50%, transparent); box-shadow:0 0 30px #ffffff, 0 0 60px #e74c3c;"></div>
                <div style="position:absolute; top:50%; left:50%; width:100%; height:100%; transform:translate(-50%, -50%); border-radius:50%; background:rgba(255,255,255,0.15); box-shadow:0 0 35px 10px rgba(255,255,255,0.8), inset 0 0 20px rgba(52,152,219,0.5); filter:blur(1px);"></div>
            `;
            
            document.body.appendChild(layer);
            return layer;
        },

        // [동기화 함수]: 코코폴리아 카메라 내비게이션(이동/확대축소) 시 좌표 자석 대응
        update: function(layer, rect) {
            // 토큰보다 더 넓게 연출이 뿜어지도록 자체 5배 확장 기믹 내장
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
