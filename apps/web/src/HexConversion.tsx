import { useEffect, useState } from "react";
import {
  buildHookTx,
  definitionsFromJson,
  type XrplDefinitionsBase,
} from "xahau-hook-tx-builder";

const DEFAULT_URL = "https://xahau.network/server_definitions.json";

const strip = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const dotClass = (source: string | null) => {
  if (source === null) return "x-dot-wait";
  return source === "built-in" ? "" : "x-dot-live";
};

const hostOf = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

const isValid = (text: string) => {
  if (text === "") return false;
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
};

const HexConversion = () => {
  const [output, setOutput] = useState("");
  const [defs, setDefs] = useState<XrplDefinitionsBase | undefined>(undefined);
  const [source, setSource] = useState<string | null>(null);
  const [json, setJson] = useState("");
  const [hasCallback, setHasCallback] = useState(false);
  const [copied, setCopied] = useState(false);
  const valid = isValid(json);

  useEffect(() => {
    const searchUrl = window.location.search.slice(1);
    const url = searchUrl.trim() === "" ? DEFAULT_URL : strip(searchUrl);

    fetch(url)
      .then((response) => response.json())
      .then((jsonResponse) => {
        setDefs(definitionsFromJson(jsonResponse));
        setSource(hostOf(url));
      })
      .catch((e) => {
        console.error(e);
        setSource("built-in");
      });
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    setOutput(
      buildHookTx(JSON.parse(json), { definitions: defs, hasCallback }),
    );
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <header className="x-topbar">
        <div className="x-container x-topbar-row">
          <h1 className="x-brand">Xahau Hook Tx Builder</h1>
          <a
            className="x-btn x-btn-secondary"
            href="https://github.com/tequdev/xrpl-tt-visualizer"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </header>
      <main className="x-container">
        <p className="intro">
          Paste a Xahau transaction JSON and get the C <code>txn</code> array
          and macros for a Hook.
        </p>
        <div className="x-grid">
          <section className="x-card">
            <div className="x-card-head">
              <h2>Transaction JSON</h2>
              <span className="x-state">
                <span className={`x-dot ${dotClass(source)}`} />
                Definitions: {source ?? "loading…"}
              </span>
            </div>
            <form className="x-card-body x-stack form" onSubmit={handleSubmit}>
              <label>
                <span className="x-label">Transaction JSON</span>
                <textarea
                  className="x-input"
                  value={json}
                  onChange={(e) => setJson(e.target.value)}
                  placeholder={`// Enter TxJson here
{
  "TransactionType": "AccountSet"
}`}
                />
              </label>
              {json && !valid && (
                <div className="x-callout-error" role="alert">
                  Invalid JSON
                </div>
              )}
              <label className="check">
                <input
                  type="checkbox"
                  checked={hasCallback}
                  onChange={(e) => setHasCallback(e.target.checked)}
                />
                Has cbak()
              </label>
              <button className="x-btn" type="submit" disabled={!valid}>
                Convert to Hook Tx
              </button>
            </form>
          </section>
          <section className="x-card">
            <div className="x-card-head">
              <h2>Hook C</h2>
              <button
                className="x-btn x-btn-glass"
                type="button"
                disabled={!output}
                onClick={handleCopy}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="x-card-body">
              <pre className="x-box">
                {output || (
                  <span className="placeholder">
                    The generated Hook C appears here.
                  </span>
                )}
              </pre>
            </div>
          </section>
        </div>
        <details className="x-details x-box defs">
          <summary className="x-summary">Custom definitions</summary>
          <p>
            To use custom definitions, pass the JSON URL as the query string:
          </p>
          <code>
            https://tx-builder.xahau.tools/?https://example.com/definitions.json
          </code>
        </details>
      </main>
      <footer className="x-footer">
        <div className="x-container">
          Xahau Hook Tx Builder ·{" "}
          <a href="https://xahau.network/">xahau.network</a>
        </div>
      </footer>
    </>
  );
};

export default HexConversion;
