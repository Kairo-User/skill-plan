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

          // Dump all init keys to understand the request
          const initKeys = init ? Object.keys(init).join(", ") : "none";

          // Try to extract request details from the Request object
          let requestDetails = "";
          if (input instanceof Request) {
            requestDetails = `\nRequest method: ${input.method}`;
            requestDetails += `\nRequest headers:`;
            input.headers.forEach((v, k) => {
              requestDetails += `\n  ${k}: ${v}`;
            });
          }

          setError(
            `URL: ${inputUrl}` +
              `\nInit keys: ${initKeys}` +
              requestDetails +
              `\n\nStack: ${(e as Error).stack || "no stack"}`
          );
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
        maxHeight: "40vh",
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
