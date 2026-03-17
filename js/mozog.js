/* ============================================================
   mozog.js — Majstrovský Mozog AI Event Planner
   
   Čo robí tento súbor:
   - Budget slider s hláškami podľa výšky rozpočtu
   - Slider pre počet hostí
   - Výber priority atmosféry (Energia / Elegancia / Pohoda)
   - Generovanie plánu podľa typu akcie + priority + rozpočtu
   - 4 tiery: micro (eBook), low (doplnky), mid (na mieru), high (premium)
   - Thinking animácia počas generovania
   - Výpis výsledkov s modulmi, summary, CTA tlačidlami
   ============================================================ */


/* ===== STAV APLIKÁCIE ===== */
let selectedPriority = null;
let currentBudget    = 500;


/* ===== BUDGET SLIDER ===== */
const budgetSlider = document.getElementById('budgetSlider');

/* Hlášky podľa výšky rozpočtu
   max = do akej hodnoty platí táto správa
   pill = text v badge-u vedľa sumy
   tip  = malý text pod sliderom
*/
const tooltipMessages = [
  { max: 50,   zone: 'micro', pill: '📖 eBook mód',         tip: 'Majstrovský eBook mód'                   },
  { max: 250,  zone: 'low',   pill: '🎈 Ekonomická radosť', tip: 'Šikovné riešenia s malým budgetom'        },
  { max: 600,  zone: 'mid',   pill: '✨ Zlatý stred',        tip: 'Zlatý stred — program na mieru'           },
  { max: 1200, zone: 'mid',   pill: '🚀 Rastúca hviezda',   tip: 'Rastúca hviezda — skoro premium!'          },
  { max: 3001, zone: 'high',  pill: '👑 Majstrovská liga',   tip: 'Majstrovská liga — produkcia na kľúč'     },
];

/* Vráti tier (micro/low/mid/high) podľa hodnoty */
function getBudgetTier(v) {
  if (v <= 50)   return 'micro';
  if (v < 250)   return 'low';
  if (v <= 1000) return 'mid';
  return 'high';
}

/* Aktualizuje UI slider-a pri každom posunutí */
function updateBudgetSlider() {
  const v   = parseInt(budgetSlider.value);
  currentBudget = v;

  // Suma
  document.getElementById('budgetAmount').textContent = v >= 3000 ? '3 000 € +' : v + ' €';

  // Nájdi správnu hlášku
  const entry = tooltipMessages.find(t => v <= t.max) || tooltipMessages[tooltipMessages.length - 1];
  const tier  = getBudgetTier(v);

  // Badge s názvom zóny
  const pill = document.getElementById('budgetZonePill');
  pill.textContent = entry.pill;
  pill.className   = 'budget-zone-pill zone-' + tier;

  // Tooltip text pod sliderom
  document.getElementById('budgetTooltip').textContent = entry.tip;

  // Zvýrazni aktívnu zónu v barovom prehľade
  document.querySelectorAll('.bz').forEach(b => b.classList.remove('active-zone'));
  if (tier === 'low' || tier === 'micro') document.querySelector('.bz-low').classList.add('active-zone');
  if (tier === 'mid')                     document.querySelector('.bz-mid').classList.add('active-zone');
  if (tier === 'high')                    document.querySelector('.bz-high').classList.add('active-zone');
}

budgetSlider.addEventListener('input', updateBudgetSlider);
updateBudgetSlider(); // inicializuj pri načítaní


/* ===== SLIDER POČTU HOSTÍ ===== */
const guestSlider = document.getElementById('guestCount');
const rangeVal    = document.getElementById('rangeVal');

function updateSlider() {
  const v = parseInt(guestSlider.value);
  rangeVal.textContent = v >= 1000 ? '1000+ osôb' : v + ' osôb';
  const pct = (v - 10) / (1000 - 10) * 100;
  guestSlider.style.background = `linear-gradient(90deg, #b44dff ${pct}%, rgba(255,255,255,0.1) ${pct}%)`;
}

