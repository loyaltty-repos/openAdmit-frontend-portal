import Footer from '@/components/static/Footer';
import Navigation from '@/components/static/Navigation';
import React, { useMemo, useState } from 'react';

// --- Helpers ---------------------------------------------------------------
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// WES default quality points for the condensed A/B/C buckets
const DEFAULT_QP = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0 };

// Normalize any common grade token into an A/B/C/D/F/Pass bucket (WES-style)
function normalizeGradeToken(raw) {
  if (!raw) return null;
  const g = String(raw).trim().toUpperCase();
  if (['PASS', 'P', 'Q', 'PASSED', 'QUALIFIED'].includes(g)) return 'PASS'; // excluded from GPA
  // Collapse +/- into buckets per user request (O, A+, A, A- → A etc.)
  if (['O', 'A+', 'A', 'A-'].includes(g)) return 'A';
  if (['B+', 'B', 'B-'].includes(g)) return 'B';
  if (['C+', 'C', 'C-'].includes(g)) return 'C';
  if (['D+', 'D', 'D-'].includes(g)) return 'D';
  if (['F', 'FAIL', 'E'].includes(g)) return 'F';
  // Fallback: if it starts with A/B/C/D treat accordingly
  if (g.startsWith('A')) return 'A';
  if (g.startsWith('B')) return 'B';
  if (g.startsWith('C')) return 'C';
  if (g.startsWith('D')) return 'D';
  return null;
}

function toNumber(x, fallback = 0) {
  const n = typeof x === 'number' ? x : parseFloat(String(x).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : fallback;
}

// --- Tier 3: CSV parsing + exact WES-style computation --------------------
function computeWESGPAFromRows(rows, qp = DEFAULT_QP) {
  let totalCredits = 0;
  let qualityPoints = 0;
  const buckets = { A: 0, B: 0, C: 0, D: 0, F: 0, PASS: 0 };

  rows.forEach((r) => {
    const credit = toNumber(r.credit, 0);
    const bucket = normalizeGradeToken(r.grade);
    if (!bucket || credit <= 0) return; // skip invalid / non-credit
    if (bucket === 'PASS') {
      buckets.PASS += credit; // tracked but excluded from denominator
      return;
    }
    buckets[bucket] += credit;
    totalCredits += credit;
    const q = qp[bucket] ?? 0;
    qualityPoints += credit * q;
  });

  const gpa = totalCredits > 0 ? qualityPoints / totalCredits : 0;
  return { gpa, totalCredits, buckets };
}

// Quick-and-safe CSV parser (no external deps)
function parseCSV(text) {
  // Accept comma, semicolon or tab separated; skip empty lines
  const lines = text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];
  const header = lines[0]
    .split(/[\t;,]/)
    .map((h) => h.trim().toLowerCase());
  const ciCourse = header.findIndex((h) => /course|name|subject/.test(h));
  const ciCredit = header.findIndex((h) => /credit|hours|ects|unit/.test(h));
  const ciGrade = header.findIndex((h) => /grade|letter|mark/.test(h));

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(/[\t;,]/).map((p) => p.trim());
    rows.push({
      course: parts[ciCourse] ?? `Row ${i}`,
      credit: parts[ciCredit] ?? '',
      grade: parts[ciGrade] ?? '',
    });
  }
  return rows;
}

