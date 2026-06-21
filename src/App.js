import { useState } from "react";

const ArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const SwapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);

export default function Translator() {
  const [direction, setDirection] = useState("cs-en");
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const srcLang = direction === "cs-en" ? "Čeština" : "English";
  const tgtLang = direction === "cs-en" ? "English" : "Čeština";
  const srcFlag = direction === "cs-en" ? "🇨🇿" : "🇬🇧";
  const tgtFlag = direction === "cs-en" ? "🇬🇧" : "🇨🇿";

  const swapDirection = () => {
    setDirection(d => d === "cs-en" ? "en-cs" : "cs-en");
    setInput("");
    setResult(null);
    setError(null);
  };

  const translate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    const isWord = input.trim().split(/\s+/).length <= 2;
    const fromLang = direction === "cs-en" ? "Czech" : "English";
    const toLang = direction === "cs-en" ? "English" : "Czech";

    const prompt = `You are a translator. Translate the following ${fromLang} ${isWord ? "word/phrase" : "text"} to ${toLang}.

Input: "${input.trim()}"

Respond ONLY with a valid JSON object, no markdown, no backticks, exactly this structure:
{
  "translation": "the translated text",
  "phonetics": "pronunciation guide for the ${toLang} text using simple phonetic spelling",
  "examples": [
    {"${fromLang.toLowerCase()}": "example sentence in ${fromLang}", "${toLang.toLowerCase()}": "translation of the example"},
    {"${fromLang.toLowerCase()}": "another example in ${fromLang}", "${toLang.toLowerCase()}": "translation"},
    {"${fromLang.toLowerCase()}": "third example in ${fromLang}", "${toLang.toLowerCase()}": "translation"}
  ]
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "TVŮJ_API_KLÍČ_ZDE",
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (e) {
      setError("Překlad se nezdařil. Zkontroluj API klíč a zkus to znovu.");
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      translate();
    }
  };

  const copyTranslation = () => {
    if (result?.translation) {
      navigator.clipboard.writeText(result.translation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fromKey = direction === "cs-en" ? "czech" : "english";
  const toKey = direction === "cs-en" ? "english" : "czech";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "40px 16px",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#f1f5f9"
    }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🌍</div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Překladač</h1>
        <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: 14 }}>Česko-anglický překlad s fonetickým přepisem</p>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20,
        padding: 28,
        width: "100%",
        maxWidth: 560,
        backdropFilter: "blur(10px)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
          <span style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", borderRadius: 10, padding: "6px 16px", fontSize: 14, fontWeight: 600, color: "#a5b4fc" }}>{srcFlag} {srcLang}</span>
          <button onClick={swapDirection} style={{ background: "rgba(99,102,241,0.3)", border: "1px solid rgba(99,102,241,0.5)", borderRadius: 10, padding: "6px 10px", cursor: "pointer", color: "#c7d2fe", display: "flex", alignItems: "center" }}>
            <SwapIcon />
          </button>
          <span style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", borderRadius: 10, padding: "6px 16px", fontSize: 14, fontWeight: 600, color: "#a5b4fc" }}>{tgtFlag} {tgtLang}</span>
        </div>

        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`Zadej ${srcLang === "Čeština" ? "česky" : "in English"}...`}
          rows={3}
          style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "14px 16px", fontSize: 16, color: "#f1f5f9", resize: "none", outline: "none", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.5 }}
        />

        <button onClick={translate} disabled={loading || !input.trim()} style={{ marginTop: 12, width: "100%", background: loading || !input.trim() ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 600, color: "#fff", cursor: loading || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {loading ? <>⏳ Překládám...</> : <><ArrowIcon /> Přeložit</>}
        </button>

        {error && <div style={{ marginTop: 16, padding: 14, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, color: "#fca5a5", fontSize: 14 }}>{error}</div>}

        {result && (
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 14, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#818cf8" }}>{tgtFlag} Překlad</span>
                <button onClick={copyTranslation} style={{ background: copied ? "rgba(99,102,241,0.2)" : "none", border: "none", cursor: "pointer", color: "#818cf8", display: "flex", alignItems: "center", gap: 4, fontSize: 12, padding: "2px 6px", borderRadius: 6 }}>
                  <CopyIcon /> {copied ? "Zkopírováno!" : "Kopírovat"}
                </button>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#e0e7ff" }}>{result.translation}</div>
            </div>

            {result.phonetics && (
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#64748b", marginBottom: 6 }}>🔊 Výslovnost</div>
                <div style={{ fontSize: 16, color: "#94a3b8", fontStyle: "italic" }}>{result.phonetics}</div>
              </div>
            )}

            {result.examples?.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#64748b", marginBottom: 12 }}>📝 Příklady použití</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {result.examples.map((ex, i) => (
                    <div key={i} style={{ paddingLeft: 12, borderLeft: "2px solid rgba(99,102,241,0.4)" }}>
                      <div style={{ fontSize: 14, color: "#c7d2fe", marginBottom: 3 }}>{ex[fromKey] || ex[Object.keys(ex)[0]]}</div>
                      <div style={{ fontSize: 13, color: "#64748b" }}>{ex[toKey] || ex[Object.keys(ex)[1]]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