guestSlider.addEventListener('input', updateSlider);
updateSlider();


/* ===== VÝBER PRIORITY ===== */
function selectPriority(btn) {
  document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedPriority = btn.dataset.value;
  document.getElementById('errorHint').classList.remove('show');
}


/* ===== DATABÁZA PLÁNOV (planDB) =====
   Štruktúra: planDB[typAkcie][priorita] = pole modulov
   Každý modul má: icon, name, desc, badge
   
   Ako pridať nový typ akcie:
   1. Pridaj option do selectu v index.html
   2. Sem pridaj záznam: novyTyp: { energia: [...], elegancia: [...], pohoda: [...] }
*/
const planDB = {
  firemny: {
    energia: [
      { icon:'⚡', name:'MZ Move',        desc:'Dynamická zóna so živou hudbou a pohybovými aktivitami pre celý tím', badge:'BESTSELLER' },
      { icon:'🎙️', name:'Moderátor Pro',  desc:'Charizmatický moderátor s interaktívnymi hrami a live kvízmi',        badge:'ODPORÚČAM'  },
      { icon:'🎆', name:'Afterparty Show', desc:'Ohňostroj + DJ set do rána — záver, na ktorý nezabudnú',              badge:'PREMIUM'    },
    ],
    elegancia: [
      { icon:'🍷', name:'Gala Večer',         desc:'Elegantne aranžované stoly, živá kapela, dress code black tie',        badge:'LUXUS'     },
      { icon:'🎭', name:'Artistické Šou',      desc:'Profesionálni artisti: žongléri, akrobati, iluzionisti na javisku',    badge:'WOW EFEKT' },
      { icon:'📸', name:'Premium Foto Zóna',   desc:'Profesionálna 360° fotokabínka s okamžitou tlačou a logom firmy',     badge:'BRAND'     },
    ],
    pohoda: [
      { icon:'🎉', name:'Team Fun Zone', desc:'Spoločenské hry, kvízy, priateľská súťaž pre celý tím',        badge:'OBĽÚBENÝ' },
      { icon:'🍕', name:'Food Lounge',   desc:'Neformálne stolovanie, street food catering, live cooking',     badge:'KOMFORT'  },
      { icon:'🎵', name:'Live Akustika', desc:'Živý akustický set v príjemnom prostredí — teplo a ľudskosť',  badge:'SRDCOVKA' },
    ],
  },
  svadba: {
    energia: [
      { icon:'💃', name:'Dance Floor VIP', desc:'Profesionálny DJ, svetelná šou, tanečná plocha s efektmi',          badge:'TANCOVAČKA' },
      { icon:'🎊', name:'Konfeti Kanón',   desc:'Dramatický prvý tanec s konfetami a blikajúcimi svetlami',           badge:'WOW MOMENT' },
      { icon:'🎤', name:'Live Band',        desc:'Skúsená svadobná kapela — od prvého tanca až po ranné hodiny',       badge:'KLASIKA'    },
    ],
    elegancia: [
      { icon:'🌹', name:'Luxury Decor',        desc:'Prémiová výzdoba s kvetmi, sviečkami a elegantným priestretím',  badge:'LUXUS'    },
      { icon:'🍾', name:'Champagne Tower',      desc:'Živá šampanská veža pre nezabudnuteľný moment pred hosťami',    badge:'ICONIC'   },
      { icon:'🎻', name:'Sláčikové Kvarteto',   desc:'Klasická hudba počas svadobnej hostiny — sofistikovanosť',      badge:'PRÉMIOVÉ' },
    ],
    pohoda: [
      { icon:'🌿', name:'Záhradná Svadoba', desc:'Vonkajšie posedenie, prírodná atmosféra, teplo rodiny',           badge:'OBĽÚBENÉ' },
      { icon:'📷', name:'Foto & Spomienky', desc:'Candid fotograf + polaroidová svadobná kniha podpisov hostí',     badge:'MEMORY'   },
      { icon:'🎂', name:'Torta Šou',         desc:'Špeciálny krájací rituál s hudbou, svetlami a prekvapením',      badge:'SWEET'    },
    ],
  },
  narozeniny: {
    energia: [
      { icon:'🎉', name:'Party Blast',    desc:'Hardcore párty setup s DJ-om, stroboskopmi a tanečným florom', badge:'PARTY HARD' },
      { icon:'🎤', name:'Karaoke VIP',    desc:'Profesionálna karaoke zóna s LED obrazovkou a mikrofónmi',      badge:'FUN'        },
      { icon:'🎆', name:'Surprise Show',  desc:'Organizovaný surprise moment so špeciálnymi efektmi a tortou', badge:'WOW'        },
    ],
    elegancia: [
      { icon:'💎', name:'VIP Dinner',  desc:'Exkluzívna večera s prémiovým menu a osobnou obsluhou',             badge:'LUXUS'    },
      { icon:'🍾', name:'Bubble Bar',  desc:'Šampanský bar s výberom prémiových vín a šumivých nápojov',         badge:'PREMIUM'  },
      { icon:'🌟', name:'Star Setup',  desc:'Hviezdicový dekor s personalizovanými detailmi na každom stole',    badge:'PERSONAL' },
    ],
    pohoda: [
      { icon:'🏡', name:'Garden Party',   desc:'Záhradná oslava v uvoľnenej atmosfére s grilom a hrami',         badge:'RELAXED'  },
      { icon:'🎵', name:'Playlist Live',  desc:'Curated playlist + žongléri a akustická kapela',                  badge:'VIBES'    },
      { icon:'📸', name:'Photo Booth',    desc:'Personalizovaná fotokabínka s rekvizitami a okamžitou tlačou',   badge:'MEMORIES' },
    ],
  },
  teambuilding: {
    energia: [
      { icon:'🏆', name:'Olympiáda Tímu',  desc:'Súťažné disciplíny v tímoch: rýchlosť, sila, kreativita',       badge:'SÚŤAŽ'    },
      { icon:'⚡', name:'Escape Room XXL', desc:'Veľkoformátový escape room priamo na mieste eventy',              badge:'MIND GAME' },
      { icon:'🎯', name:'Target Challenge', desc:'Lukostrelba, axe throwing, paintball — adrenalín zaručený',     badge:'ADRENALIN' },
    ],
    elegancia: [
      { icon:'🍳', name:'Cooking Battle', desc:'Tímové varenie pod vedením šéfkuchára s hodnotením a cenami',     badge:'KREATIVITA' },
      { icon:'🎨', name:'Art Workshop',   desc:'Tvorivý workshop — maľovanie, sculpting, dizajn v tímoch',        badge:'TVORIVOSŤ'  },
      { icon:'🍷', name:'Wine Tasting',   desc:'Profesionálna degustácia vín so sommeliérom a vzdelávaním',       badge:'KULTÚRA'    },
    ],
    pohoda: [
      { icon:'🌿', name:'Outdoor Relax',     desc:'Turistika, piknik a hry v prírode — ideál pre každý vek',     badge:'PRÍRODA'   },
      { icon:'🎲', name:'Board Game Arena',  desc:'Obrovská zbierka spoločenských hier v príjemnom prostredí',   badge:'FUN'       },
      { icon:'🧘', name:'Wellness Reset',    desc:'Spoločné cvičenie, mindfulness session a relaxačná zóna',     badge:'WELL-BEING' },
    ],
  },
  gala: {
    energia: [
      { icon:'🎭', name:'Grand Šou',      desc:'Veľkolepá šou s tanečníkmi, artistami a ohňostrojom',          badge:'SPEKTÁKL' },
      { icon:'💃', name:'Taneční Sólisté', desc:'Profesionálni tanečníci s choreografiou špeciálne pre vás',   badge:'PREMIUM'  },
      { icon:'🎙️', name:'Celebrity MC',   desc:'Renomovaný moderátor s charizmatickým prejavom',               badge:'HVIEZDA'  },
    ],
    elegancia: [
      { icon:'👑', name:'Royal Setup',    desc:'Kráľovská výzdoba s cristal lustre, zlatými detailmi a kvetmi', badge:'ROYAL'   },
      { icon:'🎻', name:'Orchester Live', desc:'Živý komorný orchester počas večere a slávnostného programu',   badge:'KLASIKA' },
      { icon:'🍽️', name:'Gourmet Menu',   desc:'Päťchodové menu od Michelin chef s wine pairings',              badge:'GOURMET' },
    ],
    pohoda: [
      { icon:'🌟', name:'Stars & Stories', desc:'Osobné príbehy, videá a prezentácia úspechov spoločnosti', badge:'EMOTÍVNE'   },
      { icon:'📸', name:'Photo Memories',  desc:'Profesionálny fotograf + video highlight reels na záver',   badge:'SPOMIENKY'  },
      { icon:'🥂', name:'Cocktail Lounge', desc:'Prémiový kokteilový bar s barmanom a špeciálnymi kartami',  badge:'LOUNGE'     },
    ],
  },
};

