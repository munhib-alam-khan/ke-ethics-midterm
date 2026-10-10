// 22 scenes · 37 states. Script, notes and sources come from js/content.js
// (unchanged from v1/v2). Each state: cam {p, t, fov, roll}, optional via/tvia
// path points, p (param targets), pt (param timing as fractions of dur),
// dur (s), and the scene's ui HTML with data-in / data-out / data-a / data-d.
const C = window.CONTENT;

const chap = (n, name) => `<div class="chap" data-in="0" data-a="fade"><b>${n}</b><i></i>${name}</div>`;
const illus = (t, pos = 'right:28px;top:24px', inn = 0) => `<div class="illus" data-in="${inn}" data-a="fade" style="${pos}">${t}</div>`;
const pin = (anchor, label, { cls = '', inn = 0, out, d = 0, small = '', ox = 0, oy = 0 } = {}) =>
  `<div class="pin ${cls}" data-anchor="${anchor}" data-in="${inn}"${out !== undefined ? ` data-out="${out}"` : ''} data-a="fade" data-d="${d}" data-ox="${ox}" data-oy="${oy}"><span class="lab">${label}${small ? `<small>${small}</small>` : ''}</span></div>`;

// shared poses
const BILL_CLOSE = { p: [-0.32, 5.0, -2.45], t: [0.22, 4.3, -0.9], fov: 42, roll: -1 };
const ROOM_BACK = { p: [0.85, 5.55, -3.9], t: [0.05, 4.95, -0.4], fov: 52, roll: 0.6 };
const STREET_WIDE = { p: [-3, 21, 44], t: [-3, 6.4, 0], fov: 50 };
const LIGHTS_OFF = { lamp: 0, tube: 0, leds: 0, cook: 0, fan: 0, moonIn: 1, power: 0 };

export const SCENES = [];
const S = (o) => { const base = C[o.id]; SCENES.push(Object.assign({ chapter: base.chapter, title: base.title, script: base.script, notes: base.notes, sources: base.sources }, o)); };

/* ------------------------------------------------------------------ 1 · the household */
S({
  id: 's01', set: 'street', enter: 'fade',
  cues: ['Lamp-lit room at night. Close on the paid bill; the fan turns, the router blinks, a pot is on.',
    'ADVANCE → the bill lifts toward us; router lights die, the lamp stutters out, the tube light and stove cut, the fan winds down. Through the window the whole street goes dark with us.'],
  p: { lamp: 1, tube: 1, leds: 1, cook: 1, fan: 1, power: 1, others: 1, exposure: 1.05, warm: 0.3 },
  ui: `
    <div class="scrim soft-l" data-in="0" data-a="fade"></div>
    <div class="abs" style="left:96px;top:560px;width:820px" data-in="0" data-out="1" data-a="words" data-d="0.6"><h1 class="h1 shadow-t">You pay your electricity bill.</h1></div>
    <p class="abs body shadow-t" style="left:96px;top:790px;font-size:50px" data-in="0" data-out="1" data-a="up" data-d="2.0">On time. <span class="amber">Every month.</span></p>
    <div class="abs" style="left:96px;top:700px;width:900px" data-in="1" data-a="blur" data-d="2.1"><h1 class="h1 shadow-t" style="font-size:112px">Then the lights go out.</h1></div>
    ${pin('router', 'Router', { cls: 'off', inn: 1, d: 1.0, small: 'offline' })}
    ${pin('fan', 'Fan', { cls: 'off', inn: 1, d: 2.2, small: 'winding down', oy: -10 })}
    ${pin('stove', 'Cooking', { cls: 'off', inn: 1, d: 1.5, small: 'stopped' })}
    ${illus('Illustrative household — not an interview participant')}`,
  states: [
    { cam: BILL_CLOSE, dur: 2.4, sway: 1 },
    { cam: ROOM_BACK, dur: 3.6, ease: 'power2.inOut',
      p: Object.assign({}, LIGHTS_OFF, { billLift: 1, warm: 0, exposure: 1.2 }),
      pt: { billLift: { d: 0, t: 0.55, e: 'power2.inOut' }, leds: { d: 0.22, t: 0.04 }, lamp: { d: 0.32, t: 0.18, keys: [0.25, 1, 0.08, 0.7, 0.02] }, tube: { d: 0.36, t: 0.12, keys: [0.4, 1, 0.1] }, cook: { d: 0.3, t: 0.3 }, fan: { d: 0.3, t: 0.65, e: 'power2.out' }, power: { d: 0.42, t: 0.08, keys: [0.4, 0.9] }, moonIn: { d: 0.5, t: 0.45 }, exposure: { d: 0.5, t: 0.4 }, warm: { d: 0.4, t: 0.3 } } }
  ]
});

/* ------------------------------------------------------------------ 2 · shared darkness */
const houseTags = (() => {
  // our house first (i 0), neighbours 1–9; one unpaid (2) and one hooked line (8)
  const out = [];
  for (let i = 0; i <= 9; i++) {
    const kind = i === 2 ? 'amber' : i === 8 ? 'rust' : '';
    const label = i === 0 ? 'You · paid' : i === 2 ? 'Unpaid' : i === 8 ? 'Hooked line' : 'Paid';
    out.push(pin('h' + i, label, { cls: kind || (i === 0 ? 'teal' : ''), inn: 0, out: 1, d: 3.2 + (i % 5) * 0.12 + (i > 4 ? 0.06 : 0) }));
  }
  return out.join('');
})();
S({
  id: 's02', set: 'street',
  cues: ['The camera lifts over the bill and flies out through the open window, turns, and finds the whole feeder dark; illustrative tags land on ten houses (8 paying, 2 defaulting).',
    'ADVANCE → close on the transformer; a pulse runs down the line into every house — paying or not.',
    'ADVANCE → tags clear; the camera cranes up past the roofs into the night sky; the case question lands.'],
  p: Object.assign({}, LIGHTS_OFF, { billLift: 1, exposure: 1.25, others: 1 }),
  ui: `
    <div class="scrim soft-t" data-in="0" data-a="fade" data-d="2.6"></div>
    <div class="abs" style="left:96px;top:60px;width:1450px" data-in="0" data-out="1" data-a="words" data-d="3.2" data-st="0.03"><p class="body shadow-t" style="font-size:42px">Your neighbour may have an unpaid bill. Someone further down the street may be stealing electricity.</p></div>
    <p class="abs body shadow-t amber" style="left:96px;top:180px;font-size:46px" data-in="0" data-out="1" data-a="left" data-d="4.6">You have done neither.</p>
    <div class="abs" style="left:96px;top:70px;width:1500px" data-in="1" data-out="2" data-a="blur" data-d="0.9"><h1 class="h1 shadow-t">But you share the darkness.</h1></div>
    ${houseTags}
    ${pin('transformer', 'One feeder', { cls: 'ghost nostem', inn: 1, out: 2, d: 1.4, oy: -60 })}
    <div class="abs cite" style="left:96px;bottom:34px;width:1600px;color:var(--cream)" data-in="0" data-out="2" data-a="fade" data-d="4.8">ILLUSTRATIVE EXAMPLE: 8 paying households, 2 defaulting (one unpaid bill, one illegal hook). Not measured data from our interviews.</div>
    <div class="scrim centre" data-in="2" data-a="fade" data-d="0.8"></div>
    <div class="abs" style="left:150px;top:250px;width:1620px;text-align:center" data-in="2" data-a="up" data-d="1.4">
      <div class="mega shadow-t" style="font-size:132px;white-space:nowrap">Who should bear the cost?</div>
    </div>
    <div class="abs" style="left:260px;top:520px;width:1400px;text-align:center" data-in="2" data-a="words" data-d="2.2" data-st="0.025">
      <p class="body shadow-t" style="font-size:40px">When a company faces a collective financial problem, how much of the burden can it fairly place on an individual customer who has fulfilled their responsibility?</p>
    </div>`,
  states: [
    { cam: STREET_WIDE, dur: 6.2, ease: 'power1.inOut',
      via: [[0.4, 5.25, -1.9], [0.05, 5.15, -0.3], [0, 5.4, 2.6], [0.6, 8.5, 10.5], [-2, 16, 24]],
      tvia: [[-0.1, 5.0, 1.5], [0, 5.2, 8], [0, 5.8, 20], [-2, 6.5, 12], [-3, 6.5, 4]] },
    { cam: { p: [-4.6, 7.4, 10.8], t: [-10.2, 7.6, 2.3], fov: 44, roll: -2 }, dur: 3.2,
      p: { wireGlow: 1, wirePulse: 1.2 }, pt: { wireGlow: { d: 0.25, t: 0.2 }, wirePulse: { d: 0.4, t: 0.6, e: 'power1.in' } } },
    { cam: { p: [-3, 24, 17], t: [-3, 40, -60], fov: 55 }, dur: 3.6, ease: 'power2.inOut',
      via: [[-5, 14, 18]], p: { wireGlow: 0, wirePulse: 1.2 }, pt: { wireGlow: { d: 0, t: 0.4 } } }
  ]
});

