"use client";

type ErrorOverlayProps = {
  script: string | null;
  session: string | null;
  integration: string | null;
};

export function ErrorOverlay({ script, session, integration }: ErrorOverlayProps) {
  const message =
    script ??
    session ??
    integration ??
    "An unknown error occurred while loading the assistant.";

  return (
    <div
      style={{
        background: "rgba(255,0,0,0.12)",
        border: "1px solid rgba(255,0,0,0.4)",
        padding: "16px",
        borderRadius: "8px",
        color: "#b00000",
        fontSize: "14px",
        margin: "8px",
      }}
    >
      <strong>Error:</strong> {message}
    </div>
  );
}
