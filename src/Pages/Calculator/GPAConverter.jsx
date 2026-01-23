/* GPAConverter.jsx – Final Version: TripleScorler Logic in Tier 2 + Working Tier 3 */
import React, { useMemo, useState, useRef } from "react";
import {
  HelpCircle,
  Upload,
  Download,
  X,
  Sparkles,
  Loader2,
} from "lucide-react";
import Navigation from "@/components/static/Navigation";
import Footer from "@/components/static/Footer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignInModal from "@/Pages/CollegeFinder/SignInModal";
import SignUpModal from "@/Pages/CollegeFinder/SignUpModal";
import { isAuthenticated, setAuth } from "@/lib/auth";
import { toast } from "sonner";

/* ──────────────────────── MATH & WES HELPERS ──────────────────────── */
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

function cgpaToPercent(cgpa10, factor = 9.5, cap = 95) {
  const p = parseFloat(cgpa10 || 0) * parseFloat(factor || 9.5);
  return Math.min(parseFloat(cap || 95), Math.max(0, p));
}

function priorMixFromPercent(p) {
  if (p >= 83) return { s70: 10, s75: 40, s80: 35, s60: 15 };
  if (p >= 78) return { s70: 20, s75: 45, s80: 20, s60: 15 };
  if (p >= 73) return { s70: 25, s75: 40, s80: 10, s60: 25 };
  if (p >= 68) return { s70: 20, s75: 20, s80: 5, s60: 55 };
  return { s70: 10, s75: 15, s80: 5, s60: 70 };
}

function anchorsForBuckets(percent, s80) {
  let a80 = 3.95, a75 = 3.90, a70 = 3.70, a60 = 2.95;
  if (percent < 78) a80 = 3.90;
  if (percent < 75 && (s80 || 0) > 20) a80 = 3.85;
  return { a80, a75, a70, a60 };
}

function gpaFromMix({ s70, s75, s80, s60 }, percent) {
  const { a80, a75, a70, a60 } = anchorsForBuckets(percent, s80);
  const total = Math.max(1, (s70 || 0) + (s75 || 0) + (s80 || 0) + (s60 || 0));
  const scale = total > 100 ? 100 / total : 1;
  const p80 = ((s80 || 0) * scale) / 100;
  const p75 = ((s75 || 0) * scale) / 100;
  const p70 = ((s70 || 0) * scale) / 100;
  const p60 = 1 - (p80 + p75 + p70);
  const gpa = a80 * p80 + a75 * p75 + a70 * p70 + a60 * p60;
  return clamp(gpa, 0, 4);
}

/* Tier-2 */
function anchorsABC(percent, sA = 0) {
  let A;
  if (percent >= 83) A = 3.92;
  else if (percent >= 78) A = 3.90;
  else if (percent >= 73) A = 3.88;
  else A = 3.75;
  const aShare = (sA || 0) / 100;
  if (aShare >= 0.75) A = Math.min(4.0, A + 0.08);
  else if (aShare >= 0.65) A = Math.min(4.0, A + 0.06);
  const B = 3.05, C = 2.20;
  return { A, B, C };
}
function gpaFromABC({ sA, sB, sC }, percent) {
  const { A, B, C } = anchorsABC(percent, sA);
  const total = Math.max(1, (sA || 0) + (sB || 0) + (sC || 0));
  const scale = total > 100 ? 100 / total : 1;
  let pA = ((sA || 0) * scale) / 100;
  let pB = ((sB || 0) * scale) / 100;
  let pC = ((sC || 0) * scale) / 100;
  const rem = clamp(1 - (pA + pB + pC), 0, 1);
  pC += rem;
  const gpa = A * pA + B * pB + C * pC;
  return clamp(gpa, 0, 4);
}

/* Range */
function rangeForLevel(level, percent, creditsTotal, programLengthYears) {
  let baseWidth = level === 1 ? 0.20 : level === 2 ? 0.12 : 0.06;
  const edges = [73, 78, 83, 68, 63, 58, 53, 50];
  const nearEdge = edges.some(e => Math.abs(percent - e) < 1.0);
  if (level <= 2 && nearEdge) baseWidth += 0.02;
  if (level <= 2 && creditsTotal && programLengthYears) {
    const typical = programLengthYears === 4 ? 150 : 100;
    const match = clamp(1 - Math.abs(creditsTotal - typical) / typical, 0, 1);
    baseWidth -= 0.06 * match;
  }
  if (level === 1) baseWidth = clamp(baseWidth, 0.15, 0.25);
  if (level === 2) baseWidth = clamp(baseWidth, 0.10, 0.18);
  if (level === 3) baseWidth = clamp(baseWidth, 0.03, 0.08);
  return baseWidth;
}

