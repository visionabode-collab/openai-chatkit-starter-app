"use client";

type ErrorOverlayProps = {
  error?: string | null;
  fallbackMessage?: string | null;
  onRetry?: (() => void) | null;
  retryLabel?: string;
  // Backward compatibility
  message?: string;
  script?: string | null;
  session?: string | null;
  integration?: string | null;
};

export function ErrorOverlay(props: ErrorOverlayProps) {
  let message: string;
  
  if (props.error) {
    message = props.error;
  } else if (props.message) {
    message = props.message;
  } else if (props.fallbackMessage) {
    message = props.fallbackMessage;
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
      {props.onRetry && props.retryLabel && (
        <button
          onClick={props.onRetry}
          style={{
            marginLeft: "12px",
            padding: "4px 12px",
            background: "#b00000",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {props.retryLabel}
        </button>
      )}
    </div>
  );
}
