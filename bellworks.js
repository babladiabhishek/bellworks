(function () {
  'use strict';
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var REDUCED = motionQuery.matches;
  motionQuery.addEventListener('change', function(e) { REDUCED = e.matches; });
  var thumbnail = window.BellworksVideo.thumbnail;
  var stopVideos = window.BellworksVideo.stopAll;

  /* =====================================================================
     BODY MAP — stylised front/back silhouettes with named muscle regions
     ===================================================================== */
  var BODY = {
    base: [['path', { d: 'M49 12Q60 3 71 12L72 24Q68 36 60 36Q52 34 48 24Z' }], ['rect', { x: 54, y: 31, width: 12, height: 11, rx: 3 }],
      ['path', { d: 'M49 39Q45 43 36 45Q29 48 31 60L40 86L44 114L39 137Q60 147 81 137L76 114L80 86L89 60Q91 48 84 45Q75 43 71 39Z' }]],
    baseR: [['path', { d: 'M86 46Q99 47 99 62L104 91Q102 102 94 99L86 72Z' }], ['path', { d: 'M94 99Q103 96 105 111L107 139L102 153L96 151L96 128L91 110Z' }], ['circle', { cx: 104, cy: 160, r: 7 }],
      ['path', { d: 'M62 139Q77 133 84 141Q88 159 80 183L77 202Q70 209 65 201L62 167Z' }], ['path', { d: 'M65 204L78 204Q84 218 76 237L77 249L68 250L66 233Q60 218 65 204Z' }], ['rect', { x: 64, y: 248, width: 22, height: 8, rx: 3 }]],
    front: {
      center: [['rect', { x: 52, y: 82, width: 16, height: 46, rx: 4 }, 'Core']],
      right: [['ellipse', { cx: 86, cy: 52, rx: 9, ry: 8 }, 'Shoulders'], ['path', { d: 'M62 46 L84 48 Q86 60 82 74 Q72 80 62 78 Z' }, 'Chest'],
        ['path', { d: 'M90 59Q98 60 99 73L102 89Q98 96 93 90L89 73Z' }, 'Biceps'], ['path', { d: 'M95 104Q103 103 103 115L105 140L100 146L98 128Z' }, 'Grip'],
        ['path', { d: 'M70 84 L80 86 L78 126 L70 128 Z' }, 'Core'], ['path', { d: 'M64 147Q72 142 81 146Q84 165 77 184L74 196L67 195L65 178Z' }, 'Quads']]
    },
    back: {
      center: [['path', { d: 'M60 40 L78 48 L64 90 L56 90 L42 48 Z' }, 'Back'], ['rect', { x: 53, y: 100, width: 14, height: 34, rx: 3 }, 'Back']],
      right: [['ellipse', { cx: 86, cy: 52, rx: 9, ry: 8 }, 'Shoulders'], ['path', { d: 'M66 72 L86 66 L82 100 L66 122 Z' }, 'Back'],
        ['path', { d: 'M90 59Q98 60 99 73L102 89Q98 96 93 90L89 73Z' }, 'Triceps'], ['path', { d: 'M95 104Q103 103 103 115L105 140L100 146L98 128Z' }, 'Grip'],
        ['path', { d: 'M62 142 L82 142 Q86 152 82 164 L64 166 Q60 154 62 142 Z' }, 'Glutes'], ['path', { d: 'M66 169L81 168L79 189L75 204L67 202Z' }, 'Hamstrings'],
        ['path', { d: 'M67 210L78 210Q82 220 74 239L70 244L68 232Q64 220 67 210Z' }, 'Calves']]
    }
  };
  function svgEl(s) {
    var at = s[1], a = '', k;
    for (k in at) a += ' ' + k + '="' + at[k] + '"';
    return '<' + s[0] + a + (s[2] ? ' class="m" data-m="' + s[2] + '"' : ' class="b"') + '/>';
  }
  function bodySVG(view) {
    var base = BODY.base.map(svgEl).join(''), baseR = BODY.baseR.map(svgEl).join('');
    var v = BODY[view], center = v.center.map(svgEl).join(''), right = v.right.map(svgEl).join('');
    var mirror = '<g transform="translate(120 0) scale(-1 1)">';
    return '<svg class="body" viewBox="0 0 120 262" aria-hidden="true"><g>' + base + baseR + mirror + baseR + '</g></g>' +
      '<g>' + center + right + mirror + right + '</g></g></svg>';
  }
  function bodiesHTML(withLabels) {
    return '<div class="bodywrap">' + bodySVG('front') + (withLabels ? '<div class="lbl">Front</div>' : '') + '</div>' +
      '<div class="bodywrap">' + bodySVG('back') + (withLabels ? '<div class="lbl">Back</div>' : '') + '</div>';
  }
  function paintBody(container, mode, data) {
    var ms = container.querySelectorAll('.m');
    ms.forEach(function (el) { el.classList.remove('p', 's', 'h'); el.style.fillOpacity = ''; });
    ms.forEach(function (el) {
      var g = el.getAttribute('data-m');
      if (mode === 'ex') {
        if (data.primary.indexOf(g) >= 0) el.classList.add('p');
        else if (data.secondary.indexOf(g) >= 0) el.classList.add('s');
      } else if (mode === 'heat' && data[g]) {
        el.classList.add('h'); el.style.fillOpacity = data[g].toFixed(2);
      }
    });
  }

  /* =====================================================================
     PROGRAM DATA — single source of truth for cards, map and chart
     ===================================================================== */
  var DAYS = [
    {
      id: 'a', tab: 'Day A', focus: 'Push & Squat',
      note: 'Quads, chest, shoulders, triceps — finish with a heavy walk.',
      exercises: [
        { slug: 'goblet-squat', name: 'Goblet Squat', sets: 3, reps: '8–12', rest: '90 s', side: false,
          primary: ['Quads'], secondary: ['Glutes', 'Core'],
          cue: 'Bell at the chest, elbows track inside the knees, heels down. Sit between your hips, then stand up hard.',
          swap: 'Double-rack front squat once one bell feels light' },
        { slug: 'oh-press', name: 'Single-Arm Overhead Press', sets: 3, reps: '6–10', rest: '90 s', side: true,
          primary: ['Shoulders'], secondary: ['Triceps', 'Core'],
          cue: 'Squeeze the glute under the pressing arm, ribs down, press to a full lockout by your ear.',
          swap: 'Push press when you stall at 6 reps' },
        { slug: 'floor-press', name: 'Floor Press', sets: 3, reps: '8–12', rest: '90 s', side: true,
          primary: ['Chest'], secondary: ['Triceps'],
          cue: 'Lying down, elbow about 45° from your ribs. Touch the upper arm softly to the floor, press back up.',
          swap: 'Two-bell floor press for double the load' },
        { slug: 'rev-lunge', name: 'Goblet Reverse Lunge', sets: 3, reps: '8–10', rest: '90 s', side: true,
          primary: ['Quads'], secondary: ['Glutes'],
          cue: 'Long step back, rear knee kisses the floor, drive up through the front heel.',
          swap: 'Rack-hold split squat' },
        { slug: 'tri-ext', name: 'Overhead Triceps Extension', sets: 2, reps: '10–15', rest: '60 s', side: false,
          primary: ['Triceps'], secondary: [],
          cue: 'Hold the bell by the horns overhead, elbows pointing forward, lower deep behind the head.',
          swap: 'Skull crusher lying on the floor' },
        { slug: 'farmer-carry', name: 'Farmer’s Carry', sets: 3, reps: '40 m', rest: '90 s', side: false,
          primary: ['Grip'], secondary: ['Back', 'Core'],
          cue: 'Heaviest bells you can hold tall. Shoulders packed, quick small steps, no leaning.',
          swap: 'Out of space? 45 s marching on the spot' }
      ]
    },
    {
      id: 'b', tab: 'Day B', focus: 'Pull & Hinge',
      note: 'The lat day — rows, pullovers and the whole posterior chain.',
      exercises: [
        { slug: 'kb-deadlift', name: 'Kettlebell Deadlift', sets: 3, reps: '8–12', rest: '2 min', side: false,
          primary: ['Glutes'], secondary: ['Hamstrings', 'Back'],
          cue: 'Bell between the feet. Hinge — hips back, flat back — and push the floor away. It’s not a squat.',
          swap: 'Sumo stance to go heavier sooner' },
        { slug: 'gorilla-row', name: 'Gorilla Row', sets: 3, reps: '8–12', rest: '90 s', side: true,
          primary: ['Back'], secondary: ['Biceps'],
          cue: 'Deep hinge over the bells, row to the hip while the other arm stays long. Hips stay square.',
          swap: 'Bench-supported one-arm row' },
        { slug: 'swing', name: 'Two-Hand Swing', sets: 3, reps: '12–15', rest: '90 s', side: false,
          primary: ['Glutes', 'Hamstrings'], secondary: ['Back'],
          cue: 'A hinge, not a squat: snap the hips forward and let the bell float to chest height. Arms are ropes.',
          swap: 'Form fading? 10 crisp reps beat 15 sloppy ones' },
        { slug: 'pullover', name: 'Kettlebell Pullover', sets: 2, reps: '10–15', rest: '60 s', side: false,
          primary: ['Back'], secondary: ['Chest', 'Core'],
          cue: 'On your back, slight elbow bend, lower the bell behind your head until the lats stretch. Ribs stay down.',
          swap: 'Reduce range before reducing weight' },
        { slug: 'curl', name: 'Horn Curl', sets: 2, reps: '10–15', rest: '60 s', side: false,
          primary: ['Biceps'], secondary: [],
          cue: 'Hold the bell by the horns, elbows pinned to your sides, squeeze hard at the top.',
          swap: 'Single-arm offset curl' },
        { slug: 'suitcase-carry', name: 'Suitcase Carry', sets: 2, reps: '30–45 s', rest: '60 s', side: true,
          primary: ['Core'], secondary: ['Grip'],
          cue: 'One bell, one side. Walk so straight that nobody could tell which hand is loaded.',
          swap: 'Heavier bell, shorter walk' }
      ]
    },
    {
      id: 'c', tab: 'Day C', focus: 'Full Body',
      note: 'Everything at once — the day that makes kettlebells worth it.',
      exercises: [
        { slug: 'clean-press', name: 'Clean & Press', sets: 3, reps: '5–8', rest: '2 min', side: true,
          primary: ['Shoulders'], secondary: ['Glutes', 'Triceps'],
          cue: 'Clean smooth into the rack — no forearm slap — brace, then press. One clean per press.',
          swap: 'Learning? Split it: all cleans, then all presses' },
        { slug: 'front-squat', name: 'Rack Front Squat', sets: 3, reps: '8–12', rest: '90 s', side: false,
          primary: ['Quads'], secondary: ['Glutes', 'Core'],
          cue: 'Bell racked at the chest, elbow tucked. The offset load will try to twist you — don’t let it.',
          swap: 'Double rack squat with two bells' },
        { slug: 'pushup', name: 'Push-Up on Handles', sets: 3, reps: 'max, cap 15', rest: '90 s', side: false,
          primary: ['Chest'], secondary: ['Triceps', 'Core'],
          cue: 'Hands on two bell handles, chest sinks below the hands for a deeper stretch than the floor allows.',
          swap: 'One bell? Regular floor push-ups' },
        { slug: 'sl-rdl', name: 'Single-Leg RDL', sets: 3, reps: '8–10', rest: '90 s', side: true,
          primary: ['Hamstrings'], secondary: ['Glutes'],
          cue: 'Bell in the hand opposite the standing leg. Hips square, soft knee, long spine, feel the hamstring load.',
          swap: 'Kickstand stance while balance catches up' },
        { slug: 'renegade-row', name: 'Renegade Row', sets: 2, reps: '8', rest: '90 s', side: true,
          primary: ['Back'], secondary: ['Core', 'Biceps'],
          cue: 'Plank on the bells, feet wide. Row without letting the hips rotate — the plank is the exercise.',
          swap: 'Plank pull-through is the easier version' },
        { slug: 'rack-carry', name: 'Rack Carry', sets: 2, reps: '40 s', rest: '60 s', side: false,
          primary: ['Core'], secondary: ['Back'],
          cue: 'Bell racked at the chest, ribs down, breathe behind the brace while you walk.',
          swap: 'Double rack march in place' }
      ]
    }
  ];
  var GROUPS = ['Quads', 'Glutes', 'Hamstrings', 'Back', 'Chest', 'Shoulders', 'Triceps', 'Biceps', 'Core', 'Grip'];

  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { window.localStorage.removeItem(k); } catch (e) {} }

  /* Interface state and controls. Existing Bellworks weights/checks are retained. */
  var $ = function(id) { return document.getElementById(id); };
  var ICONS = {
    bell: '<path d="M8 9V6a4 4 0 0 1 8 0v3M7 9h10c3 3 4 5 4 8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5c0-3 1-5 4-8Z"/><path d="M10 6a2 2 0 0 1 4 0v3h-4Z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    dumbbell: '<path d="m7 7 10 10M4 10l6-6M14 20l6-6M2 8l6-6M16 22l6-6"/>',
    chart: '<path d="M4 3v17h17M8 15l4-5 4 2 5-7"/>',
    book: '<path d="M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v15"/>',
    user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
    play: '<path d="m9 5 10 7-10 7V5Z" fill="currentColor" stroke-width="0"/>',
    pause: '<path d="M8 5v14M16 5v14" stroke-width="2.8"/>',
    moon: '<path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
    'arrow-right': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    'arrow-left': '<path d="M20 12H4m6-6-6 6 6 6"/>',
    'arrow-up-right': '<path d="M6 18 18 6M6 6h12v12"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2M8 17h2"/>',
    layers: '<path d="m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    'shield-check': '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
    sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM21 2v4M19 4h4"/>',
    expand: '<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>',
    check: '<path d="m5 12 4.5 4.5L19 7"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    x: '<path d="m6 6 12 12M6 18 18 6"/>',
    rotate: '<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>'
  };
  function icon(name) { return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.bell) + '</svg>'; }
  function hydrateIcons(root) { (root || document).querySelectorAll('[data-icon]').forEach(function(el) { el.innerHTML = icon(el.dataset.icon); }); }
  var currentDay = DAYS.find(function(d) { return d.id === lsGet('bw.tab'); }) || DAYS[0];
  var selectedExercise = currentDay.exercises[0], activeView = 'training', mapView = 'front';
  var studioVideo = window.BellworksVideo.create($('studio-video'), icon);
  var workoutVideo = window.BellworksVideo.create($('workout-video'), icon);
  var dialog = $('workout-dialog'), workoutDay = currentDay, workoutIndex = 0;
  var PATTERNS = {'goblet-squat':'Squat','oh-press':'Press','floor-press':'Press','rev-lunge':'Lunge','tri-ext':'Isolation','farmer-carry':'Carry','kb-deadlift':'Hinge','gorilla-row':'Pull','swing':'Hinge','pullover':'Pull','curl':'Isolation','suitcase-carry':'Carry','clean-press':'Power','front-squat':'Squat','pushup':'Press','sl-rdl':'Hinge','renegade-row':'Pull','rack-carry':'Carry'};
  function pattern(x) { return PATTERNS[x.slug]; }
  function setKey(day, x) { return 'bw.sets.' + day.id + '.' + x.slug; }
  function doneKey(day, x) { return 'bw.done.' + day.id + '.' + x.slug; }
  function weightKey(day, x) { return 'bw.wt.' + day.id + '.' + x.slug; }
  function getSets(day, x) {
    try { var saved = JSON.parse(lsGet(setKey(day, x))); if (Array.isArray(saved) && saved.length === x.sets) return saved.map(function(s) { return s === true; }); } catch(e) {}
    return Array(x.sets).fill(lsGet(doneKey(day, x)) === '1');
  }
  function countSets(day, x) { return getSets(day, x).filter(Boolean).length; }
  function isComplete(day, x) { return countSets(day, x) === x.sets; }
  function saveSets(day, x, values) {
    lsSet(setKey(day, x), JSON.stringify(values));
    if (values.every(Boolean)) lsSet(doneKey(day, x), '1'); else lsDel(doneKey(day, x));
    updateProgress();
  }
  function weight(day, x) { var n = Number(lsGet(weightKey(day, x))); return Number.isFinite(n) && n > 0 && n <= 999 ? n : ''; }
  function updateProgress() {
    var totalSets = 0, totalComplete = 0, plannedSets = 0;
    DAYS.forEach(function(day) { day.exercises.forEach(function(x) { totalSets += countSets(day, x); totalComplete += Number(isComplete(day, x)); plannedSets += x.sets; }); });
    $('momentum-sets').textContent = totalSets;
    $('momentum-complete').textContent = totalComplete + ' of 18';
    $('momentum-ring').style.setProperty('--progress', (totalSets / plannedSets * 100) + '%');
    $('momentum-ring').setAttribute('aria-valuenow', totalSets);
    $('momentum-ring').setAttribute('aria-valuemax', plannedSets);
    var done = currentDay.exercises.filter(function(x) { return isComplete(currentDay, x); }).length;
    $('session-count').textContent = done + ' / 6 completed';
    $('session-progress-fill').style.width = (done / 6 * 100) + '%';
    document.querySelector('.session-progress').setAttribute('aria-valuenow', done);
    var started = currentDay.exercises.some(function(x) { return countSets(currentDay, x) > 0; });
    $('start-label').textContent = (done === 6 ? 'Review ' : started ? 'Continue ' : 'Start ') + currentDay.tab;
    document.querySelectorAll('.exercise-card').forEach(function(card) {
      var x = currentDay.exercises.find(function(item) { return item.slug === card.dataset.slug; });
      if (!x) return;
      var complete = isComplete(currentDay, x), n = countSets(currentDay, x);
      card.classList.toggle('complete', complete);
      var button = card.querySelector('.completion-button');
      button.setAttribute('aria-pressed', String(complete));
      button.setAttribute('aria-label', (complete ? 'Mark incomplete: ' : 'Complete all sets: ') + x.name);
      card.querySelector('.card-set-count').textContent = n + '/' + x.sets;
      var w = weight(currentDay, x); card.querySelector('.card-weight').textContent = w ? w + ' kg' : x.primary.join(' · ');
    });
    DAYS.forEach(function(d) { var tab = $('day-' + d.id); if (tab) tab.setAttribute('aria-label', d.tab + ', ' + d.focus + ', ' + d.exercises.filter(function(x) { return isComplete(d, x); }).length + ' of 6 exercises complete'); });
    if (activeView === 'progress') renderProgress();
  }
  function renderTabs() {
    $('day-tabs').innerHTML = DAYS.map(function(d, i) {
      return '<button class="day-tab" id="day-' + d.id + '" role="tab" aria-controls="exercise-list" aria-selected="' + (d.id === currentDay.id) + '" tabindex="' + (d.id === currentDay.id ? '0' : '-1') + '"><strong>' + d.tab + '</strong><small>' + ['MON','WED','FRI'][i] + '</small><span>' + d.focus + '</span></button>';
    }).join('');
    DAYS.forEach(function(d) { $('day-' + d.id).addEventListener('click', function() { selectDay(d.id); }); });
  }
  $('day-tabs').addEventListener('keydown', function(e) {
    var i = DAYS.indexOf(currentDay), next;
    if (e.key === 'ArrowRight') next = (i+1)%3;
    else if (e.key === 'ArrowLeft') next = (i+2)%3;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = 2;
    if (next === undefined) return;
    e.preventDefault(); selectDay(DAYS[next].id); $('day-' + currentDay.id).focus();
  });
  function renderExercises() {
    var list = $('exercise-list');
    list.setAttribute('aria-labelledby', 'day-' + currentDay.id);
    list.innerHTML = currentDay.exercises.map(function(x, i) {
      return '<article class="exercise-card" data-slug="' + x.slug + '" style="--i:' + i + '"><div class="exercise-thumb">' + thumbnail(x) + '<span class="thumb-play">' + icon('play') + '</span><span class="exercise-number">' + String(i+1).padStart(2,'0') + '</span></div><div class="exercise-info"><span class="pill">' + pattern(x) + '</span><h4><button class="exercise-select" aria-label="View ' + x.name + '">' + x.name + '</button></h4><div class="exercise-meta"><span>' + x.sets + ' sets × ' + x.reps + '</span><i></i><span>' + x.rest + ' rest</span>' + (x.side ? '<i></i><span>Each side</span>' : '') + '</div><p class="exercise-muscles card-weight"></p></div><div class="exercise-actions"><span class="card-set-count"></span><button class="completion-button" aria-pressed="false">' + icon('check') + '</button></div></article>';
    }).join('');
    Array.from(list.children).forEach(function(card, i) {
      var x = currentDay.exercises[i];
      card.querySelector('.exercise-select').addEventListener('click', function() {
        selectExercise(x);
        if (window.matchMedia('(max-width: 760px)').matches) openWorkout(currentDay, i);
        else document.querySelector('.inspector').scrollIntoView({behavior:REDUCED?'instant':'smooth',block:'nearest'});
      });
      card.querySelector('.completion-button').addEventListener('click', function() {
        var day = currentDay, old = getSets(day, x), complete = !old.every(Boolean);
        saveSets(day, x, Array(x.sets).fill(complete));
        showToast(complete ? x.name + ' complete. Nice work.' : x.name + ' reopened.', function() { saveSets(day, x, old); });
      });
    });
    updateProgress();
  }
  function selectDay(id) {
    currentDay = DAYS.find(function(d) { return d.id === id; }) || DAYS[0];
    lsSet('bw.tab', currentDay.id);
    renderTabs();
    $('session-title').textContent = currentDay.focus;
    $('session-description').textContent = {a:'6 movements · 17 working sets · Full-body strength',b:'6 movements · 15 working sets · Posterior chain',c:'6 movements · 16 working sets · Full-body strength'}[currentDay.id];
    document.querySelector('.hero-index').innerHTML = '0' + (DAYS.indexOf(currentDay) + 1) + ' <span>/ 03</span>';
    renderExercises(); selectExercise(currentDay.exercises[0]);
  }
  function selectExercise(x) {
    selectedExercise = x;
    $('studio-title').textContent = x.name; $('studio-cue').textContent = x.cue;
    $('studio-index').textContent = 'EXERCISE ' + String(currentDay.exercises.indexOf(x) + 1).padStart(2,'0') + ' / 06';
    $('studio-pattern').textContent = pattern(x);
    $('studio-specs').innerHTML = '<div><strong>' + x.sets + '</strong><span>Working sets</span></div><div><strong>' + x.reps.replace('max, cap ', '≤ ') + '</strong><span>' + (x.side ? 'Reps / side' : /m|s/.test(x.reps) ? 'Per set' : 'Reps / set') + '</span></div><div><strong>' + x.rest + '</strong><span>Rest between</span></div>';
    studioVideo.select(x);
    document.querySelectorAll('.exercise-card').forEach(function(card) {
      var active = card.dataset.slug === x.slug; card.classList.toggle('selected', active);
      card.querySelector('.exercise-select').setAttribute('aria-pressed', active);
    });
    renderMap();
  }
  function renderMap() {
    $('body-map').innerHTML = bodySVG(mapView); paintBody($('body-map'), 'ex', selectedExercise);
    $('muscle-tags').innerHTML = '<div class="muscle-group"><strong>' + selectedExercise.primary.join(' · ') + '</strong><span>Primary muscles</span></div>' + (selectedExercise.secondary.length ? '<div class="muscle-group"><strong>' + selectedExercise.secondary.join(' · ') + '</strong><span>Assisting muscles</span></div>' : '');
    $('map-front').setAttribute('aria-pressed', mapView === 'front'); $('map-back').setAttribute('aria-pressed', mapView === 'back');
  }
  ['front','back'].forEach(function(view) { $('map-' + view).addEventListener('click', function() { mapView = view; renderMap(); }); });
  function updateTheme() {
    var dark = document.documentElement.dataset.theme === 'dark';
    $('theme-toggle').innerHTML = icon(dark ? 'sun' : 'moon'); $('theme-toggle').setAttribute('aria-label','Switch to ' + (dark ? 'light' : 'dark') + ' theme');
  }
  $('theme-toggle').addEventListener('click', function() { var theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = theme; lsSet('bw.theme', theme); updateTheme(); });
  $('warmup-toggle').addEventListener('click', function() { var open = this.getAttribute('aria-expanded') === 'true'; this.setAttribute('aria-expanded', !open); $('warmup-content').hidden = open; });
  $('reset-session').addEventListener('click', function() {
    var day = currentDay, snapshot = day.exercises.map(function(x) { return getSets(day, x); });
    day.exercises.forEach(function(x) { lsDel(setKey(day,x)); lsDel(doneKey(day,x)); }); updateProgress();
    showToast(day.tab + ' reset. Your weights are kept.', function() { day.exercises.forEach(function(x,i) { saveSets(day, x, snapshot[i]); }); });
  });

  /* Workout mode, set logging, and a clock that remains accurate in background tabs. */
  var restDuration = 90, restRemaining = 90, restDeadline = null, restInterval = null;
  function currentWorkout() { return workoutDay.exercises[workoutIndex]; }
  function openWorkout(day, index) {
    stopVideos();
    workoutDay = day; workoutIndex = index;
    if (!dialog.open) { dialog.showModal(); document.body.style.overflow = 'hidden'; }
    renderWorkout(); $('close-workout').focus({preventScroll: true});
  }
  function renderWorkout() {
    var x = currentWorkout();
    $('workout-title').textContent = x.name; $('workout-cue').textContent = x.cue; $('workout-swap').textContent = x.swap;
    $('workout-position').textContent = 'MOVEMENT ' + String(workoutIndex + 1).padStart(2,'0') + ' / 06';
    $('workout-day').textContent = workoutDay.tab.toUpperCase() + ' · ' + workoutDay.focus.toUpperCase();
    $('workout-prescription').innerHTML = '<span>' + x.sets + ' sets</span><span>' + x.reps + (/m|s/.test(x.reps) ? '' : ' reps') + '</span>' + (x.side ? '<span>Each side</span>' : '');
    $('workout-weight').value = weight(workoutDay, x); $('workout-weight').setCustomValidity('');
    workoutVideo.select(x);
    $('previous-exercise').disabled = workoutIndex === 0;
    $('next-exercise').innerHTML = (workoutIndex === 5 ? 'Finish session' : 'Next exercise') + icon('arrow-right');
    restDuration = x.rest.indexOf('min') >= 0 ? parseFloat(x.rest) * 60 : parseFloat(x.rest);
    resetRest(); renderSets();
    document.querySelector('.workout-body').scrollTop = 0;
  }
  function renderSets() {
    var x = currentWorkout(), sets = getSets(workoutDay, x), count = sets.filter(Boolean).length;
    $('workout-set-count').textContent = count + ' / ' + x.sets + ' completed';
    $('workout-sets').innerHTML = sets.map(function(done,i) { return '<button class="set-button" aria-pressed="' + done + '" aria-label="Set ' + (i+1) + (done ? ', completed; mark incomplete' : ', mark complete') + '">' + (done ? icon('check') : '') + 'Set ' + (i+1) + '</button>'; }).join('');
    Array.from($('workout-sets').children).forEach(function(button,i) { button.addEventListener('click', function() { var values = getSets(workoutDay,x); values[i] = !values[i]; saveSets(workoutDay,x,values); renderSets(); $('workout-sets').children[i].focus(); }); });
    var first = sets.indexOf(false);
    $('log-set').innerHTML = (first === -1 ? icon('arrow-right') + (workoutIndex === 5 ? ' Finish session' : ' Next movement') : icon('check') + ' Complete set ' + (first + 1));
  }
  $('workout-set-count').setAttribute('aria-live', 'polite');
  $('log-set').addEventListener('click', function() {
    if (!saveWorkoutWeight()) return;
    var x = currentWorkout(), values = getSets(workoutDay,x), index = values.indexOf(false);
    if (index < 0) { advanceWorkout(); return; }
    values[index] = true; saveSets(workoutDay,x,values); renderSets(); resetRest(); startRest();
  });
  function saveWorkoutWeight() {
    var input = $('workout-weight'); input.setCustomValidity('');
    if (!input.checkValidity()) { input.reportValidity(); return false; }
    if (input.value === '' || Number(input.value) === 0) lsDel(weightKey(workoutDay,currentWorkout()));
    else lsSet(weightKey(workoutDay,currentWorkout()), input.value);
    updateProgress(); return true;
  }
  $('workout-weight').addEventListener('change', saveWorkoutWeight);
  function advanceWorkout() {
    if (!saveWorkoutWeight()) return;
    if (workoutIndex < 5) { workoutIndex++; renderWorkout(); }
    else {
      var complete = workoutDay.exercises.filter(function(x) { return isComplete(workoutDay,x); }).length;
      dialog.close(); showToast(complete === 6 ? 'Session complete. A little stronger today.' : complete + ' of 6 movements complete. Your progress is saved.');
    }
  }
  $('next-exercise').addEventListener('click', advanceWorkout);
  $('previous-exercise').addEventListener('click', function() { if (!saveWorkoutWeight()) return; if (workoutIndex > 0) { workoutIndex--; renderWorkout(); } });
  $('start-workout').addEventListener('click', function() { var index = currentDay.exercises.findIndex(function(x) { return !isComplete(currentDay,x); }); openWorkout(currentDay,index < 0 ? 0 : index); });
  $('open-exercise').addEventListener('click', function() { openWorkout(currentDay,currentDay.exercises.indexOf(selectedExercise)); });
  $('close-workout').addEventListener('click', function() { dialog.close(); });
  dialog.addEventListener('close', function() { document.body.style.overflow = ''; workoutVideo.stop(); pauseRest(); updateProgress(); });
  dialog.addEventListener('click', function(e) { if (e.target === dialog) { var r = dialog.getBoundingClientRect(); if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  function formatTime(s) { s = Math.ceil(Math.max(0,s)); return Math.floor(s/60) + ':' + String(s%60).padStart(2,'0'); }
  function paintRest() {
    $('rest-display').textContent = restRemaining <= 0 ? 'Ready' : formatTime(restRemaining);
    $('rest-fill').style.width = (Math.max(0, restRemaining)/restDuration*100) + '%';
    $('rest-start').innerHTML = icon(restDeadline ? 'pause' : 'play');
    $('rest-start').setAttribute('aria-label', restDeadline ? 'Pause rest timer' : 'Start rest timer');
  }
  function tickRest() {
    if (!restDeadline) return;
    restRemaining = Math.max(0,(restDeadline-Date.now())/1000);
    if (restRemaining <= 0) { pauseRest(); $('workout-set-count').textContent = 'Rest complete. Ready for your next set.'; }
    paintRest();
  }
  function startRest() { if (restRemaining <= 0) restRemaining = restDuration; restDeadline = Date.now() + restRemaining*1000; clearInterval(restInterval); restInterval = setInterval(tickRest,100); paintRest(); }
  function pauseRest() { if (restDeadline) restRemaining = Math.max(0,(restDeadline-Date.now())/1000); restDeadline = null; clearInterval(restInterval); restInterval = null; paintRest(); }
  function resetRest() { pauseRest(); restRemaining = restDuration; paintRest(); }
  $('rest-start').addEventListener('click', function() { if(restDeadline) pauseRest(); else startRest(); });
  $('rest-reset').addEventListener('click',resetRest);
  $('rest-skip').addEventListener('click',function() { pauseRest(); restRemaining = 0; paintRest(); });
  document.addEventListener('visibilitychange', function() { if (!document.hidden) tickRest(); else stopVideos(); });

  /* Searchable library and progress derived from the actual device log. */
  var libraryBuilt = false;
  GROUPS.forEach(function(g) { var option = document.createElement('option'); option.value = g; option.textContent = g; $('muscle-filter').appendChild(option); });
  function renderLibrary() {
    libraryBuilt = true;
    var query = $('exercise-search').value.trim().toLowerCase(), muscle = $('muscle-filter').value;
    var results = [];
    DAYS.forEach(function(day) { day.exercises.forEach(function(x,i) { var text = [x.name,pattern(x)].concat(x.primary,x.secondary).join(' ').toLowerCase(); if ((!query || text.includes(query)) && (muscle === 'all' || x.primary.concat(x.secondary).includes(muscle))) results.push({day:day,x:x,i:i}); }); });
    var grid = $('library-grid');
    grid.innerHTML = results.map(function(r) {
      var x = r.x;
      return '<article class="library-card"><div class="library-visual">' + thumbnail(x) + '<span class="library-play">' + icon('play') + '</span><span class="pill">' + pattern(x) + '</span></div><div class="library-card-info"><h3><button class="library-open">' + x.name + '</button></h3><p>' + x.primary.concat(x.secondary).join(' · ') + '</p><div class="library-card-bottom"><span>' + r.day.tab + ' · ' + x.sets + ' sets × ' + x.reps + '</span>' + icon('arrow-up-right') + '</div></div></article>';
    }).join('');
    Array.from(grid.children).forEach(function(card,i) {
      var r = results[i];
      card.querySelector('button').addEventListener('click',function() { openWorkout(r.day,r.i); });

    });
    $('library-count').textContent = results.length + (results.length === 1 ? ' movement' : ' movements'); $('library-empty').hidden = results.length > 0;
  }
  $('exercise-search').addEventListener('input',renderLibrary); $('muscle-filter').addEventListener('change',renderLibrary);
  $('clear-search').addEventListener('click',function() { $('exercise-search').value = ''; $('muscle-filter').value = 'all'; renderLibrary(); $('exercise-search').focus(); });
  function renderProgress() {
    var sets = 0, completed = 0, weights = 0;
    DAYS.forEach(function(d) { d.exercises.forEach(function(x) { sets += countSets(d,x); completed += Number(isComplete(d,x)); weights += Number(weight(d,x) !== ''); }); });
    $('progress-stats').innerHTML = [['Working sets logged',sets,'Across your three sessions'],['Movements completed',completed + ' / 18','Every set makes a difference'],['Weights recorded',weights,'Your starting points, remembered']].map(function(s) { return '<div class="progress-stat"><span>' + s[0] + '</span><strong>' + s[1] + '</strong><small>' + s[2] + '</small></div>'; }).join('');
    $('training-log').innerHTML = DAYS.map(function(day) {
      var done = day.exercises.filter(function(x) { return isComplete(day,x); }).length, n = day.exercises.reduce(function(sum,x) { return sum + countSets(day,x); },0);
      return '<div class="log-row"><span class="log-day">' + day.id.toUpperCase() + '</span><div><h3>' + day.focus + '</h3><p>' + n + ' sets logged · ' + done + ' movements complete</p></div><strong>' + done + '/6</strong></div>' + day.exercises.filter(function(x) { return weight(day,x); }).map(function(x) { return '<div class="weight-log"><span>' + x.name + '</span><b>' + weight(day,x) + ' kg</b></div>'; }).join('');
    }).join('') + (sets === 0 && weights === 0 ? '<p class="log-empty">Your first set is the starting line. Log a workout to see your progress here.</p>' : '');
    var volume = {}; GROUPS.forEach(function(g) { volume[g] = 0; });
    DAYS.forEach(function(day) { day.exercises.forEach(function(x) { x.primary.forEach(function(g) { volume[g] += x.sets; }); x.secondary.forEach(function(g) { volume[g] += x.sets*.5; }); }); });
    var max = Math.max.apply(null,Object.values(volume));
    $('volume-chart').innerHTML = GROUPS.slice().sort(function(a,b) { return volume[b]-volume[a]; }).map(function(g) { return '<div class="volume-row"><span>' + g + '</span><span class="volume-track"><span style="width:' + volume[g]/max*100 + '%"></span></span><strong>' + volume[g] + '</strong></div>'; }).join('');
  }
  function navigate() {
    var view = location.hash.slice(1); if (!['training','exercises','progress','guide'].includes(view)) view = 'training';
    if (view !== activeView) stopVideos();
    activeView = view;
    document.querySelectorAll('.page-view').forEach(function(el) { var active = el.id === 'view-' + view; el.hidden = !active; el.classList.toggle('active',active); });
    document.querySelectorAll('[data-nav]').forEach(function(el) { var on = el.dataset.nav === view; el.classList.toggle('active',on); if (on) el.setAttribute('aria-current','page'); else el.removeAttribute('aria-current'); });
    $('page-label').textContent = {training:'My program',exercises:'Exercise library',progress:'My progress',guide:'Training guide'}[view];
    if (view === 'exercises' && !libraryBuilt) renderLibrary();
    if (view === 'progress') renderProgress();
    window.scrollTo({top:0,behavior:'instant'});
  }
  window.addEventListener('hashchange',function() { navigate(); $('main').focus({preventScroll:true}); });
  window.addEventListener('storage',function(e) { if (e.key && e.key.startsWith('bw.')) { updateProgress(); if (dialog.open) renderSets(); } });
  var toastTimer, undoAction;
  function showToast(message, undo) {
    clearTimeout(toastTimer); $('toast-message').textContent = message; undoAction = undo || null; $('toast-undo').hidden = !undoAction;
    $('toast').classList.add('show'); toastTimer = setTimeout(function() { $('toast').classList.remove('show'); undoAction = null; }, undo ? 9000 : 4000);
  }
  $('toast-undo').addEventListener('click',function() { if(undoAction) undoAction(); showToast('Restored. Back where you left off.'); });
  $('today').textContent = new Intl.DateTimeFormat('en',{weekday:'short',month:'short',day:'numeric'}).format(new Date());
  hydrateIcons(); updateTheme(); selectDay(currentDay.id); navigate(); paintRest();
})();