/* Tier-3 CSV */
function parseCSV(text) {
  const rows = [];
  let i = 0, field = "", row = [], inQuotes = false;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      } else { field += c; i++; continue; }
    } else {
      if (c === '"') { inQuotes = true; i++; continue; }
      if (c === ',') { row.push(field); field = ""; i++; continue; }
      if (c === '\n' || c === '\r') {
        if (field !== "" || row.length) { row.push(field); rows.push(row); row = []; field = ""; }
        if (c === '\r' && text[i + 1] === '\n') i++;
        i++; continue;
      }
      field += c; i++;
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}
function rowsToObjects(rows) {
  if (!rows?.length) return [];
  const headers = rows[0].map(h => (h || "").trim().toLowerCase());
  const out = [];
  for (let r = 1; r < rows.length; r++) {
    const obj = {};
    const cells = rows[r];
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = (cells[c] ?? "").toString().trim();
    }
    if (Object.values(obj).some(v => v !== "")) out.push(obj);
  }
  return out;
}
const LETTER_POINTS = {
  "A+": 4.0, "A": 4.0, "A-": 3.67,
  "B+": 3.33, "B": 3.0, "B-": 2.67,
  "C+": 2.33, "C": 2.0, "C-": 1.67,
  "D+": 1.33, "D": 1.0, "F": 0.0, "O": 4.0,
};
function percentToLetterPoints(p) {
  const x = Number(p);
  if (isNaN(x)) return null;
  if (x >= 80) return LETTER_POINTS["A"];
  if (x >= 75) return 3.90;
  if (x >= 70) return LETTER_POINTS["A-"];
  if (x >= 65) return LETTER_POINTS["B+"];
  if (x >= 60) return LETTER_POINTS["B"];
  if (x >= 55) return LETTER_POINTS["C+"];
  if (x >= 50) return LETTER_POINTS["C"];
  return LETTER_POINTS["F"];
}
function normalizeToPoints(row, cgpaFactor = 9.5, cgpaCap = 95) {
  const gtype = (row["grade_type"] || row["gradetype"] || row["type"] || "").toLowerCase();
  const gradeRaw = row["grade"] ?? row["marks"] ?? row["percent"] ?? "";
  const credits = parseFloat(row["credits"] || row["credit"] || row["cr"] || 0) || 0;
  const note = (row["description"] || row["notes"] || "").toLowerCase();

  if (gtype.includes("pass") || note.includes("pass")) return { include: false, credits: 0, points: 0 };
  const gradeStr = (gradeRaw || "").toString().trim().toUpperCase();
  if (gradeStr === "F*" || gradeStr === "R*") return { include: false, credits: 0, points: 0 };

  if (gtype.includes("letter") || /^[A-DF][+\-]?$/.test(gradeStr)) {
    const points = LETTER_POINTS[gradeStr] ?? null;
    return { include: points !== null, credits, points };
  }
  if (gtype.includes("percent") || /%$/.test(gradeStr) || /\d+$/.test(gradeStr)) {
    const val = parseFloat(gradeRaw);
    const points = percentToLetterPoints(val);
    return { include: points !== null, credits, points };
  }
  if (gtype.includes("cgpa")) {
    const per = Math.min(cgpaCap, parseFloat(gradeRaw) * cgpaFactor);
    const points = percentToLetterPoints(per);
    return { include: points !== null, credits, points };
  }
  return { include: false, credits: 0, points: 0 };
}
function computeTranscriptGPA(rows, opts = {}) {
  const seen = new Map();
  for (let i = 0; i < rows.length; i++) {
    const name = (rows[i]["course"] || rows[i]["name"] || rows[i]["course_name"] || `row_${i}`).trim();
    seen.set(name, i);
  }
  const unique = Array.from(seen.values()).map(idx => rows[idx]);

  let numer = 0, denom = 0;
  for (const r of unique) {
    const { include, credits, points } = normalizeToPoints(r, opts.cgpaFactor, opts.cgpaCap);
    if (!include) continue;
    numer += (points || 0) * (credits || 0);
    denom += (credits || 0);
  }
  const point = denom > 0 ? numer / denom : 0;

  function sweep(delta) {
    let n = 0, d = 0;
    for (const r of unique) {
      const gtype = (r["grade_type"] || "").toLowerCase();
      const gradeRaw = r["grade"] ?? "";
      const credits = parseFloat(r["credits"] || 0) || 0;
      if (gtype.includes("pass")) continue;
      const gradeStr = (gradeRaw || "").toString().trim().toUpperCase();
      let pts = null;
      if (gtype.includes("letter") || /^[A-DF][+\-]?$/.test(gradeStr)) {
        pts = LETTER_POINTS[gradeStr] ?? null;
      } else if (gtype.includes("percent") || /%$/.test(gradeStr) || /\d+$/.test(gradeStr)) {
        const val = parseFloat(gradeRaw) + delta;
        pts = percentToLetterPoints(val);
      } else if (gtype.includes("cgpa")) {
        const per = Math.min(opts.cgpaCap || 95, parseFloat(gradeRaw) * (opts.cgpaFactor || 9.5)) + delta;
        pts = percentToLetterPoints(per);
      }
      if (pts === null) continue;
      n += pts * credits; d += credits;
    }
    return d > 0 ? n / d : point;
  }
  const lo = Math.min(point, sweep(-2));
  const hi = Math.max(point, sweep(+2));
  const pad = 0.03;
  return { point: clamp(point, 0, 4), lo: clamp(lo - pad, 0, 4), hi: clamp(hi + pad, 0, 4) };
}

