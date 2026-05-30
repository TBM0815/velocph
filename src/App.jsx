import { useState, useEffect } from "react";
import "./App.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet default icon broken by Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

// ─── STOP DATABASE ────────────────────────────────────────────────────────────
const STOPS = {
  history: [
    { name: "Rosenborg Castle", desc: "17th century royal castle with crown jewels", duration: 40, emoji: "🏰", kidFriendly: true, indoorOption: true, lat: 55.6860, lng: 12.5770 },
    { name: "Christiansborg Palace", desc: "Seat of Danish Parliament on Slotsholmen island", duration: 35, emoji: "⚓", kidFriendly: true, indoorOption: true, lat: 55.6763, lng: 12.5800 },
    { name: "Rundetårn", desc: "Round Tower observatory from 1642 with a famous spiral ramp", duration: 30, emoji: "🔭", kidFriendly: true, indoorOption: true, lat: 55.6815, lng: 12.5757 },
    { name: "Nyhavn Harbour", desc: "Iconic colourful canal houses — waterfront cycling heaven", duration: 25, emoji: "⛵", kidFriendly: true, indoorOption: false, lat: 55.6796, lng: 12.5904 },
  ],
  food: [
    { name: "Torvehallerne Market", desc: "Copenhagen's finest food hall — coffee, smørrebrød, fresh produce", duration: 35, emoji: "🥪", kidFriendly: true, indoorOption: true, lat: 55.6834, lng: 12.5700 },
    { name: "Reffen Street Food", desc: "Waterfront container market with 50+ international stalls", duration: 35, emoji: "🌮", kidFriendly: true, indoorOption: false, lat: 55.6717, lng: 12.6083 },
    { name: "La Glace Konditori", desc: "Copenhagen's oldest patisserie since 1870 — kids will love it", duration: 25, emoji: "🍰", kidFriendly: true, indoorOption: true, lat: 55.6789, lng: 12.5727 },
    { name: "Nørreport Street Food", desc: "Local vendors, organic snacks, Danish pastries", duration: 20, emoji: "🥐", kidFriendly: true, indoorOption: false, lat: 55.6831, lng: 12.5706 },
  ],
  nature: [
    { name: "Kongens Have", desc: "King's Garden — Copenhagen's oldest royal park", duration: 25, emoji: "🌿", kidFriendly: true, indoorOption: false, lat: 55.6856, lng: 12.5757 },
    { name: "Frederiksberg Gardens", desc: "Romantic English-style garden with canal boats", duration: 35, emoji: "🦢", kidFriendly: true, indoorOption: false, lat: 55.6741, lng: 12.5215 },
    { name: "The Lakes (Søerne)", desc: "Three connected lakes — perfect cycling loop with cafés", duration: 25, emoji: "🚴", kidFriendly: true, indoorOption: false, lat: 55.6833, lng: 12.5560 },
    { name: "Amager Strandpark", desc: "Copenhagen's beach park — sandy shores on the Øresund", duration: 40, emoji: "🏖️", kidFriendly: true, indoorOption: false, lat: 55.6567, lng: 12.6383 },
  ],
  design: [
    { name: "Designmuseum Danmark", desc: "World-class Danish design and applied arts", duration: 50, emoji: "🪑", kidFriendly: false, indoorOption: true, lat: 55.6883, lng: 12.5937 },
    { name: "Superkilen Park", desc: "BIG-designed urban park celebrating global cultures", duration: 25, emoji: "🎨", kidFriendly: true, indoorOption: false, lat: 55.6967, lng: 12.5494 },
    { name: "SMK National Gallery", desc: "Denmark's largest art museum — free for under-18s", duration: 45, emoji: "🖼️", kidFriendly: true, indoorOption: true, lat: 55.6886, lng: 12.5778 },
  ],
  hidden: [
    { name: "Assistens Cemetery", desc: "Where Kierkegaard & Andersen rest — locals picnic here", duration: 20, emoji: "🌺", kidFriendly: true, indoorOption: false, lat: 55.6927, lng: 12.5484 },
    { name: "Freetown Christiania", desc: "Europe's most famous alternative community since 1971", duration: 35, emoji: "✌️", kidFriendly: false, indoorOption: false, lat: 55.6731, lng: 12.5994 },
    { name: "Cisternerne", desc: "Underground lake turned contemporary art space", duration: 30, emoji: "💧", kidFriendly: false, indoorOption: true, lat: 55.6728, lng: 12.5223 },
    { name: "Papirøen (Paper Island)", desc: "Former paper warehouse turned creative waterfront hub", duration: 25, emoji: "🏗️", kidFriendly: true, indoorOption: true, lat: 55.6736, lng: 12.5951 },
  ],
  kids: [
    { name: "Copenhagen Zoo", desc: "One of Europe's oldest zoos — pandas, elephants, polar bears", duration: 90, emoji: "🐘", kidFriendly: true, indoorOption: true, lat: 55.6723, lng: 12.5190 },
    { name: "Experimentarium", desc: "Science discovery centre — hands-on experiments for all ages", duration: 75, emoji: "🔬", kidFriendly: true, indoorOption: true, lat: 55.7278, lng: 12.5780 },
    { name: "Tivoli Gardens", desc: "The legendary amusement park in the heart of the city", duration: 90, emoji: "🎡", kidFriendly: true, indoorOption: false, lat: 55.6736, lng: 12.5681 },
    { name: "Statens Naturhistoriske Museum", desc: "Natural history museum — dinosaurs and tropical greenhouse", duration: 60, emoji: "🦕", kidFriendly: true, indoorOption: true, lat: 55.6863, lng: 12.5756 },
  ],
  playgrounds: [
    { name: "Superkilen Legeplads", desc: "Vibrant international playground inside Superkilen Park", duration: 30, emoji: "🛝", kidFriendly: true, indoorOption: false, lat: 55.6962, lng: 12.5492 },
    { name: "Fælledparken Playground", desc: "Copenhagen's largest park — huge adventure playground with water play", duration: 35, emoji: "⛲", kidFriendly: true, indoorOption: false, lat: 55.6978, lng: 12.5658 },
    { name: "Kongens Have Puppet Theatre", desc: "Open-air puppet shows in the King's Garden — classic Copenhagen summer", duration: 25, emoji: "🎭", kidFriendly: true, indoorOption: false, lat: 55.6858, lng: 12.5759 },
  ],
};