/* ------------------------------------------------------------------ 3 · the public confrontation */
S({
  id: 's03', set: 'chamber', enter: 'whip',
  cues: ['Whip into an illustrative committee room. From high above, the camera settles behind the witness table: the centre chair is empty under a cold light; the representatives stand, then walk out through the lit door. The triad lands on the right.'],
  ui: `
    <div class="scrim soft-r" data-in="0" data-a="fade"></div>
    ${chap('02', 'The controversy')}
    <div class="abs" style="left:1130px;top:120px;width:700px" data-in="0" data-a="up" data-d="0.2"><p class="kicker">Sindh Assembly committee · September 2026</p></div>
    <div class="abs triad" style="left:1130px;top:190px;width:700px">
      <div class="row" data-in="0" data-a="left" data-d="0.8"><div class="who">The CEO</div><div class="what">Summoned. Absent.</div></div>
      <div class="row" data-in="0" data-a="left" data-d="1.6"><div class="who">Representatives, led by the distribution head</div><div class="what">Attended.</div></div>
      <div class="row" data-in="0" data-a="left" data-d="2.6"><div class="who">The committee</div><div class="what amber">Asked them to leave.</div></div>
    </div>
    <p class="abs body sm" style="left:1130px;top:700px;width:700px" data-in="0" data-a="up" data-d="3.6"><b>The CEO was not expelled.</b> Why he did not attend is not established — by the reporting or by our interviews.</p>
    ${pin('ceoChair', 'Empty chair', { cls: 'ghost', inn: 0, d: 1.2, small: 'the CEO did not attend' })}
    <p class="abs cite" style="left:96px;bottom:26px;width:1700px" data-in="0" data-a="fade" data-d="4.2">Our summary of published reporting — not a reproduction of the article: Khan, A. (2026, September 24). NEPRA and K-Electric representatives grilled over power outages. <i>Business Recorder</i>. Sept 24 is the publication date.</p>
    ${illus('Illustrative room · faceless figures — not images of the meeting')}`,
  states: [
    { cam: { p: [-3.3, 2.5, 9.4], t: [2.4, 1.2, 4.4], fov: 46, roll: 0 }, from: { p: [-2, 16, 18], t: [2, 0, 2], fov: 50 }, dur: 5.4, arriveEase: 'power2.inOut',
      p: { chEmpty: 1, chKey: 1, chDoor: 1, chLeave: 1 }, pt: { chEmpty: { d: 0.2, t: 0.25 }, chDoor: { d: 0.35, t: 0.2 }, chLeave: { d: 0.45, t: 0.55, e: 'none' } } }
  ]
});

/* ------------------------------------------------------------------ 4 · beyond the headline */
S({
  id: 's04', set: 'desk', enter: 'whip',
  cues: ['Noir evidence desk under blinds light. Three source documents fly in and land on the blotter (illustrative covers).',
    'ADVANCE → four interview cards slide in below; a red string runs between sources and accounts; the camera leans closer.'],
  ui: `
    <div class="scrim soft-t" data-in="0" data-a="fade"></div>
    ${chap('03', 'The investigation')}
    <div class="abs" style="left:96px;top:110px;width:1300px" data-in="0" data-out="1" data-a="words" data-d="0.3" data-st="0.03"><h2 class="h2 shadow-t">But a confrontation alone cannot tell us whether a company acted ethically.</h2></div>
    <div class="abs" style="left:96px;top:110px;width:900px" data-in="1" data-a="up" data-d="0.4"><h2 class="h2 shadow-t"><span class="amber">2 residents</span> + 2 employees</h2></div>
    <div class="abs panel" style="left:1180px;top:640px;width:680px" data-in="1" data-a="up" data-d="1.4">
      <ul class="rule-list" style="font-size:28px">
        <li style="font-size:28px"><span class="k">Consent</span>Obtained before each interview.</li>
        <li style="font-size:28px"><span class="k">Confidentiality</span>Both employees are anonymised.</li>
        <li style="font-size:28px"><span class="k">Sample</span>Small and access-based — situated perspectives, not a survey.</li>
      </ul>
    </div>
    <p class="abs body shadow-t" style="left:96px;bottom:60px;width:1000px;font-size:46px" data-in="1" data-a="blur" data-d="2.6"><i>And the picture became more complicated.</i></p>
    ${illus('Illustrative covers and cards — not the documents', 'right:28px;bottom:24px')}`,
  states: [
    { cam: { p: [0.2, 3.7, 2.7], t: [0.05, 0.9, -0.05], fov: 44 }, from: { p: [2.5, 4.5, 4], t: [0, 0.9, 0], fov: 50 }, dur: 3.2,
      p: { dkDocs: 1 }, pt: { dkDocs: { d: 0.15, t: 0.75, e: 'power2.out' } } },
    { cam: { p: [-0.6, 2.75, 2.85], t: [-0.25, 0.9, 0.3], fov: 46, roll: -1.5 }, dur: 3.0,
      p: { dkDocs: 1, dkCards: 1, dkString: 1 }, pt: { dkCards: { d: 0.05, t: 0.6, e: 'power2.out' }, dkString: { d: 0.55, t: 0.4, e: 'power1.inOut' } } }
  ]
});

/* ------------------------------------------------------------------ 5 · Imad's household */
S({
  id: 's05', set: 'imad', enter: 'whip',
  cues: ['Cut-away apartment block at night, Gulistan-e-Jauhar (illustrative). The camera drifts into the centre flat: stove, laptop, router, iron. Partway in, the block loses power; only the phone’s outage page stays lit — and it lists nothing.',
    'ADVANCE → closer on the phone; the service responses he described rise as speech bubbles and hang there.'],
  p: { imPower: 0, imPhone: 1 },
  ui: `
    <div class="scrim soft-b" data-in="0" data-a="fade"></div>
    ${chap('04', 'Interviews')}
    <div class="abs" style="left:96px;top:118px;width:1100px" data-in="0" data-out="1" data-a="up" data-d="0.4"><p class="kicker">Imad · residential customer · Gulistan-e-Jauhar · interview, October 3, 2026</p></div>
    <div class="abs" style="left:96px;top:760px;width:1180px" data-in="0" data-out="1" data-a="words" data-d="1.2" data-st="0.035"><h2 class="h2 shadow-t">Overnight outages not announced on the app he checked</h2></div>
    <p class="abs body sm shadow-t" style="left:96px;top:936px;width:1300px" data-in="0" data-out="1" data-a="up" data-d="2.4">Reported: he generally pays on time. Electricity supports cooking — and his brother’s remote work.</p>
    ${pin('imadStove', 'Electric cooking', { inn: 0, out: 1, d: 1.6, oy: -20 })}
    ${pin('imadLaptop', 'His brother’s remote work', { inn: 0, out: 1, d: 1.9, oy: -70 })}
    ${pin('imadRouter', 'Internet', { cls: 'off low', inn: 0, out: 1, d: 2.2, oy: 40 })}
    ${pin('imadIron', 'Ironing · household routines', { cls: 'ghost low', inn: 0, out: 1, d: 2.5, oy: 50 })}
    <div class="abs" style="left:96px;top:120px;width:620px" data-in="1" data-a="up" data-d="0.6"><p class="kicker">Customer-service responses, as he described them</p></div>
    <div class="abs" style="left:96px;top:800px;width:1000px" data-in="1" data-a="up" data-d="2.2"><p class="body shadow-t">They may acknowledge a complaint.</p><p class="body shadow-t amber">They do very little to help a household plan its evening.</p></div>
    ${illus('Illustrative flat and screen', 'right:28px;top:24px')}`,
  states: [
    { cam: { p: [2.9, 5.35, 5.6], t: [-0.3, 4.3, -2.3], fov: 48 }, from: { p: [9, 9, 24], t: [0, 6, 0], fov: 46 }, dur: 4.4,
      p: { imPower: 0, imPhone: 1 }, pt: { imPower: { d: 0.5, t: 0.14, keys: [0.3, 1, 0.1] }, imPhone: { d: 0.55, t: 0.3 } }, enterP: { imPower: 1, imPhone: 0.2 } },
    { cam: { p: [1.05, 4.7, 0.95], t: [0.45, 4.42, -1.05], fov: 46, roll: 1 }, dur: 3.0, p: { imChat: 1 }, pt: { imChat: { d: 0.25, t: 0.7 } } }
  ]
});

