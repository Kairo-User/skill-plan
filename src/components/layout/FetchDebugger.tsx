"use client";

import { useEffect, useState } from "react";

export function FetchDebugger() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input, init) => {
      try {
        return await originalFetch(input, init);
      } catch (e) {
        if (
          e instanceof TypeError &&
          e.message.includes("ISO-8859-1")
        ) {
          const inputUrl =
            typeof input === "string"
              ? input
              : input instanceof Request
                ? input.url
                : String(input);

          let details = `URL: ${inputUrl}`;
          details += `\nMethod: ${init?.method || "GET"}`;

          // Dump all header values with hex encoding to find the bad char
          if (init?.headers) {
            details += `\n\nAll Headers:`;
            const headers = init.headers as Record<string, string>;
            for (const [key, val] of Object.entries(headers)) {
              const badChar = [...val].find(
                (c) => c.charCodeAt(0) > 255
              );
              details += `\n  ${key}: ${val}`;
              if (badChar) {
                details += `\n  ⚠️ Non-ASCII char found: "${badChar}" (U+${badChar.charCodeAt(0).toString(16).toUpperCase()}) at position ${val.indexOf(badChar)}`;
                details += `\n  Hex: ${Array.from(val).map((c) => c.charCodeAt(0).toString(16)).join(" ")}`;
              }
            }
          } else {
            details += `\n\nNo headers in init`;
          }

          details += `\n\nStack: ${(e as Error).stack || "no stack"}`;
          setError(details);
        }
        throw e;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  if (!error) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: "#cc0000",
        color: "white",
        padding: "16px",
        fontSize: "12px",
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
        maxHeight: "60vh",
        overflow: "auto",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: 8, fontSize: 14 }}>
        🐛 Fetch Error Debug
      </div>
      <div>{error}</div>
    </div>
  );
}