/* ──────────────────────── TRIPLE SCORLER REBALANCING (TIER 2) ──────────────────────── */
const TOTAL = 100;

function normalizeInitial(a, b, c) {
  a = clamp(a, 0, 100);
  b = clamp(b, 0, 100);
  c = clamp(c, 0, 100);
  const sum = a + b + c;
  if (sum === 0) return { aShare: 100, bShare: 0, cShare: 0 };
  const factor = TOTAL / sum;
  let na = Math.round(a * factor);
  let nb = Math.round(b * factor);
  let nc = TOTAL - na - nb;
  return { aShare: na, bShare: nb, cShare: nc };
}

function rebalanceFromA(desiredA, A, B, C) {
  desiredA = clamp(desiredA, 0, 100);
  const delta = desiredA - A;
  if (delta > 0) {
    const takeFromB = Math.min(delta, B);
    const takeFromC = delta - takeFromB;
    return { aShare: A + delta, bShare: B - takeFromB, cShare: C - takeFromC };
  } else if (delta < 0) {
    const freed = -delta;
    const giveToB = Math.min(freed, 100 - B);
    const giveToC = freed - giveToB;
    return { aShare: A + delta, bShare: B + giveToB, cShare: C + giveToC };
  }
  return { aShare: A, bShare: B, cShare: C };
}

function rebalanceFromB(desiredB, A, B, C) {
  desiredB = clamp(desiredB, 0, 100);
  const delta = desiredB - B;
  if (delta > 0) {
    const takeFromC = Math.min(delta, C);
    const takeFromA = delta - takeFromC;
    return { aShare: A - takeFromA, bShare: B + delta, cShare: C - takeFromC };
  } else if (delta < 0) {
    const freed = -delta;
    const giveToC = Math.min(freed, 100 - C);
    const giveToA = freed - giveToC;
    return { aShare: A + giveToA, bShare: B + delta, cShare: C + giveToC };
  }
  return { aShare: A, bShare: B, cShare: C };
}

function rebalanceFromC(desiredC, A, B, C) {
  desiredC = clamp(desiredC, 0, 100);
  const delta = desiredC - C;
  if (delta > 0) {
    const takeFromA = Math.min(delta, A);
    const takeFromB = delta - takeFromA;
    return { aShare: A - takeFromA, bShare: B - takeFromB, cShare: C + delta };
  } else if (delta < 0) {
    const freed = -delta;
    const giveToA = Math.min(freed, 100 - A);
    const giveToB = freed - giveToA;
    return { aShare: A + giveToA, bShare: B + giveToB, cShare: C + delta };
  }
  return { aShare: A, bShare: B, cShare: C };
}