/* ------------------------------------------------------------------ 6 · "tell us the truth" */
S({
  id: 's06', set: 'imad',
  cues: ['The camera floats back out of the dark block until the whole building is one silhouette with a single phone glowing. The quotation arrives word by word; hold.'],
  p: { imPower: 0, imPhone: 1, imChat: 0, exposure: 0.9 },
  ui: `
    <div class="scrim centre" data-in="0" data-a="fade" data-d="0.6"></div>
    <div class="qwrap" style="top:44%">
      <span class="qmark" data-in="0" data-a="fade" data-d="1.0">“</span>
      <p class="quote xl shadow-t" data-in="0" data-a="words" data-d="1.4" data-st="0.12">Agar sirf yeh humse sach hi bol le.</p>
      <p class="trans shadow-t" style="margin-top:28px" data-in="0" data-a="up" data-d="3.0">If they would simply tell us the truth.</p>
      <p class="qsrc" data-in="0" data-a="fade" data-d="3.6">Imad, interview, October 3, 2026 · Roman Urdu; English translation by the research team</p>
    </div>
    <div class="abs panel" style="left:96px;bottom:60px;width:760px" data-in="0" data-a="up" data-d="4.6"><p class="kicker">Analytical finding</p><p class="body sm" style="margin-top:6px"><b>Candour is part of the service.</b> He was asking for information he could trust.</p></div>`,
  states: [
    { cam: { p: [0, 7.2, 30], t: [0, 7.0, 0], fov: 38 }, dur: 5.0, ease: 'power2.inOut', via: [[0.8, 5.2, 8]] }
  ]
});

/* ------------------------------------------------------------------ 7 · the Gulshan resident */
S({
  id: 's07', set: 'roofs', enter: 'whip', fadeCol: 'black',
  cues: ['Dusk over Gulshan rooftops (illustrative): the camera glides low across water tanks. Tags find a UPS and battery, a water pump, a flickering bulb. The ~12 hours figure is participant-reported.',
    'ADVANCE → down to two neighbouring windows as darkness falls: one with a dim backup bulb, one with only a candle.'],
  p: { rfVolt: 1, rfComp: 0, rfSun: 1 },
  ui: `
    <div class="scrim soft-l" data-in="0" data-out="1" data-a="fade"></div>
    <div class="abs" style="left:96px;top:118px;width:900px" data-in="0" data-out="1" data-a="up" data-d="0.3"><p class="kicker">Resident 2 · Gulshan · interview, October 5, 2026</p></div>
    <p class="abs body sm shadow-t" style="left:96px;top:170px;width:760px" data-in="0" data-out="1" data-a="up" data-d="0.6">Reported paying his bills consistently on time.</p>
    <div class="abs" style="left:96px;top:290px" data-in="0" data-out="1" data-a="pop" data-d="1.2"><div class="mega shadow-t" style="font-size:230px">~12 hours</div><p class="h3 shadow-t" style="margin-top:6px">a day</p></div>
    <p class="abs qual" style="left:96px;top:640px;width:760px" data-in="0" data-out="1" data-a="left" data-d="2.0">Participant-reported estimate. His account also described periods of about 4, 8, 10 or 12 hours. Not independently verified.</p>
    ${pin('ups', 'UPS & battery costs', { inn: 0, out: 1, d: 2.4 })}
    ${pin('pump', 'Difficulty pumping water', { inn: 0, out: 1, d: 2.7 })}
    ${pin('bulb', 'Voltage concerns', { cls: 'amber', inn: 0, out: 1, d: 3.0 })}
    <div class="scrim soft-t" data-in="1" data-a="fade"></div>
    <div class="abs" style="left:96px;top:90px;width:1500px" data-in="1" data-a="words" data-d="0.8" data-st="0.04"><h2 class="h2 shadow-t">The same interruption does not fall equally.</h2></div>
    ${pin('withUPS', 'With backup equipment', { inn: 1, d: 1.8, small: 'an inconvenience' })}
    ${pin('withoutUPS', 'Without it', { cls: 'amber', inn: 1, d: 2.3, small: 'much greater hardship' })}
    <div class="abs" style="left:96px;bottom:44px;width:1720px" data-in="1" data-a="up" data-d="3.0"><p class="cite" style="font-size:24px">He asked us to consider households that cannot afford backup — a plausible distributional concern, not a measured finding. His further allegations (billing, collusion, an extra tax) are unsupported in our evidence; we treat them as signs of distrust, not findings.</p></div>
    ${illus('Illustration', 'right:28px;top:24px')}`,
  states: [
    { cam: { p: [-6, 19.5, 25], t: [-2.2, 6.8, 12.5], fov: 48, roll: -1 }, from: { p: [-40, 30, 60], t: [0, 6, 10], fov: 50 }, dur: 5.0 },
    { cam: { p: [0, 5.4, 25.5], t: [0, 5.0, 16], fov: 46 }, dur: 3.6, p: { rfComp: 1, rfSun: 0.15, rfVolt: 0.4 }, pt: { rfComp: { d: 0.4, t: 0.5 }, rfSun: { d: 0, t: 0.8 } } }
  ]
});

/* ------------------------------------------------------------------ 8 · the operational perspective */
S({
  id: 's08', set: 'ops', enter: 'whip',
  cues: ['Calmer: a dark room, a glowing network model (illustrative). The feeders separate into three kinds of interruption — scheduled (amber), fault (red), maintenance (teal). Revenue flows back to the substation; two hooked lines send nothing back.',
    'ADVANCE → the model dims; one paying house stays lit. The quotation holds.'],
  p: { opFlow: 1 },
  ui: `
    <div class="scrim soft-l" data-in="0" data-out="1" data-a="fade"></div>
    <div class="abs" style="left:96px;top:118px;width:820px" data-in="0" data-out="1" data-a="up" data-d="0.3"><p class="kicker teal">Employee 1 · Assistant Manager, Distribution · anonymised</p><p class="cite" style="margin-top:6px">Personal views — not an official KE statement</p></div>
    <div class="abs" style="left:96px;top:250px;width:760px" data-in="0" data-out="1" data-a="words" data-d="0.9" data-st="0.04"><h2 class="h2 shadow-t">Not every interruption is the same problem.</h2></div>
    <p class="abs body sm shadow-t" style="left:96px;top:480px;width:720px" data-in="0" data-out="1" data-a="up" data-d="2.6">Theft and unpaid bills strain a network that needs continuing expenditure. <b>Electricity supplied without recovery is a real sustainability problem.</b></p>
    <p class="abs body sm shadow-t" style="left:96px;top:700px;width:720px;color:var(--teal)" data-in="0" data-out="1" data-a="up" data-d="3.4">That explanation deserves consideration.</p>
    ${pin('opSched', 'Scheduled load-shedding', { cls: 'amber', inn: 0, out: 1, d: 1.2 })}
    ${pin('opFault', 'Technical fault', { cls: 'rust', inn: 0, out: 1, d: 1.7 })}
    ${pin('opMaint', 'Maintenance', { cls: 'teal', inn: 0, out: 1, d: 2.2 })}
    ${pin('opTheft', 'Hooked line', { cls: 'ghost', inn: 0, out: 1, d: 2.9, small: 'no recovery' })}
    <div class="scrim centre" data-in="1" data-a="fade"></div>
    <div class="qwrap" style="top:42%">
      <span class="qmark" data-in="1" data-a="fade" data-d="0.4">“</span>
      <p class="quote shadow-t" data-in="1" data-a="words" data-d="0.8" data-st="0.07">Explaining those challenges does not remove the company’s responsibility.</p>
      <p class="qsrc" data-in="1" data-a="fade" data-d="2.4">Employee 1, interview, October 4, 2026</p>
    </div>
    <p class="abs body sm shadow-t" style="left:260px;right:260px;bottom:70px;text-align:center" data-in="1" data-a="up" data-d="3.2">One described the hardship. The other explained the constraints. <b>Both recognised that the paying customer still has a valid claim.</b></p>
    ${illus('Illustrative network model', 'right:28px;top:24px')}`,
  states: [
    { cam: { p: [3.9, 3.7, 4.4], t: [-0.6, 1.0, 0.78], fov: 44, roll: 1 }, from: { p: [7, 6, 8], t: [0, 1, 0], fov: 50 }, dur: 4.0,
      p: { opKinds: 1, opFlow: 1 }, pt: { opKinds: { d: 0.25, t: 0.7, e: 'none' } } },
    { cam: { p: [0.1, 2.3, 3.6], t: [-0.4, 1.05, -1.25], fov: 40 }, dur: 3.2, p: { opKinds: 1, opDim: 1 }, pt: { opDim: { d: 0, t: 0.6 } } }
  ]
});