const ALL_CATEGORIES = Object.keys(STOPS);

const classifyWeather = (code) => {
  if (code === 0) return "clear";
  if (code <= 2) return "partlycloudy";
  if (code <= 3) return "cloudy";
  if (code <= 48) return "fog";
  if (code <= 67) return "rain";
  if (code <= 77) return "snow";
  if (code <= 82) return "rain";
  return "storm";
};

const weatherAdvice = {
  storm:        { icon: "⛈️", label: "Storm warning",        tip: "Route shifted to indoor stops only.",                    prefer: "indoor"  },
  rain:         { icon: "🌧️", label: "Rain expected",         tip: "Favouring covered stops and short outdoor stretches.",   prefer: "indoor"  },
  snow:         { icon: "❄️", label: "Snow today",            tip: "Warm indoor stops prioritised.",                         prefer: "indoor"  },
  fog:          { icon: "🌫️", label: "Foggy",                 tip: "Atmospheric! Some indoor highlights added.",             prefer: "mixed"   },
  clear:        { icon: "☀️", label: "Perfect cycling weather",tip: "Full outdoor route — enjoy every km.",                  prefer: "outdoor" },
  partlycloudy: { icon: "⛅", label: "Partly cloudy",         tip: "Great riding conditions.",                               prefer: "mixed"   },
  cloudy:       { icon: "☁️", label: "Overcast",              tip: "Classic Copenhagen sky. A few indoor stops for comfort.",prefer: "mixed"   },
  unknown:      { icon: "🌤️", label: "Weather checked",       tip: "Mixed indoor/outdoor route.",                           prefer: "mixed"   },
};

