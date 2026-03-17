/* ============================================================
   orbit.js — Animácia planét MZ ORBIT
   
   Čo robí tento súbor:
   - Vytvorí 6 planét a roztočí ich okolo stredu
   - Keď najedeš myšou na planétu → orbit sa ZASTAVÍ
   - Planéta sa zväčší a rozžiari farbou
   - Stred zobrazí popis danej zóny
   - Pri odchode myši → orbit sa znova roztočí
   - Funguje aj na dotyk (mobil)
   ============================================================ */


/* ── Dáta planét ──────────────────────────────────────────────
   Tu môžeš zmeniť: icon, label (text pod ikonou), desc (popis
   v strede), color (farba glowu pri hoveri).
   Pridaj alebo odober planétu podľa potreby.
   ──────────────────────────────────────────────────────────── */
const planets = [
  { icon: '⚡', label: 'EVENTY\nNA KĽÚČ',   desc: 'Kompletná produkcia podujatí od A po Z.',   color: '#7b2fff' },
  { icon: '🔥', label: 'KATALÓG\nENERGIE',  desc: 'Programy, atrakcie a modulárne riešenia.', color: '#00d4ff' },
  { icon: '🏒', label: 'MZ\nMOVE',          desc: 'Šport, florbal a aktívne eventy.',           color: '#9b4fff' },
  { icon: '💞', label: 'MZ\nLOVE',          desc: 'Speed dating a sociálne podujatia.',         color: '#ff2d8a' },
  { icon: '🎉', label: 'MZ\nAFTERPARTY',    desc: 'Záchranná brzda a afterparty produkcia.',    color: '#bf7fff' },
  { icon: '📅', label: 'ROK PLNÝ\nZÁBAVY',  desc: 'Plánovač eventov na celý rok.',              color: '#00d4ff' },
];


/* ── Pomocná funkcia: hex farbu prevedie na "r,g,b" ─────────── */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}


/* ── Referencie na HTML prvky ───────────────────────────────── */
const container  = document.getElementById('orbitContainer');
const coreDesc   = document.getElementById('coreDesc');
const coreCta    = document.getElementById('coreCta');
const coreLogo   = document.getElementById('coreLogo');
const isMobile   = () => window.innerWidth < 700;


/* ── Vytvorenie skupiny pre planéty ─────────────────────────── */
const orbitGroup = document.createElement('div');
orbitGroup.id = 'orbitGroup';
orbitGroup.style.cssText = 'position:absolute;top:50%;left:50%;transform-origin:0 0;width:0;height:0;';
document.getElementById('planetsWrapper').parentElement.insertBefore(
  orbitGroup,
  document.getElementById('planetsWrapper')
);


/* ── Hlavná funkcia: postaví orbit ──────────────────────────── */
function buildOrbit() {
  orbitGroup.innerHTML = '';

  // Veľkosti podľa zariadenia
  const r     = isMobile() ? 115 : 210;  // polomer dráhy
  const sz    = isMobile() ? 56  : 72;   // veľkosť planéty
  const iconSz = isMobile() ? '18px' : '22px';
  const lblSz  = isMobile() ? '6px'  : '7px';

  let kf = ''; // CSS keyframes (animácia otáčania)

  planets.forEach((p, i) => {
    const total        = planets.length;
    const startAngleDeg = (i / total) * 360;

    // Keyframe pre každú planétu — každá začína na inej pozícii
    kf += `@keyframes full-orbit-${i}{
      from { transform: rotate(${startAngleDeg}deg) translateX(${r}px) rotate(${-startAngleDeg}deg); }
      to   { transform: rotate(${startAngleDeg + 360}deg) translateX(${r}px) rotate(${-(startAngleDeg + 360)}deg); }
    }`;

    // Kontajner pre planétu (otáča sa)
    const orbitDiv = document.createElement('div');
    orbitDiv.className = 'orbit-planet-track';
    orbitDiv.style.cssText = `
      position: absolute; width: 0; height: 0; top: 0; left: 0;
      animation: full-orbit-${i} 18s linear infinite;
    `;

    // Samotná planéta (vizuál)
    const planetDiv = document.createElement('div');
    planetDiv.className = 'planet';
    planetDiv.style.cssText = `
      position: absolute;
      width: ${sz}px; height: ${sz}px;
      transform: translate(-50%, -50%);
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease;
    `;
    planetDiv.innerHTML = `
      <div class="planet-icon" style="font-size:${iconSz}">${p.icon}</div>
      <div class="planet-label" style="font-size:${lblSz}">${p.label.replace('\n', '<br>')}</div>
    `;

    /* ── Hover / Touch eventy ── */

    // Funkcia: zastav orbit a rozžiar planétu
    function activatePlanet() {
      // Zastav všetky planéty
      orbitGroup.querySelectorAll('.orbit-planet-track').forEach(od => {
        od.style.animationPlayState = 'paused';
      });
      // Glow efekt na tejto planéte
      planetDiv.style.borderColor  = p.color;
      planetDiv.style.background   = `rgba(${hexToRgb(p.color)}, 0.15)`;
      planetDiv.style.boxShadow    = `0 0 28px ${p.color}, 0 0 60px ${p.color}44, inset 0 0 20px ${p.color}22`;
      planetDiv.style.transform    = 'translate(-50%, -50%) scale(1.3)';
      planetDiv.style.zIndex       = '30';
      // Aktualizuj stred
      container.classList.add('planet-active');
      coreDesc.textContent  = p.desc;
      coreLogo.textContent  = p.icon;
    }

    // Funkcia: obnov orbit
    function deactivatePlanet() {
      orbitGroup.querySelectorAll('.orbit-planet-track').forEach(od => {
        od.style.animationPlayState = 'running';
      });
      planetDiv.style.borderColor  = '';
      planetDiv.style.background   = '';
      planetDiv.style.boxShadow    = '';
      planetDiv.style.transform    = 'translate(-50%, -50%) scale(1)';
      planetDiv.style.zIndex       = '';
      container.classList.remove('planet-active');
      coreLogo.textContent = 'MZ';
    }

    // Myš
    planetDiv.addEventListener('mouseenter', activatePlanet);
    planetDiv.addEventListener('mouseleave', deactivatePlanet);

    // Dotyk (mobil)
    planetDiv.addEventListener('touchstart', (e) => {
      e.preventDefault();
      activatePlanet();
    }, { passive: false });
    planetDiv.addEventListener('touchend', deactivatePlanet);

    orbitDiv.appendChild(planetDiv);
    orbitGroup.appendChild(orbitDiv);
  });

  // Vlož keyframes do stránky
  let styleEl = document.getElementById('orbit-keyframes');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'orbit-keyframes';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = kf;
}


/* ── Nastavenie veľkosti kontajnera ─────────────────────────── */
function sizeOrbit() {
  const c = document.getElementById('orbitContainer');
  if      (window.innerWidth < 700) { c.style.width = '300px'; c.style.height = '300px'; }
  else if (window.innerWidth < 900) { c.style.width = '340px'; c.style.height = '340px'; }
  else                               { c.style.width = '600px'; c.style.height = '600px'; }
}


/* ── Spustenie a aktualizácia pri zmene veľkosti okna ───────── */
buildOrbit();
sizeOrbit();
window.addEventListener('resize', () => {
  buildOrbit();
  sizeOrbit();
});