/* ------------------------------------------------------------------ 9 · communication and accountability */
S({
  id: 's09', set: 'chamber', enter: 'whip',
  cues: ['Back to the empty chair, now under a cold light only. She did not know why the CEO missed the hearing and refused to speculate: the question mark is left unresolved.',
    'ADVANCE → the camera rises slowly; the quotation lands.'],
  p: { chEmpty: 1, chKey: 0.3, chLeave: 1, chDoor: 0.15 },
  ui: `
    <div class="scrim soft-l" data-in="0" data-out="1" data-a="fade"></div>
    <div class="abs" style="left:96px;top:118px;width:900px" data-in="0" data-out="1" data-a="up" data-d="0.3"><p class="kicker teal">Employee 2 · people, culture &amp; communication · mid-level, 13 years · anonymised</p><p class="cite" style="margin-top:6px">Personal views — not an official company statement</p></div>
    <div class="abs" style="left:96px;top:260px;width:820px" data-in="0" data-out="1" data-a="words" data-d="0.9" data-st="0.04"><h2 class="h2 shadow-t">She did not know why the CEO missed the hearing — and refused to speculate.</h2></div>
    <p class="abs body sm shadow-t" style="left:96px;top:560px;width:780px" data-in="0" data-out="1" data-a="up" data-d="2.4"><b>That restraint matters:</b> we cannot turn an unknown motive into a proven ethical lapse.</p>
    <p class="abs body sm shadow-t" style="left:96px;top:740px;width:780px;color:#e3dccb" data-in="0" data-out="1" data-a="up" data-d="3.2">Delegation can be reasonable — depending on what the summons required, and whether representatives arrived prepared and authorised.</p>
    <div class="abs" style="left:1340px;top:250px" data-in="0" data-out="1" data-a="blur" data-d="1.6"><span style="font-family:var(--serif);font-size:300px;color:rgba(223,232,255,.85);text-shadow:0 0 40px rgba(160,190,255,.5)">?</span></div>
    <div class="scrim centre" data-in="1" data-a="fade"></div>
    <div class="qwrap" style="top:40%">
      <span class="qmark" data-in="1" data-a="fade" data-d="0.4">“</span>
      <p class="quote shadow-t" data-in="1" data-a="words" data-d="0.8" data-st="0.08">Jo masle hal nahi huwe, inhe manna bhi jawabdehi ka hissa hai.</p>
      <p class="trans shadow-t" style="margin-top:24px" data-in="1" data-a="up" data-d="2.4">Acknowledging unresolved problems is also part of accountability.</p>
      <p class="qsrc" data-in="1" data-a="fade" data-d="2.9">Employee 2, interview, October 9, 2026 · English translation by the research team</p>
    </div>
    <div class="abs panel" style="left:420px;right:420px;bottom:56px;text-align:center" data-in="1" data-a="up" data-d="3.6"><p class="body sm"><i>“This issue remains. This is what we know. This is what we will do next.”</i></p><p class="cite" style="margin-top:6px">— our paraphrase of accountable leadership, not an interview quotation</p></div>`,
  states: [
    { cam: { p: [2.4, 1.75, 8.6], t: [0.6, 1.25, 4.9], fov: 38, roll: -1 }, from: { p: [4, 3, 12], t: [0, 1, 4], fov: 44 }, dur: 4.2 },
    { cam: { p: [0, 4.6, 12.5], t: [0, 1.6, 3.5], fov: 40 }, dur: 4.0, p: { chEmpty: 0.7, chKey: 0.2 } }
  ]
});

/* ------------------------------------------------------------------ 10 · where the accounts meet */
S({
  id: 's10', set: 'ops', enter: 'whip',
  cues: ['The network model again: a warm stream (customers) and a teal stream (employees) run in from opposite edges and meet over the table; three points of agreement light in turn.'],
  p: { opKinds: 0.35, opFlow: 0.6, opDim: 0.55, opMeet: 1 },
  ui: `
    <div class="scrim soft-t" data-in="0" data-a="fade"></div>
    <div class="abs" style="left:96px;top:100px;width:1700px;text-align:center" data-in="0" data-a="up" data-d="0.2"><p class="kicker">Where the accounts meet</p></div>
    <div class="abs" style="left:96px;top:160px;width:640px" data-in="0" data-a="left" data-d="0.8"><p class="h3 shadow-t" style="color:#f6c47a">Customers emphasise immediate hardship.</p></div>
    <div class="abs" style="right:96px;top:160px;width:640px;text-align:right" data-in="0" data-a="right" data-d="1.2"><p class="h3 shadow-t" style="color:var(--teal)">Employees emphasise implementation constraints.</p></div>
    <div class="abs panel" style="left:420px;top:600px;width:1080px" data-in="0" data-a="up" data-d="2.6">
      <ol class="nlist">
        <li>Paying customers’ fairness concerns are recognised — by the residents, and by Employee 1.</li>
        <li>Clear outage explanations and complaint follow-up matter — to both sides.</li>
        <li>Accountability requires action after explanation.</li>
      </ol>
    </div>
    <p class="abs cite" style="left:96px;bottom:22px;width:1720px" data-in="0" data-a="fade" data-d="3.8">They also differ: Imad saw the CEO’s absence as reducing trust; Employee 2 refused to infer a motive. Agreement among four access-based interviews is not independent verification of the hearing — and interviewer framing may have shaped some answers.</p>`,
  states: [
    { cam: { p: [0, 3.8, 5.4], t: [0, 1.75, -0.3], fov: 46 }, from: { p: [0, 7, 7], t: [0, 1, 0], fov: 50 }, dur: 4.0,
      pt: { opMeet: { d: 0.2, t: 0.8, e: 'power1.inOut' } }, enterP: { opMeet: 0 } }
  ]
});

