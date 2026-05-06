"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import WalletConnectButton from "../components/WalletConnectButton";
import { useRitualWallet } from "../hooks/useRitualWallet";

type Token = {
  address: string;
  emoji: string;
  name: string;
  symbol: string;
  price: string;
  change24h: string;
  vibe: number;
  curve: number;
  signal: "AI Pick" | "Graduating" | "Rug risk" | "New";
};

const INSIGHTS = [
  "Ghost Koi is nearing graduation while spread remains disciplined.",
  "Spirit Moth momentum remains strong as buyers stack into the curve.",
  "Rug-risk concentration rising in low-liquidity tails. Stay surgical.",
  "Kami Candle showing steady demand with controlled volatility.",
];

const TICKER = [
  { kind: "buy", text: "↑ BUY 8.2 RITUAL · $GKOI" },
  { kind: "sell", text: "↓ SELL 1.1 RITUAL · $ONI" },
  { kind: "neutral", text: "AI: Koi sentiment spike +14" },
  { kind: "buy", text: "↑ BUY 2.7 RITUAL · $MOTH" },
  { kind: "sell", text: "↓ SELL 0.6 RITUAL · $MONK" },
];

export default function HomePage() {
  const router = useRouter();
  const wallet = useRitualWallet();
  const [isDark, setIsDark] = useState(false);
  const [insightIndex, setInsightIndex] = useState(0);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [tab, setTab] = useState<"Trending" | "New" | "Near graduation" | "Graduated">("Trending");
  const [sortBy, setSortBy] = useState<"market" | "vibe" | "curve">("market");

  useEffect(() => {
    const saved = window.localStorage.getItem("shrine-theme");
    const dark = saved === "dark";
    document.documentElement.classList.toggle("dark", dark);
    setIsDark(dark);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setInsightIndex((i) => (i + 1) % INSIGHTS.length), 6000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch("/api/tokens")
      .then((r) => r.json())
      .then((d) => setTokens(d.tokens || []))
      .catch(() => setTokens([]));
  }, []);

  const tickerLine = useMemo(() => [...TICKER, ...TICKER], []);
  const visibleTokens = useMemo(() => {
    const scoped = tokens.filter((t) => {
      if (tab === "New") return t.signal === "New";
      if (tab === "Near graduation") return t.curve >= 70 && t.curve < 95;
      if (tab === "Graduated") return t.signal === "Graduating" || t.curve >= 95;
      return true;
    });
    const marketScore = (t: Token) => Number(t.price || "0") * (1 + t.curve / 100);
    const sorted = [...scoped].sort((a, b) => {
      if (sortBy === "vibe") return b.vibe - a.vibe;
      if (sortBy === "curve") return b.curve - a.curve;
      return marketScore(b) - marketScore(a);
    });
    return sorted;
  }, [tokens, tab, sortBy]);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("shrine-theme", next ? "dark" : "light");
  }

  function icon() {
    if (isDark) {
      return <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5Z"/></svg>;
    }
    return <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M12 4a1 1 0 0 1 1 1v1.5a1 1 0 0 1-2 0V5a1 1 0 0 1 1-1Zm0 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-5a1 1 0 0 1 0 2h-1.5a1 1 0 0 1 0-2H20ZM6.5 12a1 1 0 0 1-1 1H4a1 1 0 1 1 0-2h1.5a1 1 0 0 1 1 1Zm10.3-5.3a1 1 0 0 1 1.4 0l1.1 1.1a1 1 0 1 1-1.4 1.4l-1.1-1.1a1 1 0 0 1 0-1.4Zm-10.7 10.7a1 1 0 0 1 1.4 0l1.1 1.1a1 1 0 0 1-1.4 1.4l-1.1-1.1a1 1 0 0 1 0-1.4Zm0-10.7a1 1 0 0 1 1.4 1.4L6.4 9.2A1 1 0 0 1 5 7.8l1.1-1.1Zm10.7 10.7a1 1 0 0 1 1.4 1.4l-1.1 1.1a1 1 0 0 1-1.4-1.4l1.1-1.1ZM12 17.5a1 1 0 0 1 1 1V20a1 1 0 1 1-2 0v-1.5a1 1 0 0 1 1-1Z"/></svg>;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Jost:wght@400;500&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
        :root { --parch:#F6F3EE; --stone:#E8E3DA; --line:#D4CFC6; --mid:#9A9288; --ink:#1C1915; --deep:#2E2B26; --accent:#8B2635; --accent-dim:rgba(139,38,53,0.08); --gold:#9A7B4F; --up:#2D6A2D; }
        html.dark { --parch:#0F0E0C; --stone:#1A1916; --line:#2E2B26; --mid:#6B6560; --ink:#EAE6DF; --deep:#C4BFB7; --accent:#C0404F; --accent-dim:rgba(192,64,79,0.10); --gold:#B8965E; --up:#3D8B3D; }
        *{box-sizing:border-box;border-radius:0}
        html,body{margin:0;background:var(--parch);color:var(--ink);min-height:100vh;overflow-x:hidden}
        a{text-decoration:none;color:inherit}
        .wrap{min-height:100vh;display:flex;flex-direction:column;border:1px solid var(--line)}
        .header{min-height:60px;padding:10px 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line);gap:12px;flex-wrap:wrap}
        .logo{font:700 17px "Playfair Display", serif}.dot{color:var(--accent)}
        .nav{display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:flex-end}
        .nav a{font:400 11px "Jost",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--mid)}
        .nav a:hover{color:var(--ink)}
        .theme{width:28px;height:28px;border:0;background:var(--stone);color:var(--mid);display:grid;place-items:center;cursor:pointer;transition:background .2s,color .2s}
        .theme:hover{color:var(--ink)}
        .cta{font:500 11px "Jost",sans-serif;letter-spacing:.12em;text-transform:uppercase;border:0;background:var(--ink);color:var(--parch);padding:8px 20px;cursor:pointer}
        .narrator{height:36px;background:var(--stone);display:flex;align-items:center;padding:0 24px;gap:8px;min-width:0}
        .dotx{width:5px;height:5px;background:var(--accent)}
        .ail{font:500 9px "DM Mono",monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--accent)}
        .ins{font:italic 12px "Playfair Display",serif;color:var(--deep);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:1;transition:opacity .4s}
        .tabs{min-height:40px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:8px 24px;gap:8px;flex-wrap:wrap}
        .tleft{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
        .tab{font:400 10px "Jost",sans-serif;letter-spacing:.15em;text-transform:uppercase;color:var(--mid);padding-bottom:7px;border-bottom:1px solid transparent;background:transparent;border-left:0;border-right:0;border-top:0;cursor:pointer}
        .tab.active{color:var(--ink);border-color:var(--ink)}
        .divi{width:1px;height:14px;background:var(--line)}
        .sort{font:400 9px "DM Mono",monospace;color:var(--mid);border:1px solid var(--line);background:transparent;padding:4px 6px}
        .ghead{height:28px;border-bottom:1px solid var(--line);display:grid;grid-template-columns:2fr 1.2fr .8fr .8fr 1fr .7fr;align-items:center;padding:0 24px;font:400 9px "DM Mono",monospace;letter-spacing:.15em;text-transform:uppercase;color:var(--mid);min-width:760px}
        .r{text-align:right}
        .table{overflow-x:auto}
        .list{flex:1;overflow:auto}
        .row{display:grid;grid-template-columns:2fr 1.2fr .8fr .8fr 1fr .7fr;align-items:center;padding:11px 24px;border-bottom:1px solid var(--line);cursor:pointer;transition:background .15s;min-width:760px}
        .row:hover{background:var(--stone)}
        .coin{display:flex;align-items:center;gap:10px}
        .tile{width:28px;height:28px;border:1px solid var(--line);background:var(--stone);display:grid;place-items:center}
        .nm{font:700 13px "Playfair Display",serif}
        .sy{font:400 9px "DM Mono",monospace;letter-spacing:.1em;color:var(--mid)}
        .mono{font:400 11px "DM Mono",monospace;color:var(--deep)}
        .up{color:var(--up)} .down{color:var(--accent)}
        .vwrap{display:flex;align-items:center;justify-content:flex-end;gap:6px}
        .track{width:36px;height:2px;background:var(--line)}
        .fill{height:2px}
        .curve{display:flex;flex-direction:column;align-items:flex-end;gap:3px}
        .ctrack{width:48px;height:1px;background:var(--line)}
        .cfill{height:1px;background:var(--ink)}
        .pct{font:400 8px "DM Mono",monospace;color:var(--mid)}
        .sig{justify-self:end;font:400 8px "DM Mono",monospace;letter-spacing:.08em;padding:2px 6px;border:1px solid var(--line);text-transform:uppercase}
        .sig-good{border-color:var(--up);color:var(--up);background:color-mix(in srgb, var(--up) 10%, transparent)}
        .sig-bad{border-color:var(--accent);color:var(--accent);background:var(--accent-dim)}
        .sig-new{border-color:var(--line);color:var(--mid);background:transparent}
        .foot{height:32px;border-top:1px solid var(--line);background:var(--parch);padding:8px 24px;overflow:hidden}
        .marq{display:inline-block;white-space:nowrap;animation:scroll 25s linear infinite;font:400 9px "DM Mono",monospace}
        .sep{color:var(--line);padding:0 10px}.neu{color:var(--mid)}
        @media (max-width: 768px){
          .header{padding:12px}
          .nav a{font-size:10px}
          .cta{padding:8px 12px}
          .narrator{padding:0 12px}
          .tabs{padding:8px 12px}
          .ghead,.row{padding-left:12px;padding-right:12px}
          .foot{padding:8px 12px}
        }
        @keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
      `}</style>

      <div className="wrap">
        <div className="header">
          <div className="logo">Shine <span className="dot">.dot.</span> FUN</div>
          <div className="nav">
            <a href="#" onClick={(e) => { e.preventDefault(); setTab("Trending"); }}>Market</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setTab("Graduated"); }}>Graduated</a>
            <a href="#" onClick={(e) => { e.preventDefault(); window.alert("Shrine.fun: launch, trade, and graduate meme coins with Ritual-native AI scoring."); }}>About</a>
            <button id="theme-toggle" aria-label="Toggle dark mode" className="theme" onClick={toggleTheme}>{icon()}</button>
            <WalletConnectButton
              isConnected={wallet.isConnected}
              isRitual={wallet.isRitual}
              busy={wallet.busy}
              shortAccount={wallet.shortAccount}
              onConnect={wallet.connect}
            />
            <button
              className="cta"
              onClick={async () => {
                const ok = wallet.isConnected && wallet.isRitual ? true : await wallet.connect();
                if (!ok) return;
                router.push("/create");
              }}
            >
              Launch a coin
            </button>
          </div>
        </div>

        <div className="narrator"><div className="dotx"/><div className="ail">AI</div><div className="ins">{INSIGHTS[insightIndex]}</div></div>

        <div className="tabs">
          <div className="tleft">
            <button className={`tab ${tab === "Trending" ? "active" : ""}`} onClick={() => setTab("Trending")}>Trending</button><div className="divi"/>
            <button className={`tab ${tab === "New" ? "active" : ""}`} onClick={() => setTab("New")}>New</button><div className="divi"/>
            <button className={`tab ${tab === "Near graduation" ? "active" : ""}`} onClick={() => setTab("Near graduation")}>Near graduation</button><div className="divi"/>
            <button className={`tab ${tab === "Graduated" ? "active" : ""}`} onClick={() => setTab("Graduated")}>Graduated</button>
          </div>
          <select className="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as "market" | "vibe" | "curve")}>
            <option value="market">Sort: Market Cap</option>
            <option value="vibe">Sort: Vibe</option>
            <option value="curve">Sort: Curve</option>
          </select>
        </div>

        <div className="table">
          <div className="ghead"><div>Coin</div><div className="r">Price</div><div className="r">24h</div><div className="r">Vibe</div><div className="r">Curve</div><div className="r">Signal</div></div>
          <div className="list">
            {visibleTokens.map((t) => {
            const vibeColor = t.vibe >= 70 ? "var(--up)" : t.vibe <= 40 ? "var(--accent)" : "var(--gold)";
            const signalClass = t.signal === "Rug risk" ? "sig-bad" : t.signal === "New" ? "sig-new" : "sig-good";
            return (
              <div className="row" key={t.address} onClick={() => router.push(`/${t.address}`)}>
                <div className="coin"><div className="tile">{t.emoji}</div><div><div className="nm">{t.name}</div><div className="sy">{t.symbol}</div></div></div>
                <div className="mono r">{t.price}</div>
                <div className={`mono r ${t.change24h.startsWith("+") ? "up" : "down"}`}>{t.change24h}</div>
                <div className="vwrap"><div className="track"><div className="fill" style={{ width: `${t.vibe}%`, background: vibeColor }} /></div><div className="mono">{t.vibe}</div></div>
                <div className="curve"><div className="ctrack"><div className="cfill" style={{ width: `${t.curve}%` }} /></div><div className="pct">{t.curve}%</div></div>
                <div className={`sig ${signalClass}`}>{t.signal}</div>
              </div>
            );
            })}
          </div>
        </div>

        <div className="foot">
          <div className="marq">
            {tickerLine.map((x, i) => (
              <span key={`${x.text}-${i}`} className={x.kind === "buy" ? "up" : x.kind === "sell" ? "down" : "neu"}>
                {x.text}<span className="sep">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
