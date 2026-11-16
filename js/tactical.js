/* CORDON — tactical mode (js/tactical.js)
   GIVE ORDERS = game paused, orders can be set freely. EXECUTE = game runs. STEP = run 8 seconds, then back to giving orders. */
(function () {
    'use strict';
    let on = localStorage.getItem('cordonTactical') === '1', running = false, stepT = 0;
    const st = document.createElement('style');
    st.textContent = '#tac-pill{position:fixed;top:calc(env(safe-area-inset-top,0px) + ' + (window.TACTICAL_TOP || 52) + 'px);left:50%;transform:translateX(-50%);z-index:70;display:none;border-radius:18px;overflow:hidden;box-shadow:0 2px 8px #000a;font:700 12px sans-serif}#tac-pill button{border:0;padding:9px 13px;background:#1b2a44;color:#9fb4d8}#tac-pill button.act{background:#2f7bff;color:#fff}#tac-pill #tac-run.act{background:#2e9e5b}#tac-tog{margin:8px auto;display:block}';
    document.head.appendChild(st);
    const pill = document.createElement('div'); pill.id = 'tac-pill';
    pill.innerHTML = '<button id="tac-plan">GIVE ORDERS</button><button id="tac-step">STEP 8s</button><button id="tac-run">EXECUTE</button>';
    document.body.appendChild(pill);
    const $ = id => document.getElementById(id);
    function mode(m) {                      // 'plan' | 'step' | 'run'
        running = m !== 'plan'; clearTimeout(stepT);
        if (m === 'step') stepT = setTimeout(() => mode('plan'), 8000);
        game.paused = !running || game.chapterCardOpen === true;
        $('tac-plan').classList.toggle('act', m === 'plan'); $('tac-step').classList.toggle('act', m === 'step'); $('tac-run').classList.toggle('act', m === 'run');
    }
    $('tac-plan').onclick = () => mode('plan'); $('tac-step').onclick = () => mode('step'); $('tac-run').onclick = () => mode('run');
    function setOn(v) {
        on = v; localStorage.setItem('cordonTactical', v ? '1' : '0');
        const t = $('tac-tog'); if (t) t.textContent = 'TACTICAL MODE: ' + (on ? 'ON' : 'OFF');
        if (on) mode('plan'); else { clearTimeout(stepT); running = true; }
    }
    const po = $('pause-overlay');
    if (po) { const b = document.createElement('button'); b.id = 'tac-tog'; b.className = po.querySelector('.xp-btn') ? 'xp-btn grey' : 'test-btn'; b.onclick = () => setOn(!on); po.appendChild(b); b.textContent = 'TACTICAL MODE: ' + (on ? 'ON' : 'OFF'); }
    setInterval(() => {                       // keep the pill in step with the game
        const menu = $('menu-root'), live = menu && menu.classList.contains('hidden') && !game.gameOver && !game.chapterCardOpen;
        pill.style.display = on && live ? 'flex' : 'none';
        const tb = $('top-bar'); if (tb) pill.style.top = Math.round(tb.getBoundingClientRect().bottom + 6) + 'px';   // sit just under the top bar when there is one
        if (on && live && !running && !game.paused) game.paused = true;
    }, 300);
})();