/* ------------------------------------------------------------------ 11 · utilitarianism */
S({
  id: 's11', set: 'street', enter: 'whip',
  cues: ['Back in the dark room. The household’s burdens rise from where they sit — battery, laptop, pot, bucket, clock — and hang around the bill. Outside, the transformer stands for the network. Nothing is weighed.',
    'ADVANCE → the camera moves past the objects toward the window and the network beyond; alternatives listed.'],
  p: Object.assign({}, LIGHTS_OFF, { billLift: 0, moonIn: 1.6, exposure: 1.35, uObjs: 1 }),
  ui: `
    <div class="scrim soft-t" data-in="0" data-a="fade"></div>
    ${chap('05', 'Ethical analysis')}
    <div class="abs" style="left:96px;top:110px;width:1500px" data-in="0" data-out="1" data-a="up" data-d="0.3"><h2 class="h2 shadow-t" style="font-size:56px"><span class="amber">Utilitarianism</span> — which response produces the best overall consequences, for everyone affected?</h2></div>
    ${pin('uBatt', 'Backup batteries', { inn: 0, out: 1, d: 1.6 })}
    ${pin('uWork', 'Interrupted work', { inn: 0, out: 1, d: 1.8 })}
    ${pin('uCook', 'Difficulty cooking', { inn: 0, out: 1, d: 2.0 })}
    ${pin('uWater', 'Water pumping', { inn: 0, out: 1, d: 2.2 })}
    ${pin('uTime', 'Time seeking information', { inn: 0, out: 1, d: 2.4 })}
    <div class="abs panel" style="right:60px;bottom:70px;width:900px" data-in="0" data-out="1" data-a="up" data-d="3.0"><p class="body sm">KE has a serious argument: <b>a financially sustainable network benefits the city.</b> But the calculation must include costs borne outside the company.</p><p class="cite" style="margin-top:8px">Nothing here is weighed: no reliable figures exist to quantify these consequences, and we do not invent them.</p></div>
    <div class="abs" style="left:96px;top:110px;width:1200px" data-in="1" data-a="words" data-d="0.8" data-st="0.035"><h2 class="h2 shadow-t">A recovery figure cannot, by itself, show that the overall outcome is good.</h2></div>
    <div class="abs panel" style="left:96px;bottom:50px;width:1000px" data-in="1" data-a="up" data-d="2.2"><p class="kicker">Compare collective outages with</p><ul class="rule-list" style="margin-top:8px"><li style="font-size:30px">targeted enforcement</li><li style="font-size:30px">better metering</li><li style="font-size:30px">network improvements</li></ul><p class="cite" style="margin-top:10px">— using actual costs and service outcomes.</p></div>
    <p class="abs cite" style="right:40px;bottom:22px" data-in="0" data-a="fade" data-d="3.4">Theory: Sinnott-Armstrong (2023), Consequentialism, <i>Stanford Encyclopedia of Philosophy</i></p>
    ${illus('Illustrative household objects', 'right:28px;top:24px')}`,
  states: [
    { cam: { p: [0.35, 5.1, -4.3], t: [0.15, 5.55, -0.9], fov: 54 }, from: { p: [0.6, 6.3, -5.2], t: [0, 5, 0], fov: 56 }, dur: 4.0,
      pt: { uObjs: { d: 0.25, t: 0.75, e: 'power2.out' } }, enterP: { uObjs: 0 } },
    { cam: { p: [0.6, 5.5, -0.6], t: [-3.5, 6.8, 8], fov: 50, roll: 1 }, dur: 3.4 }
  ]
});

/* ------------------------------------------------------------------ 12 · deontology */
S({
  id: 's12', set: 'street',
  cues: ['The objects settle back. A single cold spotlight finds the paid bill: the camera drops low beside it.',
    'ADVANCE → the camera pulls out through the window to the whole dark feeder: one wire, many separate households.'],
  p: Object.assign({}, LIGHTS_OFF, { billLift: 0, moonIn: 1.2, exposure: 1.3, uObjs: 0, billSpot: 1 }),
  ui: `
    <div class="scrim soft-l" data-in="0" data-out="1" data-a="fade"></div>
    <div class="abs" style="left:96px;top:110px;width:820px" data-in="0" data-out="1" data-a="up" data-d="0.4"><h2 class="h2 shadow-t"><span class="teal-t">Deontology</span> — what does a paying customer have a right to expect?</h2></div>
    <div class="abs" style="left:96px;top:520px;width:800px" data-in="0" data-out="1" data-a="words" data-d="1.6" data-st="0.04"><p class="quote shadow-t" style="font-size:58px">If I have paid for my service, what justifies making my access depend on someone else’s conduct?</p></div>
    <div class="scrim soft-t" data-in="1" data-a="fade"></div>
    <div class="abs" style="left:96px;top:90px;width:1600px" data-in="1" data-a="words" data-d="1.4" data-st="0.04"><h2 class="h2 shadow-t">A feeder is a convenient operational unit — <span class="amber">not a unit of individual responsibility.</span></h2></div>
    <div class="abs panel" style="left:96px;bottom:50px;width:1180px" data-in="1" data-a="up" data-d="2.8"><p class="body sm">Using compliant households’ deprivation as leverage against others’ default risks treating them as instruments. Targeting identified theft or default better respects individual responsibility — if procedures are lawful and reliable.</p><p class="cite" style="margin-top:8px">An ethical argument (Alexander &amp; Moore, 2024). We claim no legal right beyond what NEPRA’s direction establishes.</p></div>
    ${pin('h0', 'Paid', { cls: 'teal', inn: 1, d: 2.2 })}`,
  states: [
    { cam: { p: [0.42, 4.52, -1.82], t: [-0.32, 4.22, -1.05], fov: 38, roll: -3 }, dur: 3.0, pt: { uObjs: { d: 0, t: 0.5 }, billSpot: { d: 0.4, t: 0.3 } } },
    { cam: { p: [-3, 12.5, 40], t: [-3, 6.8, 0], fov: 48 }, dur: 5.0, ease: 'power2.inOut',
      via: [[0.2, 4.9, -1.2], [0.05, 5.2, 0.4], [0.5, 6.4, 8], [-1, 9, 24]], tvia: [[-0.2, 4.6, 2], [0, 5.3, 12], [-2, 6.2, 8], [-3, 6.6, 3]],
      p: { wireGlow: 0.55, wirePulse: 0.5, billSpot: 1 }, pt: { wireGlow: { d: 0.6, t: 0.3 } } }
  ]
});

/* ------------------------------------------------------------------ 13 · virtue ethics (room → committee room) */
const s13 = C.s13.script[0];
const cut13 = s13.indexOf('And this standard also applies to the committee.');
S({
  id: 's13', set: 'street', script: [s13.slice(0, cut13).trim(), s13.slice(cut13).trim()],
  cues: ['The camera flies back in through the window to the table: three illustrative papers settle — an honest outage notice, a complaint with an owner, a plan that promises only what it can support.',
    'ADVANCE → cut to the committee room: the witness table empty, the door still lit. The standard applies to the committee too.'],
  p: Object.assign({}, LIGHTS_OFF, { billLift: 0, moonIn: 1.4, exposure: 1.35, vDocs: 1, lamp: 0.0 }),
  ui: `
    <div class="scrim soft-l" data-in="0" data-out="1" data-a="fade"></div>
    <div class="abs" style="left:96px;top:110px;width:860px" data-in="0" data-out="1" data-a="up" data-d="0.3"><h2 class="h2 shadow-t"><span style="color:var(--cream)">Virtue ethics</span> — what do honesty, responsibility and practical judgement look like in behaviour?</h2></div>
    <div class="abs" style="left:96px;top:470px;width:760px" data-in="0" data-out="1">
      <ul class="rule-list">
        <li data-in="0" data-out="1" data-a="left" data-d="1.4"><span class="k">Honesty</span>Acknowledges hardship; separates the known from the uncertain.</li>
        <li data-in="0" data-out="1" data-a="left" data-d="1.9"><span class="k">Responsibility</span>Follows a complaint through to a meaningful response.</li>
        <li data-in="0" data-out="1" data-a="left" data-d="2.4"><span class="k">Practical judgement</span>Weighs hardship and technical reality; promises only what it can support.</li>
      </ul>
    </div>
    <p class="abs cite" style="left:96px;bottom:26px;width:900px" data-in="0" data-out="1" data-a="fade" data-d="3.0">The three papers are illustrative examples of behaviour, not KE records.</p>
    <div class="scrim soft-r" data-in="1" data-a="fade"></div>
    <div class="abs" style="left:1060px;top:140px;width:780px" data-in="1" data-a="up" data-d="0.6"><p class="kicker">The standard applies to the committee too</p></div>
    <p class="abs body shadow-t" style="left:1060px;top:200px;width:780px" data-in="1" data-a="words" data-d="1.0" data-st="0.03">Public scrutiny needs difficult questions — and a fair opportunity to respond.</p>
    <p class="abs body sm" style="left:1060px;top:420px;width:780px;color:#e3dccb" data-in="1" data-a="up" data-d="2.0">Imad and Employee 1 both believed the delegates should have been allowed to answer.</p>
    <p class="abs h3 shadow-t" style="left:1060px;top:600px;width:780px" data-in="1" data-a="up" data-d="2.8">Expelling representatives may communicate anger. <span class="amber">Anger alone does not produce an explanation or restore electricity.</span></p>
    <p class="abs cite" style="right:40px;bottom:22px" data-in="0" data-a="fade" data-d="3.4">Theory: Hursthouse &amp; Pettigrove (2026), Virtue ethics, <i>Stanford Encyclopedia of Philosophy</i></p>`,
  states: [
    { cam: { p: [0.75, 5.35, -2.35], t: [0.45, 4.15, -0.95], fov: 44, roll: 0 }, dur: 4.6, ease: 'power2.inOut',
      via: [[-1, 9, 22], [0.4, 6.2, 7], [0.1, 5.35, 0.6], [0.2, 5.6, -1.6]], tvia: [[-1, 6, 4], [0, 5.2, -2], [0.2, 4.6, -3.6], [0.4, 4.2, -1.6]],
      pt: { vDocs: { d: 0.55, t: 0.45, e: 'power2.out' }, wireGlow: { d: 0, t: 0.3 } } },
    { set: 'chamber', enter: 'whip', cam: { p: [-7.5, 4.2, 14.5], t: [-0.5, 1.4, 3.2], fov: 44 }, dur: 4.0,
      p: { chEmpty: 0.5, chKey: 1, chLeave: 1, chDoor: 0.7 } }
  ]
});