const QUESTIONS = [
  { id: "interests", question: "What draws you to Copenhagen?", subtitle: "Choose everything that excites you", multi: true,
    options: [
      { value: "history",  label: "History & Royalty", icon: "🏰" },
      { value: "food",     label: "Food & Markets",    icon: "🥪" },
      { value: "nature",   label: "Parks & Nature",    icon: "🌿" },
      { value: "design",   label: "Design & Culture",  icon: "🪑" },
      { value: "hidden",   label: "Hidden Gems",       icon: "✌️" },
    ],
  },
  { id: "group", question: "Who's coming along?", subtitle: "We'll tailor the route for your group", multi: false,
    options: [
      { value: "solo",   label: "Just me",            icon: "🧍" },
      { value: "couple", label: "Two of us",          icon: "👫" },
      { value: "small",  label: "Small group (3–5)",  icon: "👥" },
      { value: "large",  label: "Larger group (6+)",  icon: "🚴" },
    ],
  },
  { id: "kids", question: "Any children joining?", subtitle: "We'll add kid-friendly stops and adjust the pace", multi: false,
    options: [
      { value: "no",        label: "No children",               icon: "🚴" },
      { value: "yes_small", label: "Yes — small kids (under 8)", icon: "👶" },
      { value: "yes_older", label: "Yes — older kids (8–14)",    icon: "🧒" },
    ],
  },
  { id: "time", question: "How much time do you have?", subtitle: "We'll use every minute well", multi: false,
    options: [
      { value: "2", label: "2 hours",       icon: "⚡" },
      { value: "3", label: "3 hours",       icon: "🌤" },
      { value: "5", label: "Half day (5h)", icon: "☀️" },
      { value: "8", label: "Full day (8h)", icon: "🌅" },
    ],
  },
  { id: "pace", question: "What's your riding style?", subtitle: "No wrong answer", multi: false,
    options: [
      { value: "relaxed",  label: "Leisurely & slow",   icon: "🧘" },
      { value: "moderate", label: "Steady explorer",    icon: "🚴" },
      { value: "active",   label: "Sporty & efficient", icon: "⚡" },
    ],
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const haversine = (a, b) => {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};

const optimiseOrder = (start, stops) => {
  const remaining = [...stops];
  const ordered = [];
  let current = start;
  while (remaining.length > 0) {
    let nearestIdx = 0, nearestDist = Infinity;
    remaining.forEach((s, i) => {
      const d = haversine(current, s);
      if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
    });
    ordered.push(remaining[nearestIdx]);
    current = remaining[nearestIdx];
    remaining.splice(nearestIdx, 1);
  }
  return ordered;
};

const formatDuration = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
};

const makePin = (num, color = "#bf4e2a") => L.divIcon({
  className: "",
  html: `<div style="background:${color};color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;font-family:sans-serif;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${num}</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const homePin = L.divIcon({
  className: "",
  html: `<div style="background:#1a1a1a;color:white;width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35)">🏠</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

// Fits map bounds to all markers
function MapFitter({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(points.map(p => [p.lat, p.lng]), { padding: [30, 30] });
    } else if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14);
    }
  }, [points, map]);
  return null;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState("intro");
  const [answers, setAnswers] = useState({ interests: [], group: null, kids: null, time: null, pace: null });
  const [currentQ, setCurrentQ] = useState(0);
  const [route, setRoute] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [aiNarrative, setAiNarrative] = useState("");
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [startPoint, setStartPoint] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true);
      try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=55.6761&longitude=12.5683&current=temperature_2m,weathercode,windspeed_10m&wind_speed_unit=kmh");
        const d = await res.json();
        setWeather({ code: d.current?.weathercode, temp: Math.round(d.current?.temperature_2m), wind: Math.round(d.current?.windspeed_10m) });
      } catch { setWeather(null); }
      setWeatherLoading(false);
    };
    fetchWeather();
  }, []);

  const wxClass = weather ? classifyWeather(weather.code) : "unknown";
  const wx = weatherAdvice[wxClass] || weatherAdvice.unknown;

  const handleAnswer = (qid, value, multi) => {
    if (multi) {
      setAnswers(prev => ({ ...prev, [qid]: prev[qid].includes(value) ? prev[qid].filter(v => v !== value) : [...prev[qid], value] }));
    } else {
      setAnswers(prev => ({ ...prev, [qid]: value }));
    }
  };

  const canContinue = () => {
    const q = QUESTIONS[currentQ];
    const a = answers[q.id];
    return q.multi ? a.length > 0 : a !== null;
  };

  const geocodeAddress = async (address) => {
    try {
      const q = encodeURIComponent(address + ", Copenhagen, Denmark");
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, { headers: { "Accept-Language": "en" } });
      const data = await res.json();
      if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), name: data[0].display_name.split(",")[0] };
    } catch {}
    return null;
  };

  const fetchOsrmRoute = async (points) => {
    try {
      const coords = points.map(p => `${p.lng},${p.lat}`).join(";");
      const res = await fetch(`https://router.project-osrm.org/route/v1/bike/${coords}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.routes?.[0]?.geometry?.coordinates) {
        return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      }
    } catch {}
    return [];
  };

  const generateRoute = async () => {
    setStep("generating");

    const hours = parseInt(answers.time || "3");
    const budgetMinutes = hours * 60;
    const hasKids = answers.kids !== "no";
    const smallKids = answers.kids === "yes_small";
    const prefer = wx.prefer;
    const isSunny = wxClass === "clear" || wxClass === "partlycloudy";

    let interests = answers.interests.length > 0 ? [...answers.interests] : ["history", "food", "nature"];
    if (hasKids) { interests.push("kids"); if (isSunny) interests.push("playgrounds"); }

    // Build pool — preferred categories first, fallback after
    let pool = [];
    for (const cat of interests) {
      pool.push(...(STOPS[cat] || []).filter(s => {
        if (hasKids && !s.kidFriendly) return false;
        if (prefer === "indoor" && !s.indoorOption) return false;
        return true;
      }));
    }
    for (const cat of ALL_CATEGORIES.filter(c => !interests.includes(c))) {
      pool.push(...(STOPS[cat] || []).filter(s => {
        if (hasKids && !s.kidFriendly) return false;
        if (prefer === "indoor" && !s.indoorOption) return false;
        return true;
      }));
    }
    pool = pool.filter((s, i, arr) => arr.findIndex(x => x.name === s.name) === i);
    pool = pool.sort(() => Math.random() - 0.5);

    // Fill time budget greedily
    let rawStops = [], totalTime = 0;
    for (const stop of pool) {
      const transit = rawStops.length > 0 ? 15 : 0;
      if (totalTime + transit + stop.duration <= budgetMinutes) {
        rawStops.push(stop);
        totalTime += transit + stop.duration;
      }
    }
    if (rawStops.length < 2) rawStops = pool.slice(0, Math.min(2, pool.length));

    // Geocode start point
    const defaultStart = { lat: 55.6726, lng: 12.5655, name: "Copenhagen Central Station" };
    let startCoord = defaultStart;
    if (startPoint.trim()) {
      const geocoded = await geocodeAddress(startPoint.trim());
      if (geocoded) startCoord = geocoded;
    }

    // Nearest-neighbour TSP optimisation
    const finalStops = optimiseOrder(startCoord, rawStops);
    const optimisedTime = finalStops.reduce((s, stop, i) => s + stop.duration + (i > 0 ? 15 : 0), 0);

    // OSRM round-trip routing
    const roundTripPoints = [startCoord, ...finalStops, startCoord];
    const coords = await fetchOsrmRoute(roundTripPoints);
    setRouteCoords(coords);

    // AI narrative — stops in optimised order
    try {
      const groupDesc = { solo: "a solo rider", couple: "a couple", small: "a small group", large: "a larger group" }[answers.group] || "a group";
      const kidsDesc = hasKids ? (smallKids ? " with small children" : " with older kids") : "";
      const stopList = finalStops.map((s, i) => `${i + 1}. ${s.name}`).join(", ");
      const prompt = `You are a Copenhagen cycling guide. Write exactly 2 sentences — enthusiastic, specific, local — for this custom round-trip bike tour starting and ending at ${startCoord.name}.
Group: ${groupDesc}${kidsDesc}. Time: ${hours}h. Pace: ${answers.pace}. Weather: ${wx.label}, ${weather?.temp ?? "?"}°C.
Stops in order: ${stopList}.
Reference the actual stop names and their sequence. Be vivid and local. No "Welcome to Copenhagen". No generic opener.`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      setAiNarrative(data.content?.find(b => b.type === "text")?.text || "");
    } catch {
      setAiNarrative(`A ${hours}-hour round trip for ${answers.group === "solo" ? "you" : "your group"}${hasKids ? " and the kids" : ""} — ${finalStops.length} stops in optimised order, back where you started.`);
    }

    setRoute({ stops: finalStops, totalTime: optimisedTime, hours, hasKids, startCoord, startLabel: startPoint.trim() || "Copenhagen Central Station" });
    setUnlocked(false);
    setStep("result");
  };

  const googleMapsUrl = () => {
    if (!route) return "#";
    const origin = encodeURIComponent(route.startLabel);
    const wps = route.stops.map(s => encodeURIComponent(s.name + ", Copenhagen")).join("|");
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${origin}&waypoints=${wps}&travelmode=bicycling`;
  };

  const q = QUESTIONS[currentQ];
  const allMapPoints = route ? [route.startCoord, ...route.stops] : [];

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="logo">Velo<span>CPH</span></div>
        {weatherLoading
          ? <div className="wx-pill">⏳ Checking weather…</div>
          : weather
            ? <div className="wx-pill">{wx.icon} {wx.label} <strong>{weather.temp}°C</strong></div>
            : null}
      </header>

      {/* INTRO */}
      {step === "intro" && (
        <main className="center">
          <h1 className="intro-title">Your perfect<br /><em>Copenhagen</em><br />bike tour.</h1>
          <p className="intro-sub">5 quick questions. Our AI builds a custom cycling route — for your group, your time, and today's weather.</p>
          {weather && (
            <div className="wx-banner">
              <span className="wx-icon">{wx.icon}</span>
              <div>
                <div className="wx-banner-label">{wx.label} in Copenhagen today</div>
                <div className="wx-banner-tip">{wx.tip}</div>
                <div className="wx-banner-meta">{weather.temp}°C · Wind {weather.wind} km/h</div>
              </div>
            </div>
          )}
          <button className="btn" onClick={() => setStep("quiz")}>Build my route →</button>
        </main>
      )}

      {/* QUIZ */}
      {step === "quiz" && (
        <main className="center">
          <div className="card">
            <div className="progress">
              {QUESTIONS.map((_, i) => <div key={i} className={`prog-dot${i <= currentQ ? " active" : ""}`} />)}
            </div>
            <p className="q-step">Question {currentQ + 1} of {QUESTIONS.length}</p>
            <h2 className="q-title">{q.question}</h2>
            <p className="q-sub">{q.subtitle}</p>
            <div className="options">
              {q.options.map(opt => {
                const val = answers[q.id];
                const sel = q.multi ? val.includes(opt.value) : val === opt.value;
                return (
                  <div key={opt.value} className={`opt${sel ? " sel" : ""}`} onClick={() => handleAnswer(q.id, opt.value, q.multi)}>
                    <span className="opt-icon">{opt.icon}</span>
                    <span className="opt-label">{opt.label}</span>
                  </div>
                );
              })}
            </div>
            <button className="btn btn-full" disabled={!canContinue()} onClick={() => currentQ < QUESTIONS.length - 1 ? setCurrentQ(c => c + 1) : setStep("startpoint")}>
              {currentQ < QUESTIONS.length - 1 ? "Continue →" : "Almost there →"}
            </button>
          </div>
        </main>
      )}

      {/* START POINT */}
      {step === "startpoint" && (
        <main className="center">
          <div className="card">
            <p className="q-step">Final step</p>
            <h2 className="sp-title">Where do you start?</h2>
            <p className="sp-sub">Your hotel, address, or neighbourhood. Leave blank to start from Central Station.</p>
            <input className="sp-input" type="text" placeholder="e.g. Nørreport, Hotel d'Angleterre, Vesterbro…" value={startPoint} onChange={e => setStartPoint(e.target.value)} onKeyDown={e => e.key === "Enter" && generateRoute()} />
            <button className="btn btn-full" onClick={generateRoute}>Generate my route →</button>
            <p className="sp-skip" onClick={generateRoute}>Skip — start from Central Station</p>
          </div>
        </main>
      )}

      {/* GENERATING */}
      {step === "generating" && (
        <main className="center">
          <div className="spin">🚴</div>
          <h2 className="gen-title">Mapping your Copenhagen…</h2>
          <p className="gen-sub">Checking weather · Optimising route · Crafting your story</p>
        </main>
      )}

      {/* RESULT */}
      {step === "result" && route && (
        <main className="result-wrap">
          <div className="card">
            <p className="res-tag">✦ Your custom route is ready</p>
            <h2 className="res-title">The {route.hours}h Copenhagen{route.hasKids ? " Family" : ""} Ride</h2>
            {aiNarrative && <p className="res-narrative">{aiNarrative}</p>}
            <div className="wx-note">{wx.icon} {wx.tip}</div>

            <div className="stats">
              <div className="stat"><div className="stat-val">{route.stops.length}</div><div className="stat-label">Stops</div></div>
              <div className="stat"><div className="stat-val">{formatDuration(route.totalTime)}</div><div className="stat-label">Total</div></div>
              <div className="stat"><div className="stat-val">~{(route.stops.length * 2.2).toFixed(1)}km</div><div className="stat-label">Distance</div></div>
              <div className="stat"><div className="stat-val">{weather?.temp ?? "—"}°</div><div className="stat-label">Now</div></div>
            </div>

            {/* REAL OSM MAP */}
            <div className="map-wrap">
              <MapContainer center={[55.6761, 12.5683]} zoom={13} style={{ height: 280, width: "100%" }} zoomControl={true} scrollWheelZoom={false}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                />
                <MapFitter points={allMapPoints} />
                {/* Start/home marker */}
                <Marker position={[route.startCoord.lat, route.startCoord.lng]} icon={homePin}>
                  <Popup><strong>Start &amp; Finish</strong><br />{route.startLabel}</Popup>
                </Marker>
                {/* Stop markers */}
                {route.stops.map((stop, i) => (
                  <Marker key={i} position={[stop.lat, stop.lng]} icon={makePin(i + 1)}>
                    <Popup><strong>{stop.name}</strong><br />~{stop.duration} min</Popup>
                  </Marker>
                ))}
                {/* Route polyline */}
                {routeCoords.length > 1 && (
                  <Polyline positions={routeCoords} color="#bf4e2a" weight={3} opacity={0.8} dashArray="8,5" />
                )}
                {/* Fallback straight lines if OSRM failed */}
                {routeCoords.length === 0 && route.stops.length > 0 && (
                  <Polyline
                    positions={[route.startCoord, ...route.stops, route.startCoord].map(p => [p.lat, p.lng])}
                    color="#bf4e2a" weight={2} opacity={0.5} dashArray="5,8"
                  />
                )}
              </MapContainer>
              {!unlocked && (
                <div className="map-lock-overlay">
                  <div>🗺️</div>
                  <div>Full route unlocks after purchase</div>
                </div>
              )}
            </div>
            <p className="osm-credit">Map © <a href="https://openstreetmap.org" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors · Routing by OSRM</p>

            {unlocked && (
              <a className="btn-outline" href={googleMapsUrl()} target="_blank" rel="noopener noreferrer">
                🗺️ Open round-trip in Google Maps
              </a>
            )}

            {/* STOPS LIST */}
            <div className="stops">
              {route.stops.map((stop, i) => (
                <div key={i} className={`stop${!unlocked && i >= 2 ? " blur" : ""}`}>
                  <div className="stop-num">0{i + 1}</div>
                  <div className="stop-emoji">{stop.emoji}</div>
                  <div className="stop-body">
                    <div className="stop-name">{stop.name}</div>
                    <div className="stop-desc">{stop.desc}</div>
                    <div className="stop-tags">
                      <span className="tag">~{stop.duration} min</span>
                      {stop.indoorOption && <span className="tag indoor">☔ indoor option</span>}
                      {stop.kidFriendly && route.hasKids && <span className="tag kids">👶 kid-friendly</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PAYWALL */}
            {!unlocked && (
              <div className="paywall">
                <h3 className="pw-title">Unlock your full route</h3>
                <p className="pw-sub">First 2 stops previewed — the complete {route.stops.length}-stop tour is one tap away.</p>
                <div className="pw-features">
                  <div className="pw-feat"><span className="pw-check">✓</span> All {route.stops.length} stops with timing &amp; insider tips</div>
                  <div className="pw-feat"><span className="pw-check">✓</span> Interactive OpenStreetMap route</div>
                  <div className="pw-feat"><span className="pw-check">✓</span> Google Maps round-trip navigation</div>
                  <div className="pw-feat"><span className="pw-check">✓</span> GPX file for Garmin / bike computers</div>
                  <div className="pw-feat"><span className="pw-check">✓</span> Offline PDF with QR codes</div>
                  {route.hasKids && <div className="pw-feat"><span className="pw-check">✓</span> Family tips at each stop</div>}
                </div>
                <div className="price">€4.99</div>
                <p className="price-note">One-time · No account needed · Instant access</p>
                <button className="btn-buy" onClick={() => setUnlocked(true)}>Get my Copenhagen route →</button>
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
