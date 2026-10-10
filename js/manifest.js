/* ==========================================================================
   SCENE MANIFEST
   Each scene: id, chapter, title, steps (number of reveal states),
   thumb (plate used in the overview), sources (keys in REFERENCES),
   assets (images used), html (stage markup), script[] (spoken passage for
   each step, verbatim from the supplied script), cues[] (what the advance
   does), notes (qualifications to keep in mind / optional bridging lines).
   Reveal classes: .inN = appears at step N, .outN = leaves at step N,
   .dimN = dims at step N. Steps are 0-based.
   ========================================================================== */
(function () {
  const I = (n) => `assets/img/${n}.webp`;
  const plate = (n, cls = '', st = '') => `<img class="plate ${cls}" data-src="${I(n)}" alt="" style="${st}">`;
  const cut = (n, x, y, w, cls = '', st = '') => `<img class="cut ${cls}" data-src="${I(n)}" alt="" style="left:${x}px;top:${y}px;width:${w}px;${st}">`;
  const illus = (t = 'Illustration', pos = 'right:28px;top:24px') => `<div class="illus" style="${pos}">${t}</div>`;
  const L = window.LAYOUT;
  const H = L.street.houses;
  const TX = L.street.transformer;

  // wires from the transformer to every house (used for the feeder / recommendations)
  const feederPaths = (cls, style = () => '') => H.map((h, i) => {
    const sx = h.x < TX[0] ? TX[0] - 150 : TX[0] + 150;
    const mx = (sx + h.x) / 2, my = Math.max(226, h.roof) + 30 + Math.abs(h.x - TX[0]) * 0.04;
    return `<path class="${cls}" style="${style(i)}" d="M${sx},226 Q${mx},${my} ${h.x},${h.roof + 6}"/>`;
  }).join('');

  const rail = (on) => {
    const ms = [['Baseline', 'day 0', 0], ['30 days', 'updates', 18], ['60 days', 'complaints', 36], ['90 days', 'targeted plan', 54], ['Before next', 'hearing', 74], ['Quarterly', 'review', 94]];
    return `<div class="rail"><div class="line"></div>${ms.map((m, i) => `<div class="m ${on.includes(i) ? 'on' : ''}" style="left:${m[2] + 3}%"><i></i>${m[0]}<br>${m[1]}</div>`).join('')}
      <div class="cite" style="position:absolute;left:0;top:-44px;color:var(--teal)">PROPOSED management milestones — not legal deadlines, and not permission to delay binding compliance</div></div>`;
  };

  const recBlock = (n, title, rows, cls) => `
    <div class="rec ${cls}">
      <div class="head"><div class="mega">${n}</div><h2 class="h2 shadow-t">${title}</h2></div>
      <ul class="rule-list">${rows.map(r => `<li><span class="k">${r[0]}</span>${r[1]}</li>`).join('')}</ul>
    </div>`;

  window.MANIFEST = { title: 'Paid. On time. — K-Electric, load-shedding and accountability', scenes: [

  /* ------------------------------------------------------------------ 1 */
  { id: 's01', chapter: 'Opening', title: 'The household', steps: 2, thumb: 'room_lit',
    assets: ['room_lit', 'room_dark', 'bill'], sources: [],
    html: `
      <div class="cam" style="--enter:scale(1.1);--rest:scale(1.02);--rest1:scale(1.05);--exit:scale(.34);--origin:50% 55%">
        ${plate('room_lit')}
        ${plate('room_dark', 'lightsout')}
      </div>
      <div class="scrim b" style="height:46%"></div>
      <div class="ui">
        ${cut('bill', 96, 520, 430, 'in0', '--rot:-7deg;--d:.2s')}
        <div class="stamp in0" style="left:150px;top:760px;--rot:-11deg;--d:1.3s;--ds:1.5;--dy:0px">Paid.<br>On time.</div>
        <div class="abs out1" style="left:640px;top:780px;width:1180px">
          <h1 class="h1 shadow-t in0" style="--d:.5s">You pay your electricity bill.</h1>
          <p class="body shadow-t in0" style="--d:2.2s;margin-top:18px;font-size:44px">On time. <span class="amber">Every month.</span></p>
        </div>
        <div class="abs in1" style="left:640px;top:830px;width:1180px;--d:1.1s">
          <h1 class="h1 shadow-t">Then the lights go out.</h1>
        </div>
        <div class="tag in1 off" style="left:1180px;top:262px;--d:1.6s">Wi-Fi router — offline</div>
        <div class="tag in1 off" style="left:1420px;top:690px;--d:1.9s">Hotplate — dead</div>
        <div class="tag in1 off" style="left:960px;top:140px;--d:2.2s">Fan — still</div>
        ${illus('Illustrative household — not an interview participant')}
      </div>`,
    script: [
      'You pay your electricity bill.\nOn time.\nEvery month.',
      'Then the lights go out.'
    ],
    cues: ['Scene opens on a lit evening room; bill slides in, stamp lands.', 'ADVANCE → the power fails: room drops to moonlight, router, hotplate and fan labelled dead.'],
    notes: 'Begin without an introduction. The household is illustrative, not one of our participants. Let the lights-out moment land before speaking.'
  },

  /* ------------------------------------------------------------------ 2 */
  { id: 's02', chapter: 'Opening', title: 'Shared darkness', steps: 3, thumb: 'street_lit',
    assets: ['street_lit', 'street_dark', 'kunda'], sources: [],
    html: `
      <div class="cam">
        ${plate('street_lit')}
        ${plate('street_dark', 'dark')}
      </div>
      <div class="scrim t" style="height:40%"></div>
      <div class="scrim b" style="height:30%"></div>
      <div class="ui">
        ${H.map((h, i) => {
          const kind = i === 3 ? 'unpaid' : i === 8 ? 'theft' : 'paid';
          const label = i === 2 ? 'You · paid' : kind === 'paid' ? 'Paid' : kind === 'unpaid' ? 'Unpaid' : 'Hooked line';
          return `<div class="htag ${kind} in0 out2" style="left:${h.x}px;top:${h.roof - 128}px;--d:${0.8 + i * 0.08}s">${label}</div>`;
        }).join('')}
        ${cut('kunda', H[8].x - 210, 150, 300, 'soft in0 out2', '--d:1.6s')}
        <div class="abs out1" style="left:96px;top:56px;width:1500px">
          <p class="body shadow-t in0" style="--d:.4s;font-size:42px">Your neighbour may have an unpaid bill. Someone further down the street may be stealing electricity.</p>
          <p class="body shadow-t in0 amber" style="--d:1.6s;font-size:42px;margin-top:8px">You have done neither.</p>
        </div>
        <div class="abs in1 out2" style="left:96px;top:70px;width:1700px;--d:1s"><h1 class="h1 shadow-t">But you share the darkness.</h1></div>
        <div class="abs in2" style="left:96px;top:64px;width:1728px">
          <div class="mega shadow-t" style="font-size:160px">Who should bear the cost?</div>
          <p class="body shadow-t" style="margin-top:18px;width:1500px">When a company faces a collective financial problem, how much of the burden can it fairly place on an individual customer who has fulfilled their responsibility?</p>
        </div>
        <div class="cite in0 out2" style="position:absolute;left:96px;bottom:40px;width:1700px;--d:2s;color:var(--cream)">ILLUSTRATIVE EXAMPLE: 8 paying households, 2 defaulting (one unpaid bill, one illegal hook). Not measured data from our interviews.</div>
      </div>`,
    script: [
      'Your neighbour may have an unpaid bill. Someone further down the street may be stealing electricity. You have done neither.',
      'But you share the darkness.\n[Pause.]',
      'That is the question behind our K-Electric case:\nWhen a company faces a collective financial problem, how much of the burden can it fairly place on an individual customer who has fulfilled their responsibility?'
    ],
    cues: ['Camera pulls back out of one window to the whole feeder; illustrative tags appear on ten houses.', 'ADVANCE → every house goes dark, paying or not.', 'ADVANCE → tags clear; the case question lands.'],
    notes: 'The 8/2 split is an invented teaching example and is labelled as such on screen. Do not describe it as interview data.'
  },

  /* ------------------------------------------------------------------ 3 */
  { id: 's03', chapter: 'The controversy', title: 'The public confrontation', steps: 1, thumb: 'committee',
    assets: ['committee', 'paper_slip'], sources: ['khan2026'],
    html: `
      <div class="cam" style="--enter:scale(1.15) rotate(-2deg);--rest:scale(1.04);--exit:scale(.9) translateY(240px) rotate(4deg)">
        <div style="position:absolute;inset:0;background:#1a1816"></div>
        <div style="position:absolute;left:820px;top:96px;width:1010px;height:568px;transform:rotate(2.5deg);background:#f1ead9;padding:16px 16px 48px;box-shadow:0 30px 50px rgba(0,0,0,.6)">
          <img data-src="${I('committee')}" alt="" style="width:100%;height:100%;object-fit:cover;display:block">
          <div class="cite dark" style="position:absolute;left:18px;bottom:8px;font-size:20px">ILLUSTRATION — NOT AN IMAGE OF THE MEETING</div>
        </div>
      </div>
      <div class="ui">
        <div class="abs in0" style="left:96px;top:80px;width:700px;--d:.2s">
          <div class="kicker">September 2026 · Sindh Assembly special committee on prolonged power outages</div>
        </div>
        <div class="slip in0" style="left:96px;top:250px;width:690px;--rot:-1.5deg;--d:.6s"><b>The CEO had been summoned.</b></div>
        <div class="slip in0" style="left:150px;top:370px;width:600px;--rot:1deg;--d:1.1s"><b>He did not attend.</b></div>
        <div class="slip in0" style="left:96px;top:490px;width:760px;--rot:-.8deg;--d:1.6s">Representatives <b>led by the distribution head</b> appeared instead.</div>
        <div class="slip in0" style="left:140px;top:650px;width:740px;--rot:1.2deg;--d:2.1s">The committee was dissatisfied with their responses and <b>asked them to leave.</b></div>
        <div class="abs in0" style="left:960px;top:720px;width:860px;--d:2.8s">
          <p class="h3 shadow-t">The CEO was not expelled.</p>
          <p class="body sm shadow-t" style="margin-top:8px">His reason for not attending is not established by the reporting or by our interviews.</p>
        </div>
        <div class="cite in0" style="position:absolute;left:96px;bottom:44px;width:1720px;--d:3s">Our summary of published reporting — not a reproduction of the article. Khan, A. (2026, September 24), <i>Business Recorder</i> (publication date; the article reports the committee session).</div>
      </div>`,
    script: [
      'In September 2026, that question reached a Sindh Assembly committee.\nThe CEO had been summoned. He did not attend. Representatives led by the distribution head appeared instead.\nThe committee was dissatisfied with their responses and asked them to leave.\nThat confrontation became the headline.'
    ],
    cues: ['Collage builds: four slips in reading order, then the CEO/delegates distinction.'],
    notes: 'Accuracy: the CEO was summoned and absent; the delegates (led by the distribution head) were asked to leave. The distribution head apologised on the CEO\'s behalf and said they did not hold the CEO\'s authority (Khan, 2026). Sept 24 is the article\'s publication date. Do not suggest a motive for the absence.'
  },

  /* ------------------------------------------------------------------ 4 */
  { id: 's04', chapter: 'The investigation', title: 'Beyond the headline', steps: 2, thumb: 'desk',
    assets: ['desk'], sources: ['khan2026', 'nepra2026', 'nepra2025', 'kefaq', 'ke2026b'],
    html: `
      <div class="cam" style="--enter:scale(1.25) rotate(3deg);--rest:scale(1);--rest1:scale(1.05) translate(-40px,-30px);--exit:scale(1.4);--origin:70% 70%">
        ${plate('desk')}
        ${L.desk.folders.map((f, i) => {
          const labels = [
            ['Published reporting', 'Business Recorder · September 2026'],
            ['Regulatory documents', 'NEPRA decision (Jul 2025) · NEPRA order (Aug 31, 2026)'],
            ['KE’s published position', 'FAQs · 2025 year in review · sustainability release'],
            ['Four interviews', 'October 3–9, 2026 · English & Urdu']];
          return `<div class="abs ${i < 3 ? 'dim1' : ''}" style="left:${f.x}px;top:${f.y}px;width:${f.w}px;height:${f.h}px;transform:rotate(${f.rot}deg);transition:opacity .8s, filter .8s">
            <div class="in0" style="position:absolute;left:44px;top:96px;right:40px;--d:${0.4 + i * 0.35}s;color:var(--ink)">
              <div class="kicker" style="color:#7a3a1c">Source ${i + 1}</div>
              <div class="h2" style="font-size:62px;color:var(--ink)">${labels[i][0]}</div>
              <div style="font-size:30px;margin-top:10px">${labels[i][1]}</div>
            </div></div>`;
        }).join('')}
      </div>
      <div class="ui">
        <div class="abs in0 out1" style="left:96px;top:1010px;width:1700px;--d:.1s"><p class="cite" style="color:var(--cream);font-size:24px">But a confrontation alone cannot tell us whether a company acted ethically.</p></div>
        <div class="abs in1" style="left:96px;top:96px;width:900px;--d:.4s">
          <div class="scrim" style="inset:-40px -60px -40px -60px;background:rgba(14,12,10,.86)"></div>
          <div style="position:relative">
            <div class="mega amber" style="font-size:150px">2 residents</div>
            <div class="mega" style="font-size:150px">+ 2 employees</div>
            <ul class="rule-list" style="margin-top:28px">
              <li><span class="k">Consent</span>Obtained before each interview.</li>
              <li><span class="k">Confidentiality</span>Both employees are anonymised.</li>
              <li><span class="k">Sample</span>Small and access-based — situated perspectives, not a survey.</li>
            </ul>
            <p class="h3 it" style="margin-top:26px">And the picture became more complicated.</p>
          </div>
        </div>
      </div>`,
    script: [
      'But a confrontation alone cannot tell us whether a company acted ethically.\nWe needed to examine what happened before the meeting, what customers were experiencing, and what people inside the company could explain.\nSo we brought together regulatory documents, KE’s published position,',
      'and four interviews: two residential customers and two employees.\nAnd the picture became more complicated.\n[Pause briefly.]'
    ],
    cues: ['The clipping collage drops onto the research desk; four source folders label themselves.', 'ADVANCE → the interview folder comes forward: 2 residents + 2 employees, consent, confidentiality, small sample.'],
    notes: 'Semi-structured interviews, October 3–9, 2026, English and Urdu. No interviewer names or speaking roles are shown. Interviewer framing may have shaped some answers (see limitations).'
  },

  /* ------------------------------------------------------------------ 5 */
  { id: 's05', chapter: 'Interviews', title: 'Imad’s household', steps: 2, thumb: 'room_lit',
    assets: ['paper_sheet', 'phone', 'clock', 'pot', 'laptop', 'router', 'iron', 'paper_slip'], sources: [],
    html: `
      <div class="cam" style="--enter:scale(1.12) translate(60px,20px);--rest:scale(1);--rest1:scale(1.03);--exit:scale(1.5);--origin:22% 45%">
        <div style="position:absolute;inset:0;background:#e9dfc8"></div>
        <img data-src="${I('paper_sheet')}" alt="" style="position:absolute;left:-60px;top:-60px;width:2040px;height:1200px">
        <svg class="wires" viewBox="0 0 1920 1080">
          <path d="M-40,180 C400,160 900,40 2000,120" stroke="#8fc3bc" stroke-width="70" fill="none" opacity=".55"/>
          <path d="M-40,1020 C500,960 1300,1080 2000,940" stroke="#f0ad45" stroke-width="56" fill="none" opacity=".45"/>
        </svg>
        <div class="mega" style="position:absolute;left:96px;top:120px;font-size:196px;color:#3f7f7a;opacity:.92">Gulistan-e-Jauhar</div>
        <svg class="wires" viewBox="0 0 1920 1080">
          ${[[255, 420], [560, 420], [905, 600], [1335, 480], [1695, 600], [600, 700]].map(p => `<path class="wire" d="M-20,1000 C300,1010 ${p[0] - 60},${p[1] + 420} ${p[0]},${p[1] + 120}"/><path class="wire glow cutoff" d="M-20,1000 C300,1010 ${p[0] - 60},${p[1] + 420} ${p[0]},${p[1] + 120}"/>`).join('')}
        </svg>
        <div class="halo" style="left:80px;top:280px;width:360px;height:520px"></div>
        <div class="halo" style="left:700px;top:500px;width:420px;height:380px"></div>
        <div class="halo" style="left:1100px;top:330px;width:520px;height:420px"></div>
        ${cut('phone', 130, 330, 250, 'obj')}
        ${cut('clock', 450, 370, 220, 'obj')}
        ${cut('iron', 470, 690, 270, 'obj')}
        ${cut('pot', 720, 560, 380, 'obj')}
        ${cut('laptop', 1110, 420, 450, 'obj')}
        ${cut('router', 1590, 600, 210, 'obj')}
      </div>
      <div class="ui">
        <div class="abs in0" style="left:96px;top:60px;width:1200px;--d:.2s"><div class="kicker" style="color:#7a3a1c">Imad · residential customer · interview, October 3, 2026</div></div>
        <div class="tag ink in0" style="left:120px;top:800px;width:330px;--d:.9s;color:var(--ink);text-shadow:none;font-size:30px">Overnight outages not announced on the app he checked</div>
        <div class="tag in0" style="left:490px;top:600px;--d:1.1s;color:var(--ink);text-shadow:none;font-size:30px">Overnight</div>
        <div class="tag in0" style="left:800px;top:880px;--d:1.3s;color:var(--ink);text-shadow:none;font-size:30px">Electric cooking</div>
        <div class="tag in0" style="left:1150px;top:735px;width:430px;--d:1.5s;color:var(--ink);text-shadow:none;font-size:30px">His brother’s remote work</div>
        <div class="tag in0" style="left:1630px;top:745px;--d:1.7s;color:var(--ink);text-shadow:none;font-size:30px">Internet</div>
        <div class="abs in0 out1" style="left:1150px;top:960px;width:700px;--d:2s"><p class="body ink" style="font-size:34px"><b style="color:#7a3a1c">Reported:</b> he generally pays on time.</p></div>
        <div class="slip in1" style="left:1060px;top:140px;width:560px;--rot:-2.5deg;--d:.9s;font-family:var(--serif);font-style:italic;font-size:42px">Work is underway.</div>
        <div class="slip in1" style="left:1280px;top:262px;width:600px;--rot:2deg;--d:1.4s;font-family:var(--serif);font-style:italic;font-size:42px">Your complaint has been forwarded.</div>
        <div class="cite dark in1" style="position:absolute;left:1090px;top:100px;--d:.8s;font-size:22px">CUSTOMER-SERVICE RESPONSES, AS HE DESCRIBED THEM</div>
        <div class="abs in1" style="left:96px;top:950px;width:1720px;--d:2s;background:rgba(29,27,25,.9);padding:18px 30px"><p class="body" style="font-size:36px">They may acknowledge a complaint. <span class="amber">They do very little to help a household plan its evening.</span></p></div>
        ${illus('Illustrative objects', 'right:28px;bottom:24px')}
      </div>`,
    script: [
      'Start with Imad, a customer in Gulistan-e-Jauhar.\nHe told us he generally pays his bills on time. Yet he described overnight outages that were not announced on the application he checked.\nAt home, electricity supports cooking. His brother works remotely, so an outage also interrupts internet access and work.',
      'When he contacted customer service, he described familiar responses: work is underway; your complaint has been forwarded.\nThose responses may acknowledge a complaint. They do very little to help a household plan its evening.'
    ],
    cues: ['A household collage: phone, clock, iron, cooking, laptop and router wired to one supply.', 'ADVANCE → the supply is cut; objects grey out; the two service responses arrive as paper slips.'],
    notes: 'Imad agreed to be named. No precise outage frequency or measured duration was supplied; no expense or income-loss total. The service responses are his description, not verbatim transcripts. He also mentioned ironing and household schedules.'
  },

  /* ------------------------------------------------------------------ 6 */
  { id: 's06', chapter: 'Interviews', title: 'Imad: “tell us the truth”', steps: 1, thumb: 'room_dark',
    assets: ['room_dark'], sources: [],
    html: `
      <div class="cam" style="--enter:scale(1.3);--rest:scale(1.75);--exit:scale(2.2);--origin:27% 34%">
        ${plate('room_dark')}
      </div>
      <div class="scrim all" style="background:rgba(10,12,16,.62)"></div>
      <div class="ui">
        <div class="abs" style="left:150px;top:150px;width:1620px">
          <p class="quote shadow-t in0" style="--d:.5s"><span class="mark">“</span>Agar sirf yeh humse sach hi bol le.<span class="mark">”</span></p>
          <p class="trans shadow-t in0" style="--d:1.6s;margin-top:26px">If they would simply tell us the truth.</p>
          <p class="cite in0" style="--d:1.9s;margin-top:20px;font-size:24px">Imad, interview, October 3, 2026 · Roman Urdu; English translation by the research team</p>
        </div>
        <div class="abs in0" style="left:150px;top:690px;width:1500px;--d:2.4s;border-top:3px solid var(--amber);padding-top:24px">
          <div class="kicker">Analytical finding</div>
          <p class="h3" style="margin-top:8px">Candour is part of the service.</p>
          <p class="body sm" style="margin-top:12px;color:#e9e2d2">He was not asking for uninterrupted electricity — he was asking for information he could trust: what is happening, what is uncertain, and when the next update will come.</p>
        </div>
      </div>`,
    script: [
      'At the end, his request was strikingly simple:\n“Agar sirf yeh humse sach hi bol le.”\nIf they would simply tell us the truth.\nThink about how low that expectation has become.\nHe was asking for information he could trust.'
    ],
    cues: ['Slow push into the dark window; the quotation, its translation and attribution; the finding settles beneath after a beat.'],
    notes: 'Exact quotation from the report (Appendix A). The finding links directly to Recommendation 2 (outage updates). It is a demand for candour, not for impossible precision.'
  },

  /* ------------------------------------------------------------------ 7 */
  { id: 's07', chapter: 'Interviews', title: 'The Gulshan resident', steps: 2, thumb: 'rooftops',
    assets: ['rooftops', 'ups', 'bucket', 'room_lit', 'room_dark'], sources: [],
    html: `
      <div class="cam" style="--enter:scale(1.12) translateX(80px);--rest:scale(1);--rest1:scale(1.06);--exit:scale(1.2)">
        ${plate('rooftops')}
        ${cut('ups', 1120, 600, 430)}
        ${cut('bucket', 1600, 730, 210)}
      </div>
      <div class="scrim l out1"></div>
      <div class="scrim all in1" style="background:rgba(14,12,10,.93);--dy:0px"></div>
      <div class="ui">
        <div class="abs out1" style="left:96px;top:80px;width:1000px">
          <div class="kicker in0" style="--d:.2s">Resident 2 · Gulshan · interview, October 5, 2026</div>
          <p class="body sm in0" style="--d:.4s;margin-top:8px">Reported paying his bills consistently on time.</p>
          <div class="mega in0" style="--d:.8s;margin-top:30px;font-size:178px">~12 hours<br><span class="amber">a day</span></div>
          <p class="qual in0" style="--d:1.2s;margin-top:22px;width:900px">Participant-reported estimate. His account also described periods of about 4, 8, 10 or 12 hours. Not independently verified.</p>
        </div>
        <div class="tag in0 out1" style="left:1180px;top:540px;--d:1.8s">UPS &amp; battery costs</div>
        <div class="tag in0 out1" style="left:640px;top:880px;--d:2s">Difficulty pumping water</div>
        <div class="tag in0 out1" style="left:1240px;top:150px;--d:2.2s">Voltage concerns</div>
        <div class="abs in1" style="left:96px;top:70px;width:1720px;--d:.3s"><h2 class="h2">The same interruption does not fall equally.</h2></div>
        <div class="abs in1" style="left:96px;top:200px;width:820px;--d:.6s">
          <div style="height:420px;overflow:hidden;border:12px solid #f1ead9;box-shadow:0 20px 40px rgba(0,0,0,.6)"><img data-src="${I('room_lit')}" alt="" style="width:100%;height:100%;object-fit:cover;object-position:80% 50%;filter:brightness(.55) saturate(.7)"></div>
          <p class="body sm" style="margin-top:14px"><b>With backup equipment:</b> an inconvenience.</p>
        </div>
        <div class="abs in1" style="left:1000px;top:200px;width:820px;--d:.9s">
          <div style="height:420px;overflow:hidden;border:12px solid #f1ead9;box-shadow:0 20px 40px rgba(0,0,0,.6)"><img data-src="${I('room_dark')}" alt="" style="width:100%;height:100%;object-fit:cover;object-position:80% 50%;filter:brightness(.7)"></div>
          <p class="body sm" style="margin-top:14px"><b>Without it:</b> much greater hardship.</p>
        </div>
        <div class="abs in1" style="left:96px;top:760px;width:1720px;--d:1.5s">
          <p class="body sm">He asked us to consider households that cannot afford backup equipment — a plausible distributional concern that merits investigation, not a measured finding.</p>
          <p class="qual" style="margin-top:18px;font-size:29px">His further allegations — about billing, collusion and an additional tax — are unsupported in our evidence. We did not adopt them as facts; they show how deeply distrust can grow when explanations are missing.</p>
        </div>
        ${illus('Illustration', 'right:28px;top:24px')}
      </div>`,
    script: [
      'Our second resident, from Gulshan, described approximately twelve hours of daily load-shedding, although the durations varied within his account.\nWe could not independently verify those hours.\nBut his description of the burden was clear: UPS costs, battery costs, difficulty pumping water, and concerns about voltage.',
      'He also asked us to consider households that cannot afford backup equipment.\nThat changes the ethical calculation.\nThe same interruption can mean inconvenience for one household and much greater hardship for another.\nHe made several further allegations about billing and collusion. We did not adopt those as facts.\nTheir value to our analysis was different: they showed how deeply distrust can grow when people feel that explanations are missing.'
    ],
    cues: ['Hazy Gulshan rooftops; the self-reported estimate with its qualification attached.', 'ADVANCE → two households side by side — with and without backup; allegations clearly marked as unsupported.'],
    notes: 'Durations: he initially said 12 hours daily, then described ~4, 8, 10 or 12 hours (Appendix C). No bills, technical measurements or appliance-damage records were supplied. His view of the CEO\'s motive was speculation. Consent was confirmed by the group beforehand.'
  },

  /* ------------------------------------------------------------------ 8 */
  { id: 's08', chapter: 'Interviews', title: 'The operational perspective', steps: 2, thumb: 'distribution',
    assets: ['distribution', 'meter', 'ledger', 'kunda', 'tools'], sources: [],
    html: `
      <div class="cam" style="--enter:scale(1.15) translateX(-60px);--rest:scale(1);--rest1:scale(1.08) translateX(-40px);--exit:scale(1.1)">
        ${plate('distribution')}
        ${cut('meter', 1180, 300, 260, 'dim1', '--rot:-4deg;transform:rotate(-4deg)')}
        ${cut('ledger', 1300, 640, 520, 'dim1', 'transform:rotate(5deg)')}
        ${cut('kunda', 980, 80, 520, 'soft dim1')}
        ${cut('tools', 1500, 330, 330, 'dim1')}
      </div>
      <div class="scrim l"></div>
      <div class="scrim all in1" style="background:rgba(8,16,18,.72);--dy:0px"></div>
      <div class="ui">
        <div class="abs out1" style="left:96px;top:70px;width:960px">
          <div class="kicker teal in0" style="--d:.2s">Employee 1 · Assistant Manager, Distribution · anonymised<br>Personal views — not an official KE statement</div>
          <h2 class="h2 in0" style="--d:.5s;margin-top:22px">Not every interruption is the same problem.</h2>
          <ul class="rule-list in0" style="--d:.9s;margin-top:26px">
            <li><span class="k">Scheduled load-shedding</span>A policy decision — needs notice and justification.</li>
            <li><span class="k">Technical fault</span>Needs diagnosis and restoration.</li>
            <li><span class="k">Maintenance</span>Needs planning and advance information.</li>
          </ul>
          <p class="body sm in0" style="--d:1.5s;margin-top:28px">Theft and unpaid bills strain a network that needs continuing expenditure. <b>Electricity supplied without recovery is a real sustainability problem.</b></p>
        </div>
        <div class="abs in1" style="left:120px;top:300px;width:1680px;--d:.7s">
          <p class="quote shadow-t" style="font-size:86px"><span class="mark">“</span>Explaining those challenges does not remove the company’s responsibility.<span class="mark">”</span></p>
          <p class="cite" style="margin-top:28px;font-size:24px">Employee 1, interview, October 4, 2026</p>
          <p class="body sm" style="margin-top:34px;color:var(--teal)">One described the hardship. The other explained the constraints. Both recognised that the paying customer still has a valid claim.</p>
        </div>
        ${illus('Illustration', 'right:28px;bottom:24px')}
      </div>`,
    script: [
      '[Shift to a calmer tone.]\nThen we listened to the distribution employee.\nHis account reminded us that customers may experience every interruption as the same problem, while the causes can differ.\nScheduled load-shedding, a technical fault and maintenance require different responses.\nHe also explained the financial pressure created by theft and unpaid bills.\nA distribution network requires continuing expenditure. Electricity supplied without corresponding recovery creates a real sustainability problem.\nThat explanation deserves consideration.',
      'But he added something equally significant:\n“Explaining those challenges does not remove the company’s responsibility.”\nHere, the customer and the employee moved closer together.\nOne described the hardship.\nThe other explained the constraints.\nBoth recognised that the paying customer still has a valid claim.'
    ],
    cues: ['Night-time distribution world: transformer, meter bank, ledger and an illegal hook; the three causes laid out.', 'ADVANCE → the environment dims; his quotation takes the stage.'],
    notes: 'He supported progressively targeted measures (better metering, targeted disconnections, network improvements) and a resourced compliance plan. He had not reviewed the detailed August order and gave no legal interpretation. He did not speculate about the CEO\'s absence and thought the delegates should have been allowed to explain. This is a reasoned personal view, not an adopted corporate plan.'
  },

  /* ------------------------------------------------------------------ 9 */
  { id: 's09', chapter: 'Interviews', title: 'Communication and accountability', steps: 2, thumb: 'correspondence',
    assets: ['correspondence', 'mic', 'paper_slip'], sources: [],
    html: `
      <div class="cam" style="--enter:scale(1.1) rotate(-1.5deg);--rest:scale(1);--rest1:scale(1.05);--exit:scale(1.08)">
        ${plate('correspondence')}
        ${cut('mic', 1480, 260, 300, 'dim1')}
      </div>
      <div class="scrim l"></div>
      <div class="ui">
        <div class="kicker teal in0" style="position:absolute;left:96px;top:70px;width:1300px;--d:.2s">Employee 2 · people, culture &amp; communication · mid-level, 13 years · anonymised<br>Personal views — not an official company statement</div>
        <div class="abs out1" style="left:96px;top:220px;width:1120px">
          <h2 class="h2 in0" style="--d:.5s">She did not know why the CEO missed the hearing — and refused to speculate.</h2>
          <p class="body in0" style="--d:1.2s;margin-top:26px">That restraint matters: <b>we cannot turn an unknown motive into a proven ethical lapse.</b></p>
          <p class="body sm in0" style="--d:1.8s;margin-top:26px;color:#e3dccb">Delegation can be reasonable — depending on what the summons required, and whether representatives arrived prepared and authorised.</p>
        </div>
        <div class="abs in1" style="left:96px;top:236px;width:1700px;--d:.4s">
          <p class="quote shadow-t" style="font-size:72px"><span class="mark">“</span>Jo masle hal nahi huwe, inhe manna bhi jawabdehi ka hissa hai.<span class="mark">”</span></p>
          <p class="trans shadow-t" style="margin-top:16px;font-size:42px">Acknowledging unresolved problems is also part of accountability.</p>
          <p class="cite" style="margin-top:12px;font-size:24px">Employee 2, interview, October 9, 2026 · English translation by the research team</p>
        </div>
        <svg class="wires in1" viewBox="0 0 1920 1080" style="--d:1s;--dy:0px">
          <path d="M-20,650 Q960,770 1940,650" stroke="#d8cdb4" stroke-width="4" fill="none"/>
        </svg>
        ${['Explanation', 'Authority', 'Commitment', 'Follow-through'].map((w, i) => {
          const x = 96 + i * 440, y = 660 + Math.sin((i + 0.5) / 4 * Math.PI) * 80;
          return `<div class="slip in1" style="left:${x}px;top:${y}px;width:410px;text-align:center;--rot:${[-3, 2, -1.5, 2.5][i]}deg;--dy:-60px;--d:${1.3 + i * 0.3}s;font-family:var(--poster);font-size:42px;text-transform:uppercase;letter-spacing:.02em">${w}</div>`;
        }).join('')}
        <p class="body sm in1" style="position:absolute;left:96px;top:930px;width:1720px;--d:2.6s;text-align:center;color:var(--amber)">“This issue remains. This is what we know. This is what we will do next.”</p>
        <div class="cite in1" style="position:absolute;left:96px;bottom:22px;width:1720px;text-align:center;--d:2.6s">The line above is our paraphrase of what accountable leadership would say, not an interview quotation.</div>
      </div>`,
    script: [
      'The communication employee added another layer.\nShe did not know why the CEO had missed the hearing and refused to speculate.\nThat restraint matters. We cannot turn an unknown motive into a proven ethical lapse.\nShe explained that delegation can be reasonable, depending on what the summons required and whether the representatives arrived prepared and authorised.',
      'She also said that acknowledging unresolved problems is part of accountability.\nIn other words, leadership must be willing to say: this issue remains, this is what we know, and this is what we will do next.\n[Pause.]'
    ],
    cues: ['A desk of unanswered correspondence and a public-hearing microphone — no faces.', 'ADVANCE → her quotation, then the chain explanation → authority → commitment → follow-through pegs onto a wire.'],
    notes: 'She said improvement work had begun but declined to give details; we cannot infer scope, completion or effectiveness. Some communication passages had uncertain speaker attribution; we rely only on answers clearly attributed to her (Appendix E).'
  },

  /* ------------------------------------------------------------------ 10 */
  { id: 's10', chapter: 'Interviews', title: 'Where the accounts meet', steps: 1, thumb: 'room_lit',
    assets: ['room_lit', 'distribution', 'paper_slip'], sources: [],
    html: `
      <div class="cam" style="--enter:none;--rest:none;--exit:scale(1.04)">
        <div class="half left">${plate('room_lit', '', 'object-position:20% 50%')}</div>
        <div class="half right"><img class="plate" data-src="${I('distribution')}" alt="" style="left:-860px"></div>
      </div>
      <div class="scrim all" style="background:rgba(12,11,10,.62)"></div>
      <div class="ui">
        <div class="abs in0" style="left:96px;top:60px;width:1728px;text-align:center;--d:.6s"><div class="kicker">Where the accounts meet</div></div>
        <div class="abs in0" style="left:96px;top:118px;width:780px;--d:1s"><p class="h3 shadow-t" style="font-size:44px">Customers emphasise <span class="amber">immediate hardship.</span></p></div>
        <div class="abs in0" style="left:1044px;top:118px;width:780px;text-align:right;--d:1.2s"><p class="h3 shadow-t" style="font-size:44px">Employees emphasise <span class="teal-t">implementation constraints.</span></p></div>
        ${[['1', 'Paying customers’ fairness concerns are recognised — by the residents, and by Employee 1.'],
           ['2', 'Clear outage explanations and complaint follow-up matter — to both sides.'],
           ['3', 'Accountability requires action after explanation.']].map((r, i) =>
          `<div class="slip in0" style="left:${360 + i * 30}px;top:${270 + i * 165}px;width:1180px;--rot:${[-1, .8, -.6][i]}deg;--d:${1.6 + i * .45}s;font-size:38px;display:grid;grid-template-columns:70px 1fr;align-items:center"><span style="font-family:var(--poster);font-size:64px;color:var(--rust)">${r[0]}</span><span>${r[1]}</span></div>`).join('')}
        <div class="abs in0" style="left:96px;top:800px;width:1728px;--d:3.2s;text-align:center">
          <p class="body sm shadow-t">They also differ: Imad saw the CEO’s absence as reducing trust; Employee 2 refused to infer a motive.</p>
          <p class="qual" style="display:inline-block;text-align:left;margin-top:20px;font-size:28px;width:1500px">Agreement among four access-based interviews is not independent verification of the hearing — and interviewer framing may have shaped some answers.</p>
        </div>
      </div>`,
    script: [
      'Across the interviews, we found a recurring tension.\nCustomers wanted fair treatment and useful answers.\nEmployees described financial pressures, technical limitations and the need for practical implementation.\nOur task was to evaluate both.'
    ],
    cues: ['The warm household world and the teal distribution world slide together; three shared findings, the disagreement and the caveat.'],
    notes: 'Three themes from the report: (1) paying customers object to bearing others’ losses, and Employee 1 recognises it; (2) both sides value clearer cause distinctions and follow-up; (3) accountability = explanation followed by action. We do not count agreement as corroboration or infer prevalence.'
  },

  /* ------------------------------------------------------------------ 11 */
  { id: 's11', chapter: 'Ethical analysis', title: 'Utilitarianism', steps: 2, thumb: 'table_amber',
    assets: ['table_amber', 'scale', 'meter', 'coil', 'tools', 'ups', 'laptop', 'pot', 'bucket', 'clock'], sources: ['sinnott2023'],
    html: `
      <div class="cam" style="--enter:scale(1.12) translateY(40px);--rest:scale(1);--rest1:scale(.96) translateY(-30px);--exit:scale(1.6) translate(-260px,120px);--origin:50% 70%">
        ${plate('table_amber')}
        <div class="mega" style="position:absolute;left:0;right:0;top:40px;text-align:center;font-size:230px;color:rgba(239,230,210,.92)">Utilitarianism</div>
        ${cut('scale', 260, 260, 1400)}
        ${cut('meter', 330, 610, 120, 'soft')}
        ${cut('coil', 430, 680, 170, 'soft')}
        ${cut('tools', 280, 720, 190, 'soft')}
        ${cut('ups', 1330, 640, 230, 'soft')}
        ${cut('laptop', 1480, 690, 190, 'soft')}
        ${cut('pot', 1300, 760, 140, 'soft')}
        ${cut('bucket', 1600, 740, 90, 'soft')}
        ${cut('clock', 1560, 610, 80, 'soft')}
      </div>
      <div class="ui">
        <p class="body in0" style="position:absolute;left:96px;top:262px;width:1728px;text-align:center;--d:.6s;font-size:40px">Which response produces the best overall consequences — <b>for everyone affected?</b></p>
        <div class="abs in0 out1" style="left:96px;top:905px;width:720px;--d:1.1s">
          <div class="kicker">Company side</div>
          <p class="body sm shadow-t">Recovery · maintenance · sustainable future supply for the city</p>
        </div>
        <div class="abs in0 out1" style="left:960px;top:905px;width:870px;--d:1.4s;text-align:right">
          <div class="kicker">Household side</div>
          <p class="body sm shadow-t">Backup batteries · interrupted work · cooking · water pumping · time seeking information · unequal capacity to cope</p>
        </div>
        <p class="cite in0 out1" style="position:absolute;left:96px;top:322px;width:700px;text-align:left;--d:2s;color:var(--teal)">The scale is deliberately unweighed: no reliable figures exist to weigh these consequences, and we do not invent them.</p>
        <div class="abs in1" style="left:0;top:700px;width:1920px;height:380px;background:linear-gradient(to top, rgba(14,12,10,.96) 60%, rgba(14,12,10,0));--dy:40px"></div>
        <div class="abs in1" style="left:96px;top:800px;width:1728px;--d:.4s">
          <p class="h3">A recovery figure cannot, by itself, show that the overall outcome is good.</p>
          <p class="body sm" style="margin-top:14px">Compare collective outages with <b>targeted enforcement, better metering and network improvements</b> — using actual costs and service outcomes.</p>
          <p class="cite" style="margin-top:10px">Theory: Sinnott-Armstrong (2023), Consequentialism, <i>Stanford Encyclopedia of Philosophy</i></p>
        </div>
      </div>`,
    script: [
      'We tested the case through three ethical theories.\nFirst, utilitarianism.\nThis asks us to consider the overall consequences.\nKE has a serious argument here: a financially sustainable network benefits the city. Ignoring theft and non-payment could undermine maintenance and future supply.\nBut an ethical calculation must also include costs borne outside the company.\nBackup batteries. Interrupted work. Difficulty cooking. Water pumping. Time spent seeking information.',
      'A recovery figure cannot tell us, by itself, whether the overall outcome is good.\nWe would need to compare collective outages with alternatives such as targeted enforcement, better metering and network improvements.'
    ],
    cues: ['A brass balance scale: company considerations on one pan, household burdens on the other — unweighed.', 'ADVANCE → the conclusion and the alternatives to compare.'],
    notes: 'Report: the available evidence cannot establish that collective outages maximise welfare. A defensible assessment compares targeted enforcement, infrastructure investment and outage management using actual costs and service outcomes. No numbers are invented.'
  },

  /* ------------------------------------------------------------------ 12 */
  { id: 's12', chapter: 'Ethical analysis', title: 'Deontology', steps: 2, thumb: 'street_dark',
    assets: ['room_lit', 'bill', 'street_dark'], sources: ['alexander2024', 'nepra2026'],
    html: `
      <div class="cam" style="--enter:scale(1.2);--rest:none;--exit:scale(1.05)">
        <div class="layer closeup">
          <img class="plate" data-src="${I('room_lit')}" alt="" style="transform:scale(1.9);transform-origin:40% 96%;filter:brightness(.6)">
          ${cut('bill', 240, 160, 640, '', 'transform:rotate(-4deg)')}
          <div class="stamp" style="left:330px;top:640px;font-size:96px">Paid.<br>On time.</div>
        </div>
        <div class="layer wide">
          ${plate('street_dark')}
          <div style="position:absolute;left:${H[2].x - 110}px;top:${H[2].top - 30}px;width:220px;height:${905 - H[2].top + 30}px;border:5px solid var(--amber);box-shadow:0 0 40px rgba(240,173,69,.6)"></div>
          <div class="htag" style="left:${H[2].x}px;top:820px">Paid</div>
          <div style="position:absolute;left:40px;right:40px;top:960px;height:4px;background:var(--cream)"></div>
          <div style="position:absolute;left:40px;top:944px;width:4px;height:36px;background:var(--cream)"></div>
          <div style="position:absolute;right:40px;top:944px;width:4px;height:36px;background:var(--cream)"></div>
          <div class="mega" style="position:absolute;left:0;right:0;top:982px;text-align:center;font-size:64px">One feeder</div>
        </div>
      </div>
      <div class="scrim r out1"></div>
      <div class="scrim t in1" style="height:62%;--dy:0px"></div>
      <div class="ui">
        <div class="abs out1" style="left:1010px;top:110px;width:820px">
          <div class="mega in0" style="--d:.4s;font-size:170px">Deontology</div>
          <h2 class="h2 in0" style="--d:1s;margin-top:20px">What does a paying customer have a right to expect?</h2>
          <p class="body sm in0" style="--d:1.8s;margin-top:26px">If I have paid for my service, what justifies making my access depend on someone else’s conduct?</p>
        </div>
        <div class="abs in1" style="left:96px;top:60px;width:1728px;--d:1.4s">
          <h2 class="h2 shadow-t">A feeder is a convenient operational unit — <span class="amber">not a unit of individual responsibility.</span></h2>
          <p class="body sm shadow-t" style="margin-top:20px;width:1500px">Using compliant households’ deprivation as leverage against others’ default risks treating them as instruments. Targeting identified theft or default better respects individual responsibility — if procedures are lawful and reliable.</p>
          <p class="cite" style="margin-top:14px">An ethical argument (Alexander &amp; Moore, 2024). We claim no legal right beyond what NEPRA’s direction establishes.</p>
        </div>
      </div>`,
    script: [
      'Second, deontology.\nThis asks what duties are owed to individuals, even when a policy offers wider benefits.\nIf I have paid for my service, what justifies making my access depend on someone else’s conduct?',
      'A feeder may be a convenient operational unit. It does not mean every household on that feeder carries the same responsibility.\nThat is the strongest ethical objection in our case: the gap between collective loss measurement and individual fair treatment.'
    ],
    cues: ['Back to the paid bill, close up.', 'ADVANCE → the camera pulls out of the bill to one lit-up paying house inside a dark feeder.'],
    notes: 'This is the case’s strongest objection. The duty to explain also matters: a truthful account of what is known, what is uncertain and when an update will follow — without promising restoration times staff cannot support.'
  },

  /* ------------------------------------------------------------------ 13 */
  { id: 's13', chapter: 'Ethical analysis', title: 'Virtue ethics', steps: 1, thumb: 'correspondence',
    assets: ['correspondence', 'mic', 'envelope', 'paper_slip'], sources: ['hursthouse2026'],
    html: `
      <div class="cam" style="--enter:scale(1.1) rotate(2deg);--rest:scale(1.02) rotate(.5deg);--exit:scale(1.06)">
        ${plate('correspondence', '', 'filter:hue-rotate(-10deg) saturate(1.1)')}
        ${cut('envelope', 1460, 70, 380, '', 'transform:rotate(8deg)')}
        ${cut('mic', 1580, 520, 250)}
        <div class="stamp teal" style="left:1450px;top:140px;font-size:54px;transform:rotate(-14deg)">Open</div>
      </div>
      <div class="scrim all" style="background:rgba(10,18,18,.7)"></div>
      <div class="ui">
        <div class="mega in0" style="position:absolute;left:96px;top:56px;font-size:170px;--d:.3s">Virtue ethics</div>
        <p class="body in0" style="position:absolute;left:96px;top:238px;width:1300px;--d:.8s">What do honesty, responsibility and practical judgement look like <b>in behaviour?</b></p>
        ${[['Honesty', 'Acknowledges hardship. Distinguishes what is known from what is uncertain.'],
           ['Responsibility', 'Follows a complaint through to a meaningful response — after the cameras leave.'],
           ['Practical judgement', 'Weighs customer hardship and technical reality together.']].map((r, i) =>
          `<div class="slip in0" style="left:${96 + i * 18}px;top:${350 + i * 168}px;width:860px;--rot:${[-1.2, .9, -.7][i]}deg;--d:${1.3 + i * .4}s"><div class="kicker">${r[0]}</div>${r[1]}</div>`).join('')}
        <div class="abs in0" style="left:1060px;top:370px;width:770px;--d:2.8s;border-left:5px solid var(--teal);padding-left:28px">
          <div class="kicker teal">The standard applies to the committee too</div>
          <p class="body sm" style="margin-top:10px">Public scrutiny needs difficult questions — and a fair opportunity to respond. Imad and Employee 1 both believed the delegates should have been allowed to answer.</p>
          <p class="body sm" style="margin-top:16px;color:var(--amber)">Expelling representatives may communicate anger. Anger alone does not produce an explanation or restore electricity.</p>
        </div>
        <p class="cite in0" style="position:absolute;left:96px;bottom:36px;--d:3s">Theory: Hursthouse &amp; Pettigrove (2026), Virtue ethics, <i>Stanford Encyclopedia of Philosophy</i></p>
      </div>`,
    script: [
      'Third, virtue ethics.\nThis asks what honesty, responsibility and practical judgement look like in the company’s behaviour.\nDoes leadership acknowledge hardship?\nDoes it distinguish what is known from what is uncertain?\nDoes it follow a complaint through to a meaningful response?\nAnd this standard also applies to the committee.\nSeveral interviewees believed the delegates should have been allowed to answer.\nPublic scrutiny needs difficult questions. It also needs a fair opportunity to respond.\nExpelling representatives may communicate anger, but anger alone does not produce an explanation or restore electricity.'
    ],
    cues: ['Correspondence, an unanswered complaint stamped OPEN, the hearing microphone; three virtues as behaviours, then the committee standard.'],
    notes: 'Script says “several interviewees”; the report specifies Imad and Employee 1 — the slide names them. KE still bears responsibility for adequate representation and follow-through; the committee bears responsibility for scrutiny that produces a usable record.'
  },

  /* ------------------------------------------------------------------ 14 */
  { id: 's14', chapter: 'Ethical analysis', title: 'Comparing the theories', steps: 1, thumb: 'dusk_sky',
    assets: ['dusk_sky', 'paper_sheet'], sources: ['sinnott2023', 'alexander2024', 'hursthouse2026'],
    html: `
      <div class="cam" style="--enter:scale(1.08);--rest:scale(1.02);--exit:scale(1.1)">
        ${plate('dusk_sky', '', 'filter:brightness(.55)')}
      </div>
      <div class="ui">
        <div class="kicker in0" style="position:absolute;left:96px;top:56px;--d:.2s">Comparing the theories · how they work together</div>
        ${[['Deontology', 'sets the boundary', 'Duties constrain unfair treatment of compliant customers.', '#9cc9c2', 96, 120],
           ['Utilitarianism', 'chooses the remedy', 'Consequences help choose workable alternatives.', '#f0c27a', 400, 345],
           ['Virtue ethics', 'guides implementation', 'Character and practical judgement — candour, follow-through.', '#efe6d2', 704, 570]].map((p, i) =>
          `<div class="plane in0" style="left:${p[4]}px;top:${p[5]}px;--d:${.6 + i * .5}s;--dx:-80px;--dy:0px;background-image:url('${I('paper_sheet')}');background-color:${p[3]};background-blend-mode:multiply">
             <div style="display:flex;align-items:baseline;gap:24px"><span class="mega" style="font-size:84px;color:var(--ink)">${p[0]}</span><span class="h3 it" style="font-size:44px;color:#7a3a1c">${p[1]}</span></div>
             <p class="body" style="color:var(--ink);margin-top:6px;font-size:36px">${p[2]}</p></div>`).join('')}
        <div class="abs in0" style="left:96px;top:830px;width:1728px;--d:2.4s;border-top:4px solid var(--amber);padding-top:20px">
          <p class="h3" style="font-size:48px">Financial sustainability matters — <span class="amber">but it cannot automatically override the compliant customer’s claim.</span></p>
          <p class="body sm" style="margin-top:12px;color:#e3dccb">Where they pull apart: consequences may favour a gradual transition; duties limit how long innocent households bear its costs.</p>
        </div>
      </div>`,
    script: [
      '[Bridging line — not in the supplied script; optional, ~20 seconds, drawn from the report:]\nThe three approaches overlap but are not interchangeable. Duties set the boundary on how compliant customers may be treated. Consequences help us choose workable alternatives. Character and practical judgement guide how the remedy is implemented. Financial sustainability matters — but it cannot automatically override the compliant customer’s claim.'
    ],
    cues: ['Three painted planes slide in at different depths — boundary, remedy, implementation — over the tension line.'],
    notes: 'Report: “Our preferred response uses duties as a boundary, consequences to choose workable alternatives and practical judgement to guide implementation.” Limitation: targeted measures need resources and enforcement support — a reason for a credible plan, not an indefinite exemption from fairness. The supplied script moves directly from virtue ethics to evaluation; the bridge is optional.'
  },

  /* ------------------------------------------------------------------ 15 */
  { id: 's15', chapter: 'Evaluation', title: 'What KE reports doing', steps: 1, thumb: 'desk',
    assets: ['desk', 'tent', 'kunda', 'ledger', 'paper_slip'], sources: ['ke2026b'],
    html: `
      <div class="cam" style="--enter:scale(1.15) rotate(-2deg);--rest:scale(1.02);--exit:scale(.5) translate(-500px,-300px)">
        ${plate('desk', '', 'filter:brightness(.62)')}
        ${cut('kunda', 640, 170, 520, 'soft', 'transform:rotate(-4deg)')}
        ${cut('tent', 110, 400, 520, '', 'transform:rotate(-3deg)')}
        ${cut('ledger', 1250, 420, 560, '', 'transform:rotate(4deg)')}
      </div>
      <div class="ui">
        <div class="stamp teal in0" style="left:96px;top:60px;font-size:58px;--rot:-3deg;--d:.4s;--ds:1.4;--dy:0px;mix-blend-mode:normal;color:#9fd6cf;border-color:#9fd6cf">Company-reported · 2025 activities</div>
        <div class="slip in0" style="left:700px;top:520px;width:520px;--rot:1.5deg;--d:1s"><div class="mega" style="font-size:96px;color:var(--ink)">25,000+</div>anti-theft drives</div>
        <div class="slip in0" style="left:120px;top:770px;width:520px;--rot:-2deg;--d:1.4s"><div class="mega" style="font-size:96px;color:var(--ink)">310</div>customer facilitation camps</div>
        <div class="slip in0" style="left:1250px;top:250px;width:580px;--rot:2deg;--d:1.8s"><div class="mega" style="font-size:90px;color:var(--ink)">PKR 409 million</div>in recoveries associated with the initiatives</div>
        <div class="abs in0" style="left:1240px;top:790px;width:600px;--d:2.4s;background:rgba(14,12,10,.86);padding:20px 26px">
          <p class="body sm" style="font-size:31px">Published January 2, 2026. These activities <b>predate the September 2026 hearing</b> — they are not a response to it.</p>
        </div>
        <p class="cite in0" style="position:absolute;left:96px;bottom:22px;width:1728px;--d:2.6s;background:rgba(14,12,10,.7);padding:6px 12px">Source: K-Electric. (2026b, January 2). Year in review: K-Electric shows steady progress during 2025. Company-reported outputs; not independently verified; not the net return on the camps.</p>
        ${illus('Illustrative objects', 'right:28px;top:24px')}
      </div>`,
    script: [
      '[Move into the evaluation.]\nWe also examined what KE says it has actually done.\nIts published review of 2025 reports more than 25,000 anti-theft drives, 310 customer facilitation camps and recoveries of PKR 409 million associated with those initiatives.\nThose are company-reported figures. They predate the September hearing.\nThey give us evidence of activity and a reason to take targeted recovery efforts seriously.'
    ],
    cues: ['Evidence collage on the desk: hook wire, facilitation tent, ledger — each with its company-reported figure.'],
    notes: 'Report: these challenge an interpretation that KE has taken no practical action. PKR 409m is not the net return on the camps — delivery costs and other initiatives are not isolated. Their ethical adequacy depends on whether they reduce interruptions for compliant households and improve complaint resolution.'
  },

  /* ------------------------------------------------------------------ 16 */
  { id: 's16', chapter: 'Evaluation', title: 'Activity versus outcome', steps: 1, thumb: 'room_dark',
    assets: ['room_dark', 'phone'], sources: ['ke2026a'],
    html: `
      <div class="cam" style="--enter:scale(.6) translate(300px,200px);--rest:scale(1.04);--exit:scale(1.1)">
        ${plate('room_dark')}
        ${cut('phone', 300, 150, 420, '', 'transform:rotate(-5deg)')}
      </div>
      <div class="scrim r" style="width:64%"></div>
      <div class="ui">
        <div class="abs in0" style="left:960px;top:70px;width:870px;--d:.4s">
          <h2 class="h2">Did paying customers experience better service?</h2>
          <p class="body sm" style="margin-top:14px;color:#e3dccb">The cited activity figures do not establish that outcome for our interviewees.</p>
        </div>
        ${[['1', 'A communication channel exists.', 'An app can have many users…'],
           ['2', 'Accurate information reaches the customer.', '…while a customer still receives no useful outage update.'],
           ['3', 'The underlying problem is resolved.', 'Connected — but different achievements.']].map((r, i) =>
          `<div class="ach in0" style="top:${330 + i * 170}px;--d:${1.2 + i * .5}s"><span class="n">${r[0]}</span><div><p class="h3" style="font-size:40px">${r[1]}</p><p class="body sm" style="color:var(--teal);font-size:30px">${r[2]}</p></div></div>`).join('')}
        <div class="abs in0" style="left:96px;top:870px;width:1728px;--d:3s;background:rgba(14,12,10,.88);padding:22px 30px">
          <p class="body sm" style="font-size:32px"><b>98.2% system reliability, FY25</b> — company-reported, aggregate (K-Electric, 2026). It cannot be equated with uninterrupted supply at every home, and household outage hours cannot be derived from it.</p>
        </div>
        ${illus('Illustration', 'left:28px;top:24px')}
      </div>`,
    script: [
      'But the next question is essential:\nDid that activity produce better service for compliant customers?\nThe cited figures do not establish that outcome for our interviewees.\nSimilarly, KE reports aggregate system reliability and growing digital engagement.\nThose indicators can coexist with poor experiences in particular neighbourhoods.\nAn app can have many users while a customer still receives no useful outage update.\nSo we distinguished three things: having a communication channel, providing accurate information through it, and resolving the underlying problem.\nThey are connected, but they are different achievements.'
    ],
    cues: ['The evidence collage collapses back into the dark household; three distinct achievements light up beside the phone.'],
    notes: 'Imad’s outage missing from the app raises a specific question about local information accuracy — it does not disprove all reported digital progress. The 98.2% figure’s definitions and coverage are not examined in our sources. Citation discrepancy: the report cites this as “K-Electric, 2026s”, which matches no reference-list entry; most likely 2026a (sustainability report release). Verify before submission.'
  },

  /* ------------------------------------------------------------------ 17 */
  { id: 's17', chapter: 'Evaluation', title: 'The regulatory record', steps: 2, thumb: 'desk',
    assets: ['desk', 'paper_sheet'], sources: ['nepra2026', 'nepra2025'],
    html: `
      <div class="cam" style="--enter:scale(1.1) rotate(1deg);--rest:scale(1);--rest1:scale(1.03) translateX(-20px);--exit:scale(1.08)">
        ${plate('desk', '', 'filter:brightness(.5) saturate(.8)')}
      </div>
      <div class="ui">
        <div class="slip sheet in0" style="left:96px;top:60px;width:860px;height:960px;--rot:-1.2deg;--d:.3s">
          <div class="kicker" style="color:#a3311f">Paraphrase — not the document text</div>
          <p style="font-family:var(--mono);font-size:22px;margin:16px 0 0;color:#4a443c">NATIONAL ELECTRIC POWER REGULATORY AUTHORITY</p>
          <p class="h3" style="font-size:40px;margin-top:10px;color:var(--ink)">Order under Section 27C of the NEPRA Act 1997 — K-Electric</p>
          <p style="font-family:var(--mono);font-size:24px;margin:10px 0 22px;color:#7a3a1c">August 31, 2026</p>
          <p style="font-size:33px;line-height:1.3;margin:0">Directed KE to cease:</p>
          <ul style="font-size:33px;line-height:1.3;margin:10px 0 18px;padding-left:34px">
            <li style="margin-bottom:10px">unannounced, unscheduled or excessive load-shedding; and</li>
            <li>feeder-level load-shedding based on aggregate technical and commercial losses.</li>
          </ul>
          <p style="font-size:31px;line-height:1.3;margin:0">It challenged imposing interruptions on compliant customers because of others’ defaults or theft.</p>
          <p class="cite" style="margin-top:22px;font-size:21px">Our paraphrase of NEPRA (2026), as summarised in our report. Full reference in the evidence section.</p>
        </div>
        <div class="abs out1" style="left:1060px;top:150px;width:770px">
          <h2 class="h2 in0" style="--d:1.2s">More than a disagreement.</h2>
          <p class="body in0" style="--d:1.8s;margin-top:22px">A documented regulatory challenge to the practice.</p>
          <p class="body sm in0" style="--d:2.4s;margin-top:30px;color:#e3dccb">We treat it as the regulator’s finding and direction. We do not claim a final court outcome.</p>
        </div>
        <div class="slip sheet in1" style="left:1000px;top:110px;width:840px;height:880px;--rot:1.5deg;--dx:120px;--dy:0px;--d:.2s">
          <div class="kicker" style="color:#a3311f">Prior regulatory history</div>
          <p style="font-size:31px;line-height:1.3;margin:10px 0 0">The August order refers to a <b>prior PKR 50 million fine</b> for related violations — <i>not</i> a new penalty arising from the September hearing.</p>
          <div class="kicker" style="color:#a3311f;margin-top:36px">Alternative explanations</div>
          <p style="font-size:30px;line-height:1.3;margin:10px 0 0">In a July 11, 2025 complaint decision, KE’s account linked outages to losses and noted that damaged equipment and anti-theft disconnections could affect how interruptions are understood. Faults and maintenance also interrupt supply.</p>
          <p style="font-size:30px;line-height:1.3;margin:18px 0 0">KE appealed NEPRA’s earlier decision; we have not established that appeal’s current disposition. Our interviews cannot establish the cause of any particular outage.</p>
          <p class="cite" style="margin-top:20px;font-size:21px">NEPRA (2026); NEPRA (2025, July 11)</p>
        </div>
      </div>`,
    script: [
      'The regulatory evidence also matters.\nNEPRA’s August 2026 order directed KE to stop feeder-level loss-based load-shedding and unannounced, unscheduled or excessive interruptions.\nThat makes this more than a disagreement between frustrated customers and a commercial organisation.\nThere is a documented regulatory challenge to the practice.',
      'We have treated it as the regulator’s finding and direction, while avoiding unsupported claims about final court outcomes.\n[Optional, from the report:] The order also refers to a prior PKR 50 million fine — earlier history, not a penalty for the hearing. And KE’s own account points to alternative explanations: faults, damaged equipment, maintenance and anti-theft disconnections.'
    ],
    cues: ['A clearly labelled paraphrase of the August 31, 2026 order on the desk.', 'ADVANCE → a second sheet: prior PKR 50m fine as history, and alternative explanations.'],
    notes: 'Script says “August 2026 order”; the report dates it August 31, 2026 — shown on screen. We could not retrieve the PDF for this build, so no wording is quoted or highlighted. The July 2025 decision records KE’s explanations; these are not findings about the two neighbourhoods interviewed.'
  },

  /* ------------------------------------------------------------------ 18 */
  { id: 's18', chapter: 'Evaluation', title: 'Consequences', steps: 1, thumb: 'street_dark',
    assets: ['street_dark'], sources: ['nepra2026', 'ke2026b'],
    html: `
      <div class="cam" style="--enter:scale(1.1);--rest:scale(1.02);--exit:scale(1.04)">
        ${plate('street_dark')}
        <svg class="wires" viewBox="0 0 1920 1080">
          ${[160, 320, 520, 760].map((r, i) => `<circle cx="${TX[0]}" cy="${TX[1]}" r="${r}" fill="none" stroke="#f0ad45" stroke-width="3" opacity="${0.5 - i * 0.1}"/>`).join('')}
        </svg>
      </div>
      <div class="scrim t" style="height:78%;background:linear-gradient(to bottom, rgba(12,11,10,.94) 0%, rgba(12,11,10,.85) 70%, rgba(12,11,10,0) 100%)"></div>
      <div class="ui">
        <div class="kicker in0" style="position:absolute;left:96px;top:50px;--d:.2s">Consequences · ● reported or documented &nbsp; ○ risk, not yet measured</div>
        ${[['Financial', ['● Theft and non-payment constrain resources for supply (company explanation).', '● Prior PKR 50 million fine — regulatory history (NEPRA, 2026).', '○ Targeted controls and upgrades need funding; compliance cost not estimated.']],
           ['Household', ['● UPS and battery spending, interrupted work and internet, cooking, water pumping, time seeking updates.', '○ Households without backup may carry far more of the hardship.']],
           ['Reputational', ['● Distrust of explanations and leadership in customer accounts.', '○ Unsupported suspicions spread where explanations are missing.']]].map((c, i) =>
          `<div class="abs in0" style="left:${96 + i * 584}px;top:110px;width:540px;--d:${.6 + i * .5}s"><div class="mega" style="font-size:74px;color:${['var(--amber)', 'var(--cream)', 'var(--teal)'][i]}">${c[0]}</div>${c[1].map(t => `<p class="body sm" style="font-size:30px;margin-top:14px">${t}</p>`).join('')}</div>`).join('')}
        <div class="abs in0" style="left:96px;top:960px;width:1728px;--d:2.4s;background:rgba(14,12,10,.88);padding:16px 26px">
          <p class="body sm" style="font-size:31px"><b>Limitation:</b> four interviews cannot quantify citywide effects. No company-wide loss, household income loss or appliance-damage figure is estimated here.</p>
        </div>
      </div>`,
    script: [
      '[Bridging passage — not in the supplied script; optional, ~25 seconds, drawn from the report:]\nThe consequences run in several directions. Financially, theft and non-payment constrain the company, and targeted controls cost money. Households absorb their own costs — batteries, interrupted work, water and time — and those without backup may carry more of the hardship. Reputationally, missing explanations feed distrust. These are reported burdens and risks; four interviews cannot quantify them across the city.'
    ],
    cues: ['Ripples spread from the feeder transformer across the dark street; three consequence columns separate reported burdens from risks.'],
    notes: 'Report section “Financial, Reputational and Other Consequences”. No estimate of KE’s total loss, compliance cost, financial damage from the hearing, or stock-price effect. The PKR 409m recovery is a reason to consider engagement alongside enforcement — not a net return. Household costs are reported burdens, not quantified estimates.'
  },

  /* ------------------------------------------------------------------ 19 */
  { id: 's19', chapter: 'Recommendations', title: 'Recommendations 1–2', steps: 2, thumb: 'street_dark',
    assets: ['street_dark'], sources: ['nepra2026'],
    html: `
      <div class="cam" style="--enter:scale(1.08) translateX(80px);--rest:scale(1) translateX(240px);--rest1:scale(1) translateX(240px);--exit:scale(1) translateX(240px);--origin:60% 50%">
        ${plate('street_dark', '', 'filter:brightness(.8)')}
        <svg class="wires" viewBox="0 0 1920 1080">
          ${feederPaths('wire draw d0', i => `stroke:#8fc3bc;stroke-width:5;--len:1600;--d:${(0.6 + i * 0.12).toFixed(2)}s`)}
          ${feederPaths('wire draw d1', i => `stroke:#f0ad45;stroke-width:3;--len:1600;--d:${(0.2 + i * 0.1).toFixed(2)}s;filter:drop-shadow(0 0 5px rgba(240,173,69,.7))`)}
        </svg>
      </div>
      <div class="scrim l" style="width:60%"></div>
      <div class="ui">
        <div class="stamp teal" style="right:96px;top:50px;font-size:42px;transform:rotate(-4deg);color:#9fd6cf;border-color:#9fd6cf;mix-blend-mode:normal">Proposed — not implemented</div>
        ${recBlock('01', 'Targeted loss reduction and a costed compliance programme', [
          ['Who', 'Distribution and regulatory teams; finance costs it before expansion.'],
          ['When', 'Within 90 days: pilot areas, technical requirements, barriers.'],
          ['Measure', 'Recovery alongside interruption hours for compliant customers.'],
          ['Guardrail', 'A pilot must not postpone compliance with binding directions.']], 'in0 out1')}
        ${recBlock('02', 'Clearer outage updates', [
          ['Who', 'Customer service with distribution.'],
          ['When', 'Within 30 days.'],
          ['What', 'Say whether it is scheduled load-shedding, maintenance or a fault. If restoration is uncertain, say so — and give a next-update time. Keep phone and on-ground channels.'],
          ['Measure', 'Update accuracy: communicated vs actual restoration, checked monthly.']], 'in1')}
        <div class="abs out1" style="inset:0">${rail([3])}</div>
        <div class="abs in1" style="inset:0;--dy:0px">${rail([1])}</div>
      </div>`,
    script: [
      '[Slow down slightly.]\nOur recommendations follow directly from what we found.\nFirst, reduce losses through more targeted measures.\nIdentify where the losses arise, assess metering and network requirements, and cost the interventions.\nMeasure whether recovery improves alongside fewer interruptions for paying customers.\nA pilot must not become a reason to postpone compliance with binding directions.',
      'Second, improve outage information.\nTell customers whether the issue is scheduled load-shedding, maintenance or a fault.\nIf the restoration time is uncertain, say so—and give a time for the next update.\nThat addresses Imad’s request for candour without making promises the company cannot support.'
    ],
    cues: ['Teal pencil lines start re-drawing the feeder over the dark street (a proposal, not a repair). Rec 1, with the 90-day milestone lit.', 'ADVANCE → Rec 2 replaces it; amber lines trace over the teal; 30-day milestone lit.'],
    notes: 'Implementation begins with a baseline of interruption hours, repeat complaints and payment status using anonymised records. Regulatory team checks compliance; distribution checks feasibility; finance costs interventions. Timelines are proposed management deadlines — not regulatory permissions or predictions.'
  },

  /* ------------------------------------------------------------------ 20 */
  { id: 's20', chapter: 'Recommendations', title: 'Recommendations 3–4', steps: 2, thumb: 'street_lit',
    assets: ['street_dark'], sources: [],
    html: `
      <div class="cam" style="--enter:scale(1) translateX(240px);--rest:scale(1) translateX(240px);--rest1:scale(1.02) translateX(240px);--exit:scale(1.06);--origin:60% 50%">
        ${plate('street_dark', '', 'filter:brightness(.8)')}
        <svg class="wires" viewBox="0 0 1920 1080">
          ${feederPaths('wire', () => 'stroke:#8fc3bc;stroke-width:5')}
          ${feederPaths('wire', () => 'stroke:#f0ad45;stroke-width:3;filter:drop-shadow(0 0 5px rgba(240,173,69,.7))')}
          <path class="wire draw d0" style="stroke:#efe6d2;stroke-width:4;stroke-dasharray:2200;--len:2200;--d:.6s" d="M-20,186 Q400,230 815,226 L1115,226 Q1500,230 1940,196"/>
          <path class="wire draw d1" style="stroke:#efe6d2;stroke-width:4;stroke-dasharray:2200;--len:2200" d="M-20,266 Q400,310 855,306 L1075,306 Q1500,310 1940,276"/>
        </svg>
      </div>
      <div class="scrim l" style="width:60%"></div>
      <div class="ui">
        <div class="stamp teal" style="right:96px;top:50px;font-size:42px;transform:rotate(-4deg);color:#9fd6cf;border-color:#9fd6cf;mix-blend-mode:normal">Proposed — not implemented</div>
        ${recBlock('03', 'Give recurring complaints an owner', [
          ['Who', 'The complaint function.'],
          ['When', 'Within 60 days; publish aggregate resolution measures.'],
          ['What', '“Forwarded” must lead to a next step, a responsible function and a substantive response. Employees can raise fairness concerns safely, without retaliation.'],
          ['Measure', 'Repeat complaints, time to a substantive response, customer-confirmed resolution — not closure counts.']], 'in0 out1')}
        ${recBlock('04', 'Prepared, authorised engagement — and documented follow-up', [
          ['Who', 'KE leadership, with the committee.'],
          ['When', 'Agreed before the next hearing; reviewed over the following quarter.'],
          ['What', 'The CEO or an authorised representative brings evidence, outstanding issues and written commitments; reasons for substitution explained. The committee tests answers and documents follow-up.'],
          ['Measure', 'Documented commitments and service outcomes — not attendance alone.']], 'in1')}
        <div class="abs out1" style="inset:0">${rail([2])}</div>
        <div class="abs in1" style="inset:0;--dy:0px">${rail([4, 5])}</div>
      </div>`,
    script: [
      'Third, give recurring complaints an owner.\nA complaint marked “forwarded” should have a next step, a responsible function and a substantive response.\nMeasure repeat complaints and whether customers confirm resolution, rather than relying only on closure counts.\nEmployees should also be able to raise recurring fairness concerns safely.',
      'Fourth, make public accountability useful.\nThe CEO or an appropriately authorised representative should arrive with evidence, outstanding issues and commitments that can be reviewed.\nThe committee should test those answers and document follow-up.\nThe proposed timelines in our report are management deadlines. Their purpose is to make progress visible and assessable.'
    ],
    cues: ['Rec 3; a main line is redrawn; 60-day milestone lit.', 'ADVANCE → Rec 4; second main line; next-hearing and quarterly review lit. Houses stay dark — nothing is shown as implemented.'],
    notes: 'A quarterly review should examine whether recovery improves alongside fewer disruptions for compliant customers; improving only one measure leaves the central tension unresolved.'
  },

  /* ------------------------------------------------------------------ 21 */
  { id: 's21', chapter: 'Conclusion', title: 'Limits and conclusion', steps: 2, thumb: 'dusk_sky',
    assets: ['dusk_sky'], sources: [],
    html: `
      <div class="cam" style="--enter:scale(1.1) translateY(30px);--rest:scale(1.02);--rest1:scale(1.06) translateY(-20px);--exit:scale(1.1)">
        ${plate('dusk_sky', '', 'filter:brightness(.6)')}
      </div>
      <div class="scrim all" style="background:rgba(12,11,10,.5)"></div>
      <div class="ui">
        <div class="abs out1" style="left:96px;top:90px;width:1500px">
          <div class="kicker in0" style="--d:.2s">Research limitations</div>
          <h1 class="h1 in0" style="--d:.5s;margin-top:16px">Four interviews cannot represent all of Karachi.</h1>
          <ul class="rule-list in0" style="--d:1.2s;margin-top:34px;width:1400px">
            <li><span class="k">They cannot</span>establish the cause of every outage, or quantify the city’s economic losses. The sample was access-based, and interviewer framing may have shaped some answers.</li>
            <li><span class="k">They can</span>show how the policy is experienced — and where the company’s explanation leaves an ethical question unanswered.</li>
          </ul>
        </div>
        <div class="abs in1" style="left:96px;top:120px;width:1728px;--d:.4s">
          <p class="body" style="color:#e3dccb">We began with a household that had paid its bill. We then heard why the company struggles to recover what it is owed. <b>A fair response has to take both seriously.</b></p>
          <div class="kicker" style="margin-top:70px">Our conclusion</div>
          <p class="h1" style="margin-top:14px;font-size:84px">Financial sustainability should guide the design of the remedy.</p>
          <p class="h1 it amber" style="margin-top:20px;font-size:84px">It cannot, on its own, settle whether the burden has been distributed fairly.</p>
        </div>
      </div>`,
    script: [
      '[Pause before the conclusion.]\nFour interviews cannot represent all of Karachi.\nThey cannot establish the cause of every outage or quantify the city’s economic losses.\nWhat they can do is show how the policy is experienced—and where the company’s explanation leaves an ethical question unanswered.',
      'We began with a household that had paid its bill.\nWe then heard why the company struggles to recover what it is owed.\nA fair response has to take both seriously.\nOur conclusion is that financial sustainability should guide the design of the remedy. It cannot, on its own, settle whether the burden has been distributed fairly.\nThe next hearing will matter.\nThe explanation will matter.'
    ],
    cues: ['Dusk over the city: the limitations.', 'ADVANCE → the balanced conclusion.'],
    notes: 'Operational records, complaint histories and a broader sample would be needed to test generalisability. The CEO’s motive remains unknown; removal of representatives does not prove misconduct.'
  },

  /* ------------------------------------------------------------------ 22 */
  { id: 's22', chapter: 'Conclusion', title: 'Return to the household', steps: 1, thumb: 'room_dark',
    assets: ['room_dark', 'bill'], sources: [],
    html: `
      <div class="cam" style="--enter:scale(1.14);--rest:scale(1.03);--exit:scale(1.03);--origin:30% 70%">
        ${plate('room_dark')}
      </div>
      <div class="scrim r" style="width:70%"></div>
      <div class="ui">
        ${cut('bill', 110, 560, 400, 'in0', '--rot:-7deg;--d:.4s;filter:brightness(.8) drop-shadow(0 18px 22px rgba(0,0,0,.5))')}
        <div class="stamp in0" style="left:160px;top:790px;font-size:62px;--rot:-11deg;--d:1s;--dy:0px;opacity:.75">Paid.<br>On time.</div>
        <div class="abs in0" style="left:820px;top:250px;width:1000px;--d:2s">
          <p class="h1 it" style="font-size:90px;line-height:1.08">Does paying the bill lead to fairer service<span class="amber"> — and an answer they can trust?</span></p>
        </div>
        ${illus('Illustrative household', 'right:28px;top:24px')}
      </div>`,
    script: [
      'But the clearest test will come afterwards, in the homes of customers who have already fulfilled their side of the bargain:\nDoes paying the bill lead to fairer service—and an answer they can trust?\n[Hold the pause, then finish.]'
    ],
    cues: ['Back in the dark household: the paid bill and the closing question. Hold in silence. (Further advances do nothing; press E for the evidence section during questions.)'],
    notes: 'The lights are not shown restored: nothing in our evidence shows the recommendations implemented. End here — no thank-you slide.'
  }
  ] };
})();
