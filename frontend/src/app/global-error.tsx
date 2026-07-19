"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#0a0a0a",
          color: "#fafafa",
        }}
      >
        <div style={{ textAlign: "center", padding: 24, maxWidth: 480 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>
            Something went wrong
          </h1>
          <p style={{ color: "#a1a1aa", fontSize: 14, marginTop: 8 }}>
            {error.message || "A critical error occurred."}
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 20,
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "#fafafa",
              color: "#0a0a0a",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