/* ------------------------------------------------------------------ 14 · comparing the theories */
S({
  id: 's14', set: 'studio', enter: 'whip',
  cues: ['A dark studio. Three glass slabs rise from the floor at different depths — deontology, utilitarianism, virtue ethics — then glide into one readable row as the camera arcs to face them. Bridging line (optional).'],
  p: { stSlabs: 1, stStack: 1 },
  ui: `
    <div class="scrim soft-t" data-in="0" data-a="fade" data-d="2.4"></div>
    <div class="abs" style="left:96px;top:70px;width:1720px;text-align:center" data-in="0" data-a="up" data-d="2.6"><p class="kicker">Comparing the theories · how they work together</p></div>
    <div class="scrim soft-b" data-in="0" data-a="fade" data-d="3.2"></div>
    <div class="abs" style="left:120px;right:120px;bottom:150px;text-align:center" data-in="0" data-a="words" data-d="3.4" data-st="0.04"><h2 class="h2 shadow-t" style="font-size:54px">Financial sustainability matters — <span class="amber">but it cannot automatically override the compliant customer’s claim.</span></h2></div>
    <p class="abs cite" style="left:200px;right:200px;bottom:40px;text-align:center" data-in="0" data-a="fade" data-d="4.6">Where they pull apart: consequences may favour a gradual transition; duties limit how long innocent households bear its costs.</p>`,
  states: [
    { cam: { p: [0, 2.0, 10.6], t: [0, 1.3, 0], fov: 46 }, from: { p: [-9, 3.4, 7], t: [0, 1.6, -2], fov: 46 }, dur: 5.4, arriveEase: 'power2.inOut',
      via: [[-6.5, 3.0, 9.5], [-3, 2.6, 10.2]],
      pt: { stSlabs: { d: 0.05, t: 0.5, e: 'power2.out' }, stStack: { d: 0.5, t: 0.45, e: 'power2.inOut' } }, enterP: { stSlabs: 0, stStack: 0 } }
  ]
});

/* ------------------------------------------------------------------ 15 · what KE reports doing */
S({
  id: 's15', set: 'desk', enter: 'whip',
  cues: ['Back at the desk: three paper slips land with KE’s 2025 figures; a teal stamp slams down — company-reported, 2025 activities. The dates note they predate the hearing.'],
  p: { dkKE: 1, dkStamp: 1 },
  ui: `
    <div class="scrim soft-t" data-in="0" data-a="fade"></div>
    ${chap('06', 'Evaluation')}
    <div class="abs" style="left:96px;top:110px;width:1200px" data-in="0" data-a="up" data-d="0.3"><h2 class="h2 shadow-t">What KE says it has done</h2></div>
    <div class="abs panel" style="right:60px;top:110px;width:620px" data-in="0" data-a="up" data-d="2.8"><p class="body sm">Published January 2, 2026. These activities <b>predate the September 2026 hearing</b> — they are not a response to it.</p></div>
    <p class="abs cite" style="left:60px;bottom:22px;width:1800px;background:rgba(10,10,12,.72);padding:6px 12px" data-in="0" data-a="fade" data-d="3.4">Source: K-Electric. (2026b, January 2). Year in review: K-Electric shows steady progress during 2025. Company-reported outputs; not independently verified; not the net return on the camps.</p>
    ${illus('Illustrative paper', 'right:28px;bottom:70px', 0)}`,
  states: [
    { cam: { p: [-0.1, 3.05, 1.55], t: [-0.1, 0.9, 0.15], fov: 50 }, from: { p: [-1.5, 4.5, 3], t: [0, 0.9, 0], fov: 50 }, dur: 3.8,
      pt: { dkKE: { d: 0.1, t: 0.6, e: 'power2.out' }, dkStamp: { d: 0.68, t: 0.1, e: 'power4.in' } }, enterP: { dkKE: 0, dkStamp: 0 } }
  ]
});

/* ------------------------------------------------------------------ 16 · activity versus outcome */
S({
  id: 's16', set: 'studio', enter: 'whip',
  cues: ['Three plinths: a phone with a cloud of users lights fully; an outage update half-lights with question marks; the house window stays dark. The gaps between them are the point.'],
  p: { stB: 1 },
  ui: `
    <div class="scrim soft-t" data-in="0" data-a="fade"></div>
    <div class="abs" style="left:96px;top:96px;width:1720px;text-align:center" data-in="0" data-a="words" data-d="0.4" data-st="0.04"><h2 class="h2 shadow-t">Did paying customers experience better service?</h2></div>
    <p class="abs body sm shadow-t" style="left:96px;right:96px;top:196px;text-align:center" data-in="0" data-a="up" data-d="1.4">The cited activity figures do not establish that outcome for our interviewees.</p>
    ${pin('pl1', '1 · A communication channel exists', { cls: 'teal', inn: 0, d: 1.8, small: 'an app can have many users…' })}
    ${pin('pl2', '2 · Accurate information reaches the customer', { cls: 'ghost', inn: 0, d: 2.6, small: '…while a customer still gets no useful update' })}
    ${pin('pl3', '3 · The underlying problem is resolved', { cls: 'off', inn: 0, d: 3.4, small: 'connected — but different achievements' })}
    <div class="abs panel" style="left:96px;bottom:44px;width:1720px" data-in="0" data-a="up" data-d="4.2"><p class="body sm"><b>98.2% system reliability, FY25</b> — company-reported, aggregate (K-Electric, 2026). It cannot be equated with uninterrupted supply at every home, and household outage hours cannot be derived from it.</p></div>
    ${illus('Illustration', 'left:28px;top:24px')}`,
  states: [
    { cam: { p: [24, 3.0, 11.2], t: [24, 2.1, 0], fov: 50 }, from: { p: [17, 3.4, 11], t: [22, 1.8, 0], fov: 50 }, dur: 4.6,
      pt: { stB: { d: 0.2, t: 0.8, e: 'none' } }, enterP: { stB: 0 } }
  ]
});

