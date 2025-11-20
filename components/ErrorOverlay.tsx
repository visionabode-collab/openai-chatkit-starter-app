"use client";

type ErrorOverlayProps =
  | { message: string } // unified message model
  | {
      script?: string | null;
      session?: string | null;
      integration?: string | null;
    }; // backward compatibility

export function ErrorOverlay(props: ErrorOverlayProps) {
  let message: string;

  if ("message" in props && props.message) {
    message = props.message;
  } else {
    message =
      props.script ??
      props.session ??
      props.integration ??
      "An unknown error occurred while loading the assistant.";
  }

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
