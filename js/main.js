/* ============================================================
   main.js — Spoločná logika webu
   
   Čo robí tento súbor:
   - Vlastný kurzor (bodka + kruh)
   - Scroll reveal (prvky sa objavia pri scrollovaní)
   - Command bar (⌘K vyhľadávanie)
   - Mobilné menu (hamburger)
   - Transition overlay pri kliknutí na "Aktivovať Mozog"
   ============================================================ */


/* ===== VLASTNÝ KURZOR ===== */
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

// Bodka sleduje myš okamžite
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
});

// Kruh sleduje myš s oneskorením (plynulý efekt)
(function animRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animRing);
})();

// Na interaktívnych prvkoch sa kurzor zväčší a zmení farbu
document.querySelectorAll('a, button, .planet, .reel-card, .project-card, .month-card, .command-item, .contact-channel, .priority-btn').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width  = '20px'; cursor.style.height = '20px';
    cursor.style.background = 'var(--cyan)';
    ring.style.width  = '60px'; ring.style.height = '60px';
    ring.style.borderColor = 'rgba(0,212,255,0.5)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width  = '12px'; cursor.style.height = '12px';
    cursor.style.background = 'var(--violet)';
    ring.style.width  = '36px'; ring.style.height = '36px';
    ring.style.borderColor = 'rgba(123,47,255,0.5)';
  });
});


/* ===== PRECHODOVÝ OVERLAY (Aktivovať Mozog) =====
   Keď klikneš na "AKTIVOVAŤ MOZOG":
   1. Zobrazí sa čierny overlay s textom "🧠 AKTIVUJEM MOZOG..."
   2. Stránka sa plynule scrolluje na Mozog sekciu
   3. Overlay zmizne
*/
function activateMozog() {
  closeCommand(); // Zatvor command bar ak je otvorený
  const overlay = document.getElementById('mozog-transition');
  overlay.classList.add('active');
  setTimeout(() => {
    document.getElementById('mozog-section').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => { overlay.classList.remove('active'); }, 700);
  }, 600);
}


/* ===== COMMAND BAR (⌘K) ===== */
function openCommand() {
  document.getElementById('command-overlay').classList.add('open');
  document.getElementById('command-input').focus();
  document.body.style.overflow = 'hidden'; // Zablokuj scroll pozadia
}

function closeCommand() {
  document.getElementById('command-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// Zatvor kliknutím mimo
document.getElementById('command-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('command-overlay')) closeCommand();
});

// Klávesové skratky
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openCommand(); }
  if (e.key === 'Escape') closeCommand();
});

// Filtrovanie výsledkov pri písaní
document.getElementById('command-input').addEventListener('input', function() {
  const q = this.value.toLowerCase();
  document.querySelectorAll('.command-item').forEach(item => {
    const name = item.querySelector('.cmd-item-name')?.textContent.toLowerCase() || '';
    const desc = item.querySelector('.cmd-item-desc')?.textContent.toLowerCase() || '';
    item.style.display = (!q || name.includes(q) || desc.includes(q)) ? 'flex' : 'none';
  });
});

// Navigácia na sekciu a zatvorenie command baru
function navigateTo(id) {
  closeCommand();
  setTimeout(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, 200);
}


/* ===== MOBILNÉ MENU ===== */
function toggleMobile() { document.getElementById('mobileMenu').classList.toggle('open'); }
function closeMobile()  { document.getElementById('mobileMenu').classList.remove('open'); }


/* ===== SCROLL REVEAL =====
   Prvky s triedou "reveal" sa objavia keď prídu do zorného poľa.
   Ako použiť: Pridaj class="reveal" na akýkoľvek HTML prvok.
*/
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.1 });
revealEls.forEach(el => revealObserver.observe(el));