/* ──────────────────────── MAIN COMPONENT ──────────────────────── */
export default function CGPAToGPAConverter() {
  const [cgpaError, setCgpaError] = useState("");
  const [activeTab, setActiveTab] = useState(1);
  const [cgpa, setCgpa] = useState("");
  const [factor, setFactor] = useState(9.5);
  const [cap, setCap] = useState(95);
  const [programLength, setProgramLength] = useState(4);
  const [creditsTotal, setCreditsTotal] = useState(146);

  // TripleScorler-style shares
  const [shares, setShares] = useState(() => normalizeInitial(60, 30, 10));
  const { aShare, bShare, cShare } = shares;

  const [csvText, setCsvText] = useState("");
  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("signup");
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const updateAShare = (val) => setShares(prev => rebalanceFromA(val, prev.aShare, prev.bShare, prev.cShare));
  const updateBShare = (val) => setShares(prev => rebalanceFromB(val, prev.aShare, prev.bShare, prev.cShare));
  const updateCShare = (val) => setShares(prev => rebalanceFromC(val, prev.aShare, prev.bShare, prev.cShare));

  /* ---------- derived GPA values ---------- */
  const { percent, point, lo, hi, confidence } = useMemo(() => {
    if (!hasCalculated) return {};

    const percent = round2(cgpaToPercent(cgpa, factor, cap));

    let point, lo, hi;
    if (activeTab === 1) {
      const priorMix = priorMixFromPercent(percent);
      const g = gpaFromMix(priorMix, percent);
      const width = rangeForLevel(1, percent, creditsTotal, programLength);
      point = round2(g);
      lo = round2(clamp(g - width, 0, 4));
      hi = round2(clamp(g + width, 0, 4));
    } else if (activeTab === 2) {
      const mix = { sA: aShare, sB: bShare, sC: cShare };
      const g = gpaFromABC(mix, percent);
      const width = rangeForLevel(2, percent, creditsTotal, programLength);
      point = round2(g);
      lo = round2(clamp(g - width, 0, 4));
      hi = round2(clamp(g + width, 0, 4));
    } else if (activeTab === 3 && csvText.trim()) {
      const rows = rowsToObjects(parseCSV(csvText));
      const res = computeTranscriptGPA(rows, { cgpaFactor: factor, cgpaCap: cap });
      point = round2(res.point);
      lo = round2(res.lo);
      hi = round2(res.hi);
    } else {
      point = lo = hi = 0;
    }

    const confidence = activeTab === 1 ? "low" : activeTab === 2 ? "medium" : "high";
    return { percent, point, lo, hi, confidence };
  }, [hasCalculated, activeTab, cgpa, factor, cap, aShare, bShare, cShare, creditsTotal, programLength, csvText]);

  /* ---------- file handling ---------- */
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCsvText(String(ev.target?.result || ""));
      setUploadedFile(true);
    };
    reader.readAsText(file);
  };

  const downloadSampleCSV = () => {
    const csv = `course,term,credits,grade,grade_type,description
Thermodynamics,2018-Fall,4,73,percent,
Strength of Materials,2019-Spring,3,7.5,cgpa10,First Class
Fluid Mechanics,2019-Fall,3,A-,letter,
Materials Lab,2019-Fall,1,Pass,passfail,`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sample_transcript.csv"; a.click();
  };

  // const validateCgpa = (value) => {
  //   setCgpa(value);

  //   if (value === "") {
  //     setCgpaError("CGPA is required");
  //     return false;
  //   }
  //   const num = parseFloat(value);
  //   if (isNaN(num)) {
  //     setCgpaError("Please enter a valid number");
  //     return false;
  //   }
  //   if (num < 0 || num > 10) {
  //     setCgpaError("CGPA must be between 0 and 10");
  //     return false;
  //   }
  //   setCgpaError("");
  //   return true;
  // };

  const validateCgpa = (value) => {
    setCgpa(value);

    if (value === "") {
      setCgpaError("CGPA is required");
      return false;
    }
    const num = parseFloat(value);
    if (isNaN(num)) {
      setCgpaError("Please enter a valid number");
      return false;
    }
    if (num < 0 || num > 10) {
      setCgpaError("CGPA must be between 0 and 10");
      return false;
    }
    setCgpaError("");
    return true;
  };

  const handleCalculate = () => {
    if (activeTab !== 3 && !validateCgpa(cgpa)) return;
    if (!isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }

    setIsCalculating(true);
    setTimeout(() => {
      setHasCalculated(true);
      setIsCalculating(false);
      toast.success("GPA calculated successfully!");
    }, 800);
  };

  const handleAuthSuccess = (token, user) => {
    setAuth({ accessToken: token, user });
    setShowAuthModal(false);
    toast.success("Signed in! Now calculating GPA...");
    handleCalculate();
  };

  const resetCalculator = () => {
    setCgpa("");
    setCgpaError("");
    setFactor(9.5);
    setCap(95);
    setProgramLength(4);
    setCreditsTotal(146);
    setShares(normalizeInitial(60, 30, 10));
    setCsvText("");
    setUploadedFile(false);
    setHasCalculated(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navigation />
      <section className="bg-gradient-to-r from-primary via-primary-600 to-primary-700 text-white py-2 pt-[100px] sm:py-16 sm:pt-[150px]">
        <div className="text-center mb-10 flex flex-col justify-center items-center">
          <h1 className="text-2xl sm:text-5xl max-w-7xl text-center font-bold text-white mb-2">
            10 Point CGPA to 4 Point GPA Converter Online
          </h1>
          <p className="text-white px-2 text-lg sm:text-xl">Enter your scores, get instant conversions. Plan smart. Apply better</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto py-8 sm:py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-8">
              {["Tier 1", "Tier 2", "Tier 3"].map((t, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveTab(i + 1); resetCalculator(); }}
                  className={`pb-2 px-4 font-medium transition-all ${activeTab === i + 1
                    ? "text-teal-700 border-b-3 border-teal-700"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
                  style={{ borderBottomWidth: activeTab === i + 1 ? "3px" : "0" }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* ---------- Tier 1 ---------- */}
          {activeTab === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  CGPA <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={cgpa}
                  onChange={(e) => validateCgpa(e.target.value)}
                  placeholder="Enter your CGPA"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${cgpaError
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-teal-600"
                  }`}
                />
                {cgpaError && (
                  <p className="mt-2 text-sm text-red-600">{cgpaError}</p>
                )}
              </div>

              <div className="flex justify-center space-x-4">
                <Button onClick={handleCalculate} disabled={isCalculating || !!cgpaError || !cgpa} className="bg-[#145044] hover:bg-[#0f3c34]">
                  {isCalculating ? <>Calculating <Loader2 className="ml-2 h-4 w-4 animate-spin" /></> : <>Calculate <Sparkles className="ml-2 h-4 w-4" /></>}
                </Button>
                <button onClick={() => setShowPopup(true)} className="px-4 py-3 text-gray-600 hover:text-gray-800 flex items-center space-x-2">
                  <HelpCircle size={18} />
                  <span>How it works?</span>
                </button>
              </div>

              {hasCalculated && point !== undefined && (
                <div className="mt-6 p-6 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-semibold text-gray-800">
                    GPA: {point.toFixed(2)} <span className="text-sm text-gray-600">(±{(hi - lo).toFixed(2)})</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Range: {lo.toFixed(2)} – {hi.toFixed(2)} | Confidence: {confidence}</p>
                </div>
              )}
            </div>
          )}

          {/* ---------- Tier 2 – TripleScorler Logic ---------- */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  CGPA <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={cgpa}
                  onChange={(e) => validateCgpa(e.target.value)}
                  placeholder="Enter your CGPA"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${cgpaError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-teal-600"}`}
                />
                {cgpaError && <p className="mt-2 text-sm text-red-600">{cgpaError}</p>}
              </div>

              <div className="mt-6 space-y-6">
                <h3 className="font-medium text-gray-700">Set your distribution by credits</h3>
                {[
                  { label: "A share (%)", value: aShare, set: updateAShare },
                  { label: "B share (%)", value: bShare, set: updateBShare },
                  { label: "C share (%)", value: cShare, set: updateCShare },
                ].map(({ label, value, set }) => (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-gray-700">{label}</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={value}
                        onChange={(e) => set(Number(e.target.value))}
                        className="w-24 px-3 py-1 border border-gray-300 rounded text-center"
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={value}
                      onChange={(e) => set(Number(e.target.value))}
                      className="w-full h-2 bg-teal-200 rounded-lg appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, #0f766e 0%, #0f766e ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)` }}
                    />
                  </div>
                ))}
                <p className="text-sm text-gray-600">
                  Total: {aShare + bShare + cShare}% (always exactly 100%)
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                <Button onClick={handleCalculate} disabled={isCalculating || !!cgpaError || !cgpa} className="bg-[#145044] hover:bg-[#0f3c34]">
                  {isCalculating ? <>Calculating <Loader2 className="ml-2 h-4 w-4 animate-spin" /></> : <>Calculate <Sparkles className="ml-2 h-4 w-4" /></>}
                </Button>
                <button onClick={() => setShowPopup(true)} className="px-4 py-3 text-gray-600 hover:text-gray-800 flex items-center space-x-2">
                  <HelpCircle size={18} />
                  <span>How it works?</span>
                </button>
              </div>

              {hasCalculated && point !== undefined && (
                <div className="mt-6 p-6 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-semibold text-gray-800">
                    GPA: {point.toFixed(2)} <span className="text-sm text-gray-600">(±{(hi - lo).toFixed(2)})</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Range: {lo.toFixed(2)} – {hi.toFixed(2)} | Confidence: {confidence}</p>
                </div>
              )}
            </div>
          )}

          {/* ---------- Tier 3 – FULLY WORKING ---------- */}
          {activeTab === 3 && (
            <div className="space-y-6">
              {!uploadedFile ? (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Upload your Marksheet</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    CSV columns (header required): course, credit, grade. Grades can be O, A+/A/A-, B+/B/B-, C+/C/C-, D, F, or PASS.
                  </p>
                  <div className="flex space-x-4 flex-col sm:flex-row justify-center items-center gap-4 ">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                    <Button onClick={() => fileInputRef.current?.click()} className="bg-[#145044] w-[300px] sm:w-[250px] hover:bg-[#0f3c34] flex items-center space-x-2">
                      <Upload size={18} />
                      <span>Choose CSV</span>
                    </Button>
                    <Button onClick={downloadSampleCSV} variant="outline" className="flex items-center space-x-2 w-[300px] sm:w-[250px]">
                      <Download size={18} />
                      <span>Download Sample</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-700">Uploaded Transcript</h3>
                    <button onClick={() => { setUploadedFile(false); setCsvText(""); setHasCalculated(false); }} className="text-gray-500 hover:text-gray-700">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">#</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Course</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Credit</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rowsToObjects(parseCSV(csvText)).map((row, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-600">{idx + 1}</td>
                            <td className="px-4 py-3 text-sm text-gray-800">{row.course || "-"}</td>
                            <td className="px-4 py-3 text-sm text-gray-800 text-center">{row.credits || "-"}</td>
                            <td className="px-4 py-3 text-sm text-gray-800 text-center font-medium">{row.grade || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-center mt-6">
                    <Button onClick={handleCalculate} disabled={!csvText.trim() || isCalculating} className="bg-[#145044] hover:bg-[#0f3c34]">
                      {isCalculating ? <>Calculating <Loader2 className="ml-2 h-4 w-4 animate-spin" /></> : <>Calculate GPA <Sparkles className="ml-2 h-4 w-4" /></>}
                    </Button>
                  </div>

                  {hasCalculated && point !== undefined && (
                    <div className="mt-6 p-6 bg-green-50 rounded-lg text-center">
                      <p className="text-2xl font-semibold text-gray-800">
                        GPA: {point.toFixed(2)} <span className="text-sm text-gray-600">(±{(hi - lo).toFixed(2)})</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Range: {lo.toFixed(2)} – {hi.toFixed(2)} | Confidence: {confidence}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* How it works Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-[#0000002f] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
            <button onClick={() => setShowPopup(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">How we calculate this</h2>
            {activeTab === 1 && <div className="space-y-4 text-gray-700"><p>We turn your CGPA into a percentage (CGPA × 9.5, capped at 95%).</p><p>Then we assume a realistic grade-mix for that average and convert it to the 4.0 scale.</p><p>Because we don’t have the exact transcript, we show a small range.</p></div>}
            {activeTab === 2 && <div className="space-y-4 text-gray-700"><p>You control the exact credit share of A/B/C grades.</p><p>Sliders always sum to 100% with smart rebalancing (A takes from B first, etc.).</p><p>Uses dynamic anchors based on your overall percentage.</p></div>}
            {activeTab === 3 && <div className="space-y-4 text-gray-700"><p>Course-by-course conversion exactly like WES.</p><p>Pass/Fail and repeats (latest kept) are excluded.</p><p>A tiny sensitivity band (±2% on marks) gives the range.</p></div>}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="text-2xl font-bold text-center">Sign in to View GPA</DialogTitle>
            <p className="text-center text-gray-600 mt-2">Create an account or sign in to calculate and save your GPA.</p>
          </DialogHeader>
          <Tabs value={authTab} onValueChange={setAuthTab} className="p-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-6">
              <SignInModal onSuccess={handleAuthSuccess} />
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <SignUpModal onSuccess={handleAuthSuccess} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}