/* Záložný plán ak typ akcie nie je v databáze */
const defaultPlan = {
  energia:  [
    { icon:'⚡', name:'MZ Move',        desc:'Dynamická zóna so živou hudbou a energetickými aktivitami', badge:'BESTSELLER' },
    { icon:'🎙️', name:'Moderátor Pro', desc:'Profesionálny moderátor s interaktívnymi prvkami a hrami',  badge:'ODPORÚČAM'  },
    { icon:'🎆', name:'Záverečná Show', desc:'Špeciálna záverečná šou pre maximum dojmov a zážitkov',     badge:'PREMIUM'    },
  ],
  elegancia: [
    { icon:'💎', name:'Premium Setup',         desc:'Luxusná výzdoba a elegantná atmosféra na každom kroku',    badge:'LUXUS' },
    { icon:'🎭', name:'Artistické Vystúpenie', desc:'Profesionálni umelci pre nezabudnuteľný vizuálny zážitok', badge:'WOW'  },
    { icon:'🍷', name:'VIP Lounge',             desc:'Exkluzívna VIP zóna s prémiovým servisom a nápojmi',      badge:'VIP'  },
  ],
  pohoda: [
    { icon:'🎉', name:'Fun Zone',      desc:'Zábavné aktivity pre všetkých hostí bez rozdielu veku', badge:'FAMILY'  },
    { icon:'🍕', name:'Food Station',  desc:'Chutný catering s výberom pre každý vkus a diétu',       badge:'KOMFORT' },
    { icon:'🎵', name:'Live Music',    desc:'Živá hudba vytvárajúca teplú a príjemnú atmosféru',       badge:'VIBES'   },
  ],
};