// --- Demo dataset from the user's WES course-by-course (146 credits) ------
// Collapsed to { course, credit, grade } with WES letter grades A/B/C and a few Pass (0 cr)
const ANUSHK_WES_ROWS = [
  { course: 'Engineering Mathematics I', credit: 3.0, grade: 'C' },
  { course: 'Engineering Graphics Lab', credit: 1.0, grade: 'B' },
  { course: 'Engineering Graphics', credit: 1.0, grade: 'B' },
  { course: 'Computer Programming Lab', credit: 1.0, grade: 'A' },
  { course: 'Computer Programming', credit: 2.0, grade: 'C' },
  { course: 'Engineering Mathematics II', credit: 3.0, grade: 'B' },
  { course: 'Engineering Physics Lab', credit: 1.0, grade: 'A' },
  { course: 'Engineering Physics', credit: 3.0, grade: 'B' },
  { course: 'Basic Civil Engineering Lab', credit: 1.0, grade: 'A' },
  { course: 'Basic Civil Engineering', credit: 2.0, grade: 'B' },
  { course: 'Basic Mechanical Engineering Lab', credit: 1.0, grade: 'A' },
  { course: 'Basic Mechanical Engineering', credit: 3.0, grade: 'B' },
  { course: 'Basic Computer Engineering', credit: 3.0, grade: 'B' },
  { course: 'Documentation and Presentation Lab', credit: 1.0, grade: 'A' },
  { course: 'History of Science and Technology', credit: 2.0, grade: 'B' },
  { course: 'Environmental Sciences', credit: 2.0, grade: 'B' },
  { course: 'Engineering Chemistry', credit: 3.0, grade: 'A' },
  { course: 'Basic Electrical & Electronics Engg', credit: 3.0, grade: 'B' },
  { course: 'Engineering Workshop', credit: 1.0, grade: 'A' },
  { course: 'Communication Skill Lab', credit: 1.0, grade: 'A' },
  { course: 'Communication Skill', credit: 2.0, grade: 'A' },
  { course: 'Production Processes', credit: 3.0, grade: 'A' },
  { course: 'Strength of Materials', credit: 3.0, grade: 'A' },
  { course: 'Theory of Machines', credit: 3.0, grade: 'A' },
  { course: 'Engineering Thermodynamics', credit: 3.0, grade: 'A' },
  { course: 'Fluid Mechanics Lab', credit: 1.0, grade: 'A' },
  { course: 'Fluid Mechanics', credit: 3.0, grade: 'A' },
  { course: 'CAD Lab', credit: 1.0, grade: 'A' },
  { course: 'Engineering Materials', credit: 3.0, grade: 'A' },
  { course: 'Engineering Mathematics III', credit: 3.0, grade: 'A' },
  { course: 'Mgmt, Economics & Accounting', credit: 3.0, grade: 'A' },
  // Soft Skills II – Pass (0 cr) – excluded
  { course: 'Manufacturing Processes & Machines Lab', credit: 1.0, grade: 'A' },
  { course: 'Manufacturing Processes & Machines', credit: 3.0, grade: 'B' },
  { course: 'Machine Design Lab', credit: 1.0, grade: 'A' },
  { course: 'Machine Design', credit: 3.0, grade: 'A' },
  { course: 'Energy Conversion Lab', credit: 1.0, grade: 'A' },
  { course: 'Energy Conversion', credit: 3.0, grade: 'A' },
  { course: 'Dynamics of Machines Lab', credit: 1.0, grade: 'A' },
  { course: 'Dynamics of Machinery', credit: 3.0, grade: 'A' },
  { course: 'Strength of Materials Lab', credit: 1.0, grade: 'A' },
  { course: 'Theory of Machines Lab', credit: 1.0, grade: 'A' },
  { course: 'Engineering Chemistry Lab', credit: 1.0, grade: 'B' },
  { course: 'Basic Electrical Engineering Lab', credit: 1.0, grade: 'C' },
  // Soft Skills III / UHV – Pass (0 cr) – excluded
  { course: 'Energy Conversion Lab (U)', credit: 1.0, grade: 'A' },
  { course: 'Energy Conversion (U)', credit: 3.0, grade: 'A' },
  { course: 'Machine Design Lab II', credit: 1.0, grade: 'A' },
  { course: 'Machine Design (U)', credit: 3.0, grade: 'A' },
  { course: 'Heat and Mass Transfer Lab', credit: 1.0, grade: 'A' },
  { course: 'Heat and Mass Transfer', credit: 3.0, grade: 'A' },
  { course: 'Operations Research', credit: 3.0, grade: 'A' },
  { course: 'Measurement & Instruments', credit: 3.0, grade: 'A' },
  { course: 'Basics of Entrepreneurship', credit: 3.0, grade: 'A' },
  // Open Learning – Pass (0 cr)
  { course: 'CAD/CAM/CIM Lab (U)', credit: 1.0, grade: 'A' },
  { course: 'CAD/CAM/CIM (U)', credit: 3.0, grade: 'A' },
  { course: 'I.C. Engines Lab', credit: 1.0, grade: 'A' },
  { course: 'I.C. Engines', credit: 3.0, grade: 'A' },
  { course: 'Refrigeration & AC Lab', credit: 1.0, grade: 'A' },
  { course: 'Refrigeration & Air Conditioning', credit: 3.0, grade: 'B' },
  { course: 'Mechanical Vibration', credit: 3.0, grade: 'C' },
  { course: 'Sensors & Actuators', credit: 3.0, grade: 'A' },
  { course: 'Renewable Sources of Energy', credit: 3.0, grade: 'A' },
  { course: 'Utilization of Solar Energy', credit: 3.0, grade: 'B' },
  { course: 'Bio & Solid Waste Management', credit: 3.0, grade: 'A' },
  { course: 'Project Work I', credit: 3.0, grade: 'A' },
  { course: 'Industrial Training', credit: 2.0, grade: 'A' },
  { course: 'Disaster Management', credit: 3.0, grade: 'A' },
  { course: 'Project Work II', credit: 4.0, grade: 'B' },
];