/* ------------------------------------------------------------------ 17 · the regulatory record */
S({
  id: 's17', set: 'desk', enter: 'whip',
  cues: ['A clearly labelled paraphrase of the August 31, 2026 order slides onto the desk and the camera settles over it.',
    'ADVANCE → a second sheet slides across: the prior PKR 50 million fine as history, and alternative explanations.'],
  p: { dkOrder: 1, dkLamp: 1.1 },
  ui: `
    <div class="scrim soft-r" data-in="0" data-out="1" data-a="fade"></div>
    <div class="abs" style="left:1180px;top:200px;width:660px" data-in="0" data-out="1" data-a="words" data-d="1.2" data-st="0.05"><h2 class="h2 shadow-t">More than a disagreement.</h2></div>
    <p class="abs body shadow-t" style="left:1180px;top:430px;width:660px" data-in="0" data-out="1" data-a="up" data-d="2.0">A documented regulatory challenge to the practice.</p>
    <p class="abs body sm" style="left:1180px;top:620px;width:660px;color:#e3dccb" data-in="0" data-out="1" data-a="up" data-d="2.8">We treat it as the regulator’s finding and direction. <b>We do not claim a final court outcome.</b></p>
    ${illus('Paraphrase on illustrative paper — not the document', 'right:28px;bottom:24px')}`,
  states: [
    { cam: { p: [0.05, 3.15, 0.95], t: [0.05, 0.9, 0.02], fov: 44 }, from: { p: [-2, 4, 2.4], t: [-0.5, 0.9, 0], fov: 46 }, dur: 3.6,
      pt: { dkOrder: { d: 0.05, t: 0.6, e: 'power2.out' } }, enterP: { dkOrder: 0 } },
    { cam: { p: [-0.12, 3.15, 0.95], t: [-0.12, 0.9, 0.0], fov: 44, roll: 0.5 }, dur: 3.0, p: { dkOrder2: 1 }, pt: { dkOrder2: { d: 0.05, t: 0.6, e: 'power2.out' } } }
  ]
});

/* ------------------------------------------------------------------ 18 · consequences */
const conseq = [
  ['Financial', ['● Theft and non-payment constrain resources for supply (company explanation).', '● Prior PKR 50 million fine — regulatory history (NEPRA, 2026).', '○ Targeted controls and upgrades need funding; compliance cost not estimated.'], 'var(--amber)'],
  ['Household', ['● UPS and battery spending, interrupted work and internet, cooking, water pumping, time seeking updates.', '○ Households without backup may carry far more of the hardship.'], 'var(--cream)'],
  ['Reputational', ['● Distrust of explanations and leadership in customer accounts.', '○ Unsupported suspicions spread where explanations are missing.'], 'var(--teal)']
];
S({
  id: 's18', set: 'studio', enter: 'whip',
  cues: ['Three pillars of light rise in turn — financial, household, reputational — each over its objects (coins; a battery and bucket; a question mark). Bridging passage (optional).'],
  p: { stPillars: 1 },
  ui: `
    <div class="scrim soft-b" data-in="0" data-a="fade" data-d="0.6" style="height:62%"></div>
    <div class="abs" style="left:96px;top:60px;width:1720px;text-align:center" data-in="0" data-a="up" data-d="0.3"><p class="kicker">Consequences · ● reported or documented &nbsp; ○ risk, not yet measured</p></div>
    ${conseq.map((c, i) => `<div class="abs" style="left:${96 + i * 586}px;top:560px;width:550px" data-in="0" data-a="up" data-d="${1.2 + i * 0.6}">
      <p class="h3" style="color:${c[2]}">${c[0]}</p>
      ${c[1].map(t => `<p class="body sm" style="font-size:27px;margin-top:10px">${t}</p>`).join('')}</div>`).join('')}
    <p class="abs cite" style="left:96px;bottom:26px;width:1720px" data-in="0" data-a="fade" data-d="3.4"><b style="color:var(--amber)">Limitation:</b> four interviews cannot quantify citywide effects. No company-wide loss, household income loss or appliance-damage figure is estimated here.</p>`,
  states: [
    { cam: { p: [48, 3.4, 10.8], t: [48, 2.9, 0], fov: 46 }, from: { p: [41, 2.4, 10], t: [46, 2, 0], fov: 46 }, dur: 4.4,
      pt: { stPillars: { d: 0.15, t: 0.7, e: 'power1.inOut' } }, enterP: { stPillars: 0 } }
  ]
});

/* ------------------------------------------------------------------ 19–20 · recommendations (miniature street) */
const chip = (k, v, x, y, w, cls = '', inn = 0, d = 0, out) => `<div class="abs chip ${cls}" style="left:${x}px;top:${y}px;width:${w}px" data-in="${inn}"${out !== undefined ? ` data-out="${out}"` : ''} data-a="left" data-d="${d}"><div class="k">${k}</div><div class="v">${v}</div></div>`;
const rail = (on, inn = 0, out) => `<div class="rail" data-in="${inn}"${out !== undefined ? ` data-out="${out}"` : ''} data-a="fade" data-d="2.6"><div class="line"></div>${[['Day 30', 1], ['Day 60', 2], ['Day 90', 3], ['Before next hearing', 4], ['Following quarter', 5]].map(([t, k], i) => `<div class="m ${on.includes(k) ? 'on' : ''}" style="left:${8 + i * 21}%"><i></i>${t}</div>`).join('')}</div>`;
const recHead = (num, title, inn, out) => `<div class="abs rec" style="left:96px;top:96px;width:900px" data-in="${inn}"${out !== undefined ? ` data-out="${out}"` : ''} data-a="up" data-d="0.4"><div class="num">${num}</div><div class="title shadow-t">${title}</div></div>`;
const MINI = { tilt: 0.3, tiltY: 0.45, power: 1, others: 1, lamp: 1, tube: 1, leds: 1, cook: 1, fan: 1, moonIn: 0, exposure: 1.15, sat: 1.12, warm: 0.2 };
S({
  id: 's19', set: 'street', enter: 'whip',
  cues: ['The street again, seen from above as a lit miniature (tilt-shift). Recommendation 1: a ring targets only the hooked line while paying houses keep their light. Owner, proposed deadline and measure land as chips.',
    'ADVANCE → recommendation 2: an honest outage update hangs over the street — cause, uncertainty, and the time of the next update.'],
  p: Object.assign({}, MINI, { billLift: 0, uObjs: 0, vDocs: 0, billSpot: 0 }),
  ui: `
    <div class="scrim soft-l" data-in="0" data-a="fade" style="width:56%"></div>
    ${chap('07', 'Recommendations')}
    ${recHead('01', 'Targeted loss reduction and a costed compliance programme', 0, 1)}
    ${chip('Owner', 'Distribution and regulatory teams; finance costs it', 96, 470, 760, '', 0, 1.4, 1)}
    ${chip('Proposed deadline', 'Pilot areas, requirements and barriers within 90 days', 96, 600, 760, 'cream', 0, 1.8, 1)}
    ${chip('Success measure', 'Recovery alongside interruption hours for compliant customers', 96, 730, 760, 'teal', 0, 2.2, 1)}
    <p class="abs qual" style="left:96px;top:850px;width:820px" data-in="0" data-out="1" data-a="up" data-d="2.8">A pilot must not postpone compliance with binding directions.</p>
    ${pin('kunda', 'Targeted: the identified hooked line', { cls: 'rust low', inn: 0, out: 1, d: 1.2, oy: 150 })}
    ${recHead('02', 'Clearer outage updates', 1)}
    ${chip('Owner', 'Customer service with distribution', 96, 380, 760, '', 1, 1.0)}
    ${chip('Proposed deadline', 'Within 30 days', 96, 510, 760, 'cream', 1, 1.4)}
    ${chip('Success measure', 'Update accuracy — communicated vs actual restoration, checked monthly; phone and on-ground channels kept', 96, 640, 760, 'teal', 1, 1.8)}
    ${rail([3], 0, 1)}${rail([1], 1)}
    <div class="abs" style="right:40px;top:28px;text-align:right" data-in="0" data-a="fade"><span class="badge">Proposed — not implemented</span><br><span class="badge ghost" style="margin-top:8px">Illustrative model — not a result</span></div>`,
  states: [
    { cam: { p: [14, 32, 50], t: [11, 4, 0], fov: 32 }, from: { p: [16, 70, 80], t: [11, 0, 0], fov: 34 }, dur: 4.4, p: { rTarget: 1 }, pt: { rTarget: { d: 0.45, t: 0.4 } }, enterP: { rTarget: 0 } },
    { cam: { p: [12, 27, 48], t: [11.5, 9.5, 3], fov: 32 }, dur: 3.2, p: { rTarget: 0.35, rNotice: 1 }, pt: { rNotice: { d: 0.2, t: 0.5, e: 'back.out(1.4)' } } }
  ]
});
S({
  id: 's20', set: 'street',
  cues: ['Recommendation 3: a recurring complaint leaves our house as a teal thread and arrives at an owner — next step, responsible function, customer-confirmed resolution.',
    'ADVANCE → recommendation 4: a hearing brief hangs over the street — evidence, outstanding issues, reviewable commitments.'],
  p: Object.assign({}, MINI, { rTarget: 0.25, rNotice: 0.5 }),
  ui: `
    <div class="scrim soft-l" data-in="0" data-a="fade" style="width:56%"></div>
    ${recHead('03', 'Give recurring complaints an owner', 0, 1)}
    ${chip('Owner', 'The complaint function — one named owner per recurring case', 96, 380, 760, '', 0, 1.0, 1)}
    ${chip('Proposed deadline', 'Within 60 days; publish aggregate resolution measures', 96, 510, 760, 'cream', 0, 1.4, 1)}
    ${chip('Success measure', 'Repeat complaints, time to a substantive response, customer-confirmed resolution — not closure counts', 96, 640, 760, 'teal', 0, 1.8, 1)}
    <p class="abs qual" style="left:96px;top:820px;width:760px" data-in="0" data-out="1" data-a="up" data-d="2.4">Employees can raise recurring fairness concerns safely, without retaliation.</p>
    ${recHead('04', 'Prepared, authorised engagement — and documented follow-up', 1)}
    ${chip('Owner', 'KE leadership, with the committee', 96, 470, 760, '', 1, 1.0)}
    ${chip('Proposed deadline', 'Agreed before the next hearing; reviewed over the following quarter', 96, 600, 760, 'cream', 1, 1.4)}
    ${chip('Success measure', 'Documented commitments and service outcomes — not attendance alone', 96, 730, 760, 'teal', 1, 1.8)}
    <p class="abs qual" style="left:96px;top:850px;width:820px" data-in="1" data-a="up" data-d="2.4">The committee tests the answers and documents follow-up; reasons for any substitution are explained.</p>
    ${rail([2], 0, 1)}${rail([4, 5], 1)}
    <div class="abs" style="right:40px;top:28px;text-align:right" data-in="0" data-a="fade"><span class="badge">Proposed — not implemented</span><br><span class="badge ghost" style="margin-top:8px">Proposed process — not an existing, verified practice</span></div>
    <p class="abs cite" style="right:40px;top:140px;width:560px;text-align:right" data-in="1" data-a="fade" data-d="3.0">The proposed timelines are management deadlines, not legal deadlines. Their purpose is to make progress visible and assessable.</p>`,
  states: [
    { cam: { p: [11, 27, 48], t: [11, 9.5, 3], fov: 32 }, dur: 3.2, p: { rTicket: 1, rNotice: 0 }, pt: { rTicket: { d: 0.2, t: 0.6 } } },
    { cam: { p: [13, 27, 48], t: [12.5, 9.5, 3], fov: 32 }, dur: 3.2, p: { rTicket: 0, rLedger: 1, rNotice: 0 }, pt: { rLedger: { d: 0.2, t: 0.5, e: 'back.out(1.4)' } } }
  ]
});