/* Správy počas "Thinking" animácie */
const thinkingSteps = [
  'Analyzujem rozpočet...',
  'Prechádzam databázu eventov...',
  'Filtrujem dostupné moduly...',
  'Zostavujem váš plán...',
];

/* Dáta pre každý tier výsledku */
const tierData = {
  low: {
    label:     'MAJSTROVSKÉ DOPLNKY',
    tierClass: 'tier-low',
    noteClass: 'note-low',
    note:      'Pre komplexný program s naším tímom je potrebný vyšší rozpočet, ale títo naši poslovia zábavy urobia skvelú prácu aj tak!',
    modules: [
      { icon:'🦁', name:'Maskot na mieru',  desc:'Kostýmovaný maskot, ktorý rozžiari každú oslavu a nadchne deti i dospelých', badge:'HIT U DETÍ'     },
      { icon:'📸', name:'Fotostena',         desc:'Profesionálna fotostena s logom alebo tematickým dizajnom',                  badge:'INSTAGRAMABLE'  },
      { icon:'🍭', name:'Cukrová vata',      desc:'Farebný stánok s cukrovou vatou — vždy funguje, vždy prináša úsmevy',       badge:'SLADKÝ HIT'     },
      { icon:'🔊', name:'Prenájom techniky', desc:'Ozvučenie, mikrofóny, reproduktory — všetko pre dobrý zvuk',                badge:'ZÁKLAD'         },
    ],
  },
  mid: {
    label:     'PROGRAM NA MIERU',
    tierClass: 'tier-mid',
    noteClass: 'note-mid',
    note:      null,
    modules:   null, // používa planDB
  },
  high: {
    label:     'PRODUKCIA NA KĽÚČ',
    tierClass: 'tier-high',
    noteClass: 'note-high',
    note:      null,
    modules: [
      { icon:'🏙️', name:'Mestské dni',      desc:'Kompletná produkcia mestskej slávnosti — stage, program, artisti, logistika', badge:'MEGA EVENT'   },
      { icon:'🏢', name:'Firemný event XL', desc:'Plnohodnotný firemný event na kľúč — od konceptu po realizáciu a follow-up',  badge:'ALL-IN-ONE'   },
      { icon:'🎪', name:'Festival Package', desc:'Viacdenný festival s plnou produkciou, headlinermi a technickým tímom',       badge:'FESTIVAL PRO' },
    ],
  },
};