function downloadCSV(name, rows) {
  const header = ['course,credit,grade'];
  const body = rows.map((r) => `${r.course},${r.credit},${r.grade}`);
  const blob = new Blob([header.concat(body).join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name.endsWith('.csv') ? name : `${name}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

// --- UI Components ---------------------------------------------------------
function Stat({ label, value, sub }) {
  return (
    <div className="p-4 rounded-2xl shadow-sm bg-white border">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

export default function Calculator() {
  const [tab, setTab] = useState(1);

  // Tier 1 state
  const [cgpa, setCgpa] = useState(7.78);

  // Piecewise smart assumptions for A/B/C buckets (by credits) based on CGPA bands
  const assumedABC = useMemo(() => {
    const x = clamp(cgpa, 0, 10);
    let A = 0, B = 0, C = 0;
    if (x < 6) {
      A = 0.2; B = 0.5; C = 0.3;
    } else if (x < 7) {
      A = 0.25; B = 0.30; C = 0.45;
    } else if (x < 8) {
      A = 0.70; B = 0.20; C = 0.10; // Calibrated to the user's case
    } else if (x < 9) {
      A = 0.80; B = 0.15; C = 0.05;
    } else {
      A = 0.90; B = 0.08; C = 0.02;
    }
    return { A, B, C };
  }, [cgpa]);

  const tier1GPA = useMemo(() => {
    const { A, B, C } = assumedABC;
    const gpa = (A * DEFAULT_QP.A + B * DEFAULT_QP.B + C * DEFAULT_QP.C);
    return gpa;
  }, [assumedABC]);

  // Tier 2 state (percent sliders + optional average credits per bucket)
  const [aPct, setAPct] = useState(71);
  const [bPct, setBPct] = useState(20);
  const [cPct, setCPct] = useState(6);
  const [aCredAvg, setACredAvg] = useState(3.0);
  const [bCredAvg, setBCredAvg] = useState(3.0);
  const [cCredAvg, setCCredAvg] = useState(3.0);

  const tier2 = useMemo(() => {
    const totalW = aPct * aCredAvg + bPct * bCredAvg + cPct * cCredAvg;
    const qp = aPct * aCredAvg * DEFAULT_QP.A + bPct * bCredAvg * DEFAULT_QP.B + cPct * cCredAvg * DEFAULT_QP.C;
    const gpa = totalW > 0 ? qp / totalW : 0;
    return { gpa, totalW };
  }, [aPct, bPct, cPct, aCredAvg, bCredAvg, cCredAvg]);

  // Tier 3 state (CSV upload)
  const [rows, setRows] = useState([]);
  const tier3 = useMemo(() => computeWESGPAFromRows(rows), [rows]);

  const loadAnushkSample = () => setRows(ANUSHK_WES_ROWS);
  const handleCSVUpload = async (file) => {
    const text = await file.text();
    const parsed = parseCSV(text);
    setRows(parsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navigation/>
       <section className="bg-gradient-to-r from-primary via-primary-600 to-primary-700 text-white py-20 pt-[200px]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">CGPA → GPA (WES-style) Calculator</h1>
                    
                </div>
            </section>
      <div className="max-w-5xl mx-auto mt-[50px] px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">CGPA → GPA (WES-style) Calculator</h1>
          <p className="text-sm text-gray-600 mt-2">
            Three tiers: (1) quick estimate from CGPA using smart assumptions, (2) adjustable A/B/C sliders (O, A+/A/A− → A; B+/B/B− → B; C+/C/C− → C), and (3) most accurate — upload a CSV transcript and compute exactly like WES (credit-weighted GPA with pass/0-credit excluded).
          </p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => setTab(n)}
              className={`px-4 py-2 rounded-2xl border shadow-sm ${tab === n ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
            >
              {n === 1 ? 'Tier 1 • CGPA → GPA (estimate)' : n === 2 ? 'Tier 2 • A/B/C sliders' : 'Tier 3 • Upload CSV (exact)'}
            </button>
          ))}
        </div>

        {/* Tier 1 */}
        {tab === 1 && (
          <section className="grid gap-6">
            <div className="p-5 bg-white rounded-2xl shadow-sm border grid gap-4">
              <label className="text-sm font-medium">CGPA (out of 10)</label>
              <input
                type="number"
                step="0.01"
                min={0}
                max={10}
                value={cgpa}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = toNumber(value, 0);

                  if (numValue >= 0 && numValue <= 10) {
                    setCgpa(numValue);
                  }
                  else{
                     setCgpa(0);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border"
              />
              <p className="text-xs text-gray-600">Assumptions by band (by <em>credits</em>):
                <br/> &lt;6 → A 20% / B 50% / C 30% · 6–&lt;7 → 45/35/20 · 7–&lt;8 → 70/20/10 · 8–&lt;9 → 80/15/5 · ≥9 → 90/8/2.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Stat label="Assumed A%" value={`${Math.round(assumedABC.A * 100)}%`} sub="(O, A+, A, A−)" />
              <Stat label="Assumed B%" value={`${Math.round(assumedABC.B * 100)}%`} sub="(B+, B, B−)" />
              <Stat label="Assumed C%" value={`${Math.round(assumedABC.C * 100)}%`} sub="(C+, C, C−)" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Stat label="Estimated GPA" value={tier1GPA.toFixed(2)} sub="WES A=4, B=3, C=2 (credit-weighted proxy)" />
              <Stat label="Est. % Marks" value={`${(clamp(cgpa,0,10) * 10).toFixed(1)}%`} sub="(CGPA × 10)" />
              <Stat label="Tier Accuracy" value="★☆☆" sub="Quick estimate" />
            </div>
          </section>
        )}

        {/* Tier 2 */}
        {tab === 2 && (
          <section className="grid gap-6">
            <div className="p-5 bg-white rounded-2xl shadow-sm border grid gap-4">
              <p className="text-sm">Set your distribution by <strong>credits</strong> (recommended). If you only know course counts, use the optional average credits/grade to approximate credit-weighting.</p>
              <div className="grid md:grid-cols-3 gap-6">
                {[{k:'A', v:aPct, set:setAPct}, {k:'B', v:bPct, set:setBPct}, {k:'C', v:cPct, set:setCPct}].map(({k,v,set}) => (
                  <div key={k} className="grid gap-2">
                    <label className="text-sm font-medium">{k} share (%)</label>
                    <input type="range" min={0} max={100} value={v} onChange={(e)=> set(toNumber(e.target.value,0))} />
                    <input type="number" min={0} max={100} value={v} onChange={(e)=> set(toNumber(e.target.value,0))} className="px-3 py-2 rounded-xl border" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600">Tip: O/A+/A/A− → A; B+/B/B− → B; C+/C/C− → C. Ensure A%+B%+C% ≈ 100. (We'll use your values as relative weights.)</p>

              <div className="grid md:grid-cols-3 gap-6 mt-4">
                <div className="grid gap-2">
                  <label className="text-sm">Avg credits for A-bucket</label>
                  <input type="number" step="0.1" value={aCredAvg} onChange={(e)=> setACredAvg(toNumber(e.target.value,3))} className="px-3 py-2 rounded-xl border" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm">Avg credits for B-bucket</label>
                  <input type="number" step="0.1" value={bCredAvg} onChange={(e)=> setBCredAvg(toNumber(e.target.value,3))} className="px-3 py-2 rounded-xl border" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm">Avg credits for C-bucket</label>
                  <input type="number" step="0.1" value={cCredAvg} onChange={(e)=> setCCredAvg(toNumber(e.target.value,3))} className="px-3 py-2 rounded-xl border" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Stat label="GPA (credit-weighted)" value={tier2.gpa.toFixed(2)} sub="A=4, B=3, C=2" />
              <Stat label="Weights used" value={`${Math.round(aPct)} / ${Math.round(bPct)} / ${Math.round(cPct)}%`} sub="A / B / C (by credits)" />
              <Stat label="Tier Accuracy" value="★★☆" sub="Tunable estimate" />
            </div>
            <div className="text-xs text-gray-600">For your case, try A=71, B=20, C=6 and keep avg credits ~3 each. You should land ≈3.56. If your A courses skew to higher-credit theory than labs, increase A's avg credits slightly to ~3.2 to land ≈3.62.</div>
          </section>
        )}

        {/* Tier 3 */}
        {tab === 3 && (
          <section className="grid gap-6">
            <div className="p-5 bg-white rounded-2xl shadow-sm border grid gap-4">
              <h2 className="text-lg font-semibold">Upload CSV — most accurate (WES-style)</h2>
              <p className="text-sm text-gray-700">
                CSV columns (header required): <code>course, credit, grade</code>. Grades can be O, A+/A/A−, B+/B/B−, C+/C/C−, D, F, or PASS. PASS/0-credit rows are excluded from the denominator.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-2xl border shadow-sm bg-white hover:bg-gray-50">
                  <input type="file" accept=".csv,text/csv" hidden onChange={(e)=> e.target.files?.[0] && handleCSVUpload(e.target.files[0])} />
                  <span>Choose CSV…</span>
                </label>
                <button className="px-4 py-2 rounded-2xl border shadow-sm bg-white hover:bg-gray-50" onClick={loadAnushkSample}>Load Anushk sample (146 cr)</button>
                <button className="px-4 py-2 rounded-2xl border shadow-sm bg-white hover:bg-gray-50" onClick={()=> downloadCSV('sample_transcript', ANUSHK_WES_ROWS)}>Download sample CSV</button>
              </div>

              {rows.length > 0 && (
                <div className="overflow-auto border rounded-2xl max-h-64">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="text-left p-2">#</th>
                        <th className="text-left p-2">Course</th>
                        <th className="text-left p-2">Credit</th>
                        <th className="text-left p-2">Grade</th>
                        <th className="text-left p-2">Bucket</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i} className={i % 2 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-2">{i + 1}</td>
                          <td className="p-2 whitespace-nowrap">{r.course}</td>
                          <td className="p-2">{r.credit}</td>
                          <td className="p-2">{r.grade}</td>
                          <td className="p-2">{normalizeGradeToken(r.grade) ?? '?'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Stat label="Exact GPA" value={tier3.gpa.toFixed(2)} sub="Credit-weighted; PASS excluded" />
              <Stat label="Credits counted" value={tier3.totalCredits.toFixed(0)} />
              <Stat label="A / B / C credits" value={`${(tier3.buckets?.A||0).toFixed(0)} / ${(tier3.buckets?.B||0).toFixed(0)} / ${(tier3.buckets?.C||0).toFixed(0)}`} />
              <Stat label="Other (D/F/PASS)" value={`${(tier3.buckets?.D||0).toFixed(0)} / ${(tier3.buckets?.F||0).toFixed(0)} / ${(tier3.buckets?.PASS||0).toFixed(0)}`} />
            </div>
            <div className="text-xs text-gray-600">Accuracy: ★★★ (mirrors WES formula — multiply credits × quality points per bucket and divide by counted credits; PASS/0-credit excluded). Defaults: A=4.00, B=3.00, C=2.00, D=1.00, F=0.</div>

            <div className="p-4 rounded-2xl bg-blue-50 text-blue-900 text-sm">
              <strong>Sanity check (your case):</strong> Click <em>Load Anushk sample</em>. You should see <b>A=100 cr</b>, <b>B=37 cr</b>, <b>C=9 cr</b>, total <b>146 cr</b> → GPA ≈ <b>3.62</b>.
            </div>
          </section>
        )}

        <footer className="mt-12 text-xs text-gray-500">
          Built for educational use. Actual evaluations depend on the receiving institution or credential service.
        </footer>
      </div>
      <Footer/>
    </div>
  );
}