/* ------------------------------------------------------------------ 21 · limits and conclusion */
S({
  id: 's21', set: 'studio', enter: 'whip',
  cues: ['A miniature night city — Karachi in the abstract. Four small lights appear, far apart: four interviews. The limits are stated.',
    'ADVANCE → the camera rises; the city dims to a wash; the conclusion settles in the centre.'],
  p: { stBeacons: 1, stCity: 0.75, tilt: 1.0, tiltY: 0.5 },
  ui: `
    <div class="scrim soft-l" data-in="0" data-out="1" data-a="fade"></div>
    ${chap('08', 'Conclusion')}
    <div class="abs" style="left:96px;top:110px;width:780px" data-in="0" data-out="1" data-a="up" data-d="0.4"><p class="kicker">Research limitations</p><h2 class="h2 shadow-t" style="margin-top:10px">Four interviews cannot represent all of Karachi.</h2></div>
    <div class="abs" style="left:96px;top:470px;width:740px" data-in="0" data-out="1" data-a="up" data-d="1.6"><p class="kicker" style="color:#aaa">They cannot</p><p class="body sm" style="margin-top:6px">establish the cause of every outage, or quantify the city’s economic losses. The sample was access-based, and interviewer framing may have shaped some answers.</p></div>
    <div class="abs" style="left:96px;top:720px;width:740px" data-in="0" data-out="1" data-a="up" data-d="2.4"><p class="kicker">They can</p><p class="body sm" style="margin-top:6px">show how the policy is experienced — and where the company’s explanation leaves an ethical question unanswered.</p></div>
    <div class="scrim centre" data-in="1" data-a="fade"></div>
    <p class="abs body shadow-t" style="left:300px;right:300px;top:140px;text-align:center;color:#e3dccb" data-in="1" data-a="up" data-d="0.6">We began with a household that had paid its bill. We then heard why the company struggles to recover what it is owed. <b>A fair response has to take both seriously.</b></p>
    <div class="abs" style="left:200px;right:200px;top:420px;text-align:center" data-in="1" data-a="up" data-d="1.8"><p class="kicker">Our conclusion</p></div>
    <div class="abs" style="left:200px;right:200px;top:470px;text-align:center" data-in="1" data-a="words" data-d="2.2" data-st="0.05"><h2 class="h2 shadow-t" style="font-size:76px">Financial sustainability should guide the design of the remedy.</h2></div>
    <div class="abs" style="left:240px;right:240px;top:700px;text-align:center" data-in="1" data-a="words" data-d="3.6" data-st="0.05"><h2 class="h2 shadow-t amber" style="font-size:62px">It cannot, on its own, settle whether the burden has been distributed fairly.</h2></div>
    ${illus('Abstract city — four lights for four interviews, not locations', 'right:28px;top:24px')}`,
  states: [
    { cam: { p: [118, 22, 30], t: [104, 0, 0], fov: 36, roll: 2 }, from: { p: [140, 40, 60], t: [100, 0, 0], fov: 40 }, dur: 5.0, pt: { stBeacons: { d: 0.4, t: 0.55 } }, enterP: { stBeacons: 0 } },
    { cam: { p: [100, 70, 62], t: [100, 0, 0], fov: 42 }, dur: 4.4, p: { stCity: 0.35, stBeacons: 0.7, tilt: 0.4 } }
  ]
});

/* ------------------------------------------------------------------ 22 · return to the household */
S({
  id: 's22', set: 'street', enter: 'whip',
  cues: ['Back on the street, dark. The camera drifts in through the open window, over the table, and turns down to the paid bill in moonlight. The question; hold the pause, then finish.'],
  p: Object.assign({}, LIGHTS_OFF, { billLift: 0, moonIn: 1.4, exposure: 1.3, uObjs: 0, vDocs: 0, billSpot: 0.35 }),
  ui: `
    <div class="scrim soft-l" data-in="0" data-a="fade" data-d="3.6"></div>
    <div class="abs" style="left:96px;top:560px;width:860px" data-in="0" data-a="words" data-d="4.2" data-st="0.06"><h1 class="h1 shadow-t" style="font-size:84px">Does paying the bill lead to fairer service</h1></div>
    <p class="abs h2 shadow-t amber" style="left:96px;top:820px;width:860px" data-in="0" data-a="blur" data-d="5.6">— and an answer they can trust?</p>
    ${illus('Illustrative household', 'right:28px;top:24px')}`,
  states: [
    { cam: BILL_CLOSE, from: { p: [0, 7.5, 16], t: [0, 5.2, 0], fov: 46 }, dur: 6.0, arriveEase: 'power2.inOut',
      via: [[0, 5.6, 6], [0, 5.25, 0.6], [0.15, 5.3, -1.2], [0.6, 5.3, -2.7]], tvia: [[0, 5.2, -1], [0, 4.9, -3], [0, 4.5, -3.5], [-0.3, 4.3, -1.6]] }
  ]
});