/* ===== GENEROVANIE PLÁNU ===== */
function generatePlan() {
  const eventType = document.getElementById('eventType').value;

  // Validácia — musia byť vyplnené oba
  if (!eventType || !selectedPriority) {
    document.getElementById('errorHint').classList.add('show');
    if (!eventType) {
      const el = document.getElementById('eventType');
      el.style.borderColor = '#ff6b6b';
      el.style.boxShadow   = '0 0 12px rgba(255,80,80,0.25)';
      setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 1800);
    }
    if (!selectedPriority) {
      document.querySelectorAll('.priority-btn').forEach(b => {
        b.style.borderColor = 'rgba(255,107,107,0.5)';
        setTimeout(() => { b.style.borderColor = ''; }, 1800);
      });
    }
    return;
  }

  // Skry formulár, zobraz thinking animáciu
  document.getElementById('errorHint').classList.remove('show');
  document.getElementById('plannerSection').style.display = 'none';
  document.getElementById('resultSection').classList.remove('visible');
  document.getElementById('resultSection').style.display = 'none';

  const to = document.getElementById('thinkingOverlay');
  to.classList.add('visible');

  // Rôzne správy podľa tier-u
  const tier = getBudgetTier(currentBudget);
  const tierSteps = {
    micro: ['Detekujem micro-budget...', 'Hľadám kreatívne riešenia...', 'Pripravujem eBook...', 'Hotovo!'],
    low:   ['Analyzujem budget...', 'Vyberám doplnky zábavy...', 'Zostavujem ponuku...', 'Hotovo!'],
    mid:   thinkingSteps,
    high:  ['Aktivujem premium mód...', 'Kontaktujem produkčný tím...', 'Kalkulujem full package...', 'Hotovo!'],
  };
  const steps = tierSteps[tier] || thinkingSteps;
  let step = 0;
  document.getElementById('thinkingLabel').textContent = steps[0];
  const interval = setInterval(() => {
    step = (step + 1) % steps.length;
    document.getElementById('thinkingLabel').textContent = steps[step];
  }, 600);

  // Po 2.6s skry thinking, zobraz výsledok
  setTimeout(() => {
    clearInterval(interval);
    to.classList.remove('visible');
    renderResult(eventType, parseInt(guestSlider.value));
  }, 2600);
}


/* ===== VYKRESLENIE VÝSLEDKU ===== */
function renderResult(eventType, guests) {
  const prio          = selectedPriority;
  const tier          = getBudgetTier(currentBudget);
  const budgetDisplay = currentBudget >= 3000 ? '3 000 € +' : currentBudget + ' €';
  const guestStr      = guests >= 1000 ? '1000+' : guests;

  const typeLabels = {
    firemny:'Firemný event', svadba:'Svadba', narozeniny:'Narodeninová párty',
    teambuilding:'Teambuilding', koncert:'Koncert / Show', detsky:'Detský event', gala:'Galavečer',
  };
  const prioLabels = { energia:'Energia ⚡', elegancia:'Elegancia 💎', pohoda:'Pohoda 🌿' };

  // Zobraz result sekciu
  const rs = document.getElementById('resultSection');
  rs.style.display = 'block';
  rs.classList.add('visible');

  // Premium glow na karte pre high tier
  const card = document.getElementById('mozogCard');
  card.classList.remove('tier-premium');
  if (tier === 'high') card.classList.add('tier-premium');

  // Micro budget → eBook mód
  if (tier === 'micro') {
    renderEbook(guestStr, budgetDisplay, prioLabels[prio]);
    return;
  }

  // Vyber moduly podľa tier-u
  const tierInfo = tierData[tier];
  let modules;
  if (tier === 'low')  modules = tierInfo.modules;
  else if (tier === 'high') modules = tierInfo.modules;
  else modules = (planDB[eventType] && planDB[eventType][prio]) ? planDB[eventType][prio] : defaultPlan[prio];

  // AI správa (typewriter efekt)
  const aiMessages = {
    low:  `Budget ${budgetDisplay} detekovaný. Pre ${guestStr} hostí som vybral 4 doplnky zábavy, ktoré maximalizujú radosť bez prečerpania rozpočtu.`,
    mid:  `Budget ${budgetDisplay} odomkol kategóriu Program na Mieru. Pre ${guestStr} hostí som zostavil 3 moduly presne podľa vašich preferencií.`,
    high: `Prémiový budget ${budgetDisplay} aktivoval Produkciu na Kľúč. Pre ${guestStr} hostí nasadzujeme plnohodnotný produkčný tím od A po Z.`,
  };

  // Tier badge v nadpise
  document.getElementById('resultSection').querySelector('.result-label').innerHTML =
    `Môj návrh — <div class="tier-badge ${tierInfo.tierClass}">${tierInfo.label}</div>`;

  // Typewriter
  const aiText   = document.getElementById('aiText');
  const cursorEl = document.getElementById('cursorEl');
  aiText.textContent = '';
  cursorEl.style.display = 'inline-block';
  const text = aiMessages[tier];
  let i = 0;
  const tw = setInterval(() => {
    if (i < text.length) { aiText.textContent += text[i]; i++; }
    else {
      clearInterval(tw);
      setTimeout(() => { cursorEl.style.display = 'none'; }, 900);
      // Pridaj tier poznámku ak existuje
      if (tierInfo.note) {
        const noteEl = document.createElement('div');
        noteEl.className = `tier-note ${tierInfo.noteClass}`;
        noteEl.textContent = tierInfo.note;
        noteEl.style.marginTop = '12px';
        document.getElementById('aiMessage').appendChild(noteEl);
      }
    }
  }, 22);

  // Moduly
  const grid = document.getElementById('modulesGrid');
  grid.innerHTML = '';
  modules.forEach(m => {
    const c2 = document.createElement('div');
    c2.className = 'module-card';
    c2.innerHTML = `
      <div class="module-icon">${m.icon}</div>
      <div>
        <div class="module-name">${m.name}</div>
        <div class="module-desc">${m.desc}</div>
      </div>
      <div class="module-badge">${m.badge}</div>
    `;
    grid.appendChild(c2);
  });

  // Summary bar
  document.getElementById('summaryBar').innerHTML = `
    <div class="sum-item"><span class="sum-key">Akcia</span>    <span class="sum-val">${typeLabels[eventType] || eventType}</span></div>
    <div class="sum-item"><span class="sum-key">Hostia</span>   <span class="sum-val">${guestStr} os.</span></div>
    <div class="sum-item"><span class="sum-key">Štýl</span>     <span class="sum-val">${prioLabels[prio]}</span></div>
    <div class="sum-item"><span class="sum-key">Rozpočet</span> <span class="sum-val">${budgetDisplay}</span></div>
    <div class="sum-item"><span class="sum-key">Tier</span>     <span class="sum-val">${tierInfo.label}</span></div>
  `;

  document.getElementById('ctaRow').style.display = 'grid';

  // Stagger animácia kariet
  setTimeout(() => {
    grid.querySelectorAll('.module-card').forEach((c, idx) => {
      setTimeout(() => c.classList.add('revealed'), 300 + idx * 160);
    });
  }, 100);
}


/* ===== EBOOK MÓD (micro budget ≤50€) ===== */
function renderEbook(guestStr, budgetDisplay, prioLabel) {
  document.getElementById('aiMessage').style.display = 'none';
  document.querySelector('.result-label').textContent = 'Majstrovský eBook mód';
  document.getElementById('ctaRow').style.display = 'none';

  const grid = document.getElementById('modulesGrid');
  grid.innerHTML = `
    <div class="ebook-card">
      <div class="ebook-icon">📖</div>
      <div class="ebook-title">Majstrovský eBook: Ako na oslavu svojpomocne</div>
      <div class="ebook-desc">
        Budget ${budgetDisplay} je zatiaľ v micro zóne. Bez obáv — pripravili sme pre vás kompletného
        sprievodcu, ako usporiadať skvelú oslavu vlastnými silami. Obsahuje tipy na dekorácie, hudbu,
        catering aj zábavný program pre ${guestStr} hostí.
      </div>
      <div class="ebook-cta-row">
        <button type="button" class="ebook-btn ebook-btn-primary" onclick="approvePlan()">📥 Získať eBook zdarma</button>
        <button type="button" class="ebook-btn ebook-btn-secondary" onclick="contactConsult()">📞 Individuálna konzultácia</button>
      </div>
    </div>
  `;

  document.getElementById('summaryBar').innerHTML = `
    <div class="sum-item"><span class="sum-key">Mód</span>    <span class="sum-val">📖 eBook</span></div>
    <div class="sum-item"><span class="sum-key">Budget</span> <span class="sum-val">${budgetDisplay}</span></div>
    <div class="sum-item"><span class="sum-key">Hostia</span> <span class="sum-val">${guestStr} os.</span></div>
  `;

  grid.querySelector('.ebook-card').style.animation = 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards';
}


/* ===== AKCIE TLAČIDIEL ===== */
function approvePlan() {
  const t = document.getElementById('toast');
  t.textContent = '✓ Plán odoslaný Majstrom!';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function contactConsult() {
  const t = document.getElementById('toast');
  t.textContent = '📞 Kontaktujeme vás do 24 hodín!';
  t.classList.add('show');
  setTimeout(() => { t.classList.remove('show'); t.textContent = '✓ Plán odoslaný Majstrom!'; }, 3200);
}

function resetPlan() {
  document.getElementById('resultSection').classList.remove('visible');
  document.getElementById('resultSection').style.display = 'none';
  document.getElementById('aiMessage').style.display = '';
  document.getElementById('plannerSection').style.display = '';
  document.getElementById('eventType').value = '';
  document.getElementById('aiMessage').querySelectorAll('.tier-note').forEach(n => n.remove());

  guestSlider.value   = 50;  updateSlider();
  budgetSlider.value  = 500; updateBudgetSlider();

  document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
  selectedPriority = null;
  currentBudget    = 500;

  document.getElementById('errorHint').classList.remove('show');
  document.getElementById('mozogCard').classList.remove('tier-premium');
  document.querySelector('.result-label').innerHTML = 'Môj návrh pre vás';
  document.getElementById('ctaRow').style.display = 'grid';
}
