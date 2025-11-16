import { ColorScheme, StartScreenPrompt, ThemeOption } from "@openai/chatkit";

export const WORKFLOW_ID =
  process.env.NEXT_PUBLIC_CHATKIT_WORKFLOW_ID?.trim() ?? "";

export const CREATE_SESSION_ENDPOINT = "/api/create-session";

// Remove default “What can you do?” starter prompt
export const STARTER_PROMPTS: StartScreenPrompt[] = [];

export const PLACEHOLDER_INPUT = "Ask anything...";

// Time-based WESCU greeting – Good Morning starts 12:00 AM
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  let timeGreeting = "Hello";

  if (hour >= 0 && hour < 12) {
    timeGreeting = "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    timeGreeting = "Good Afternoon";
  } else if (hour >= 17 && hour < 21) {
    timeGreeting = "Good Evening";
  } else {
    timeGreeting = "Good Night";
  }

  return `${timeGreeting}, welcome to the official website of WESCU. Here, a world of possibilities awaits you. We are committed to ensuring that your life is enriched with holistic prosperity, hope, and purpose. Whether you're exploring financial solutions, seeking guidance, or simply learning more about our services, know that you are valued and supported every step of the way. Welcome to WESCU—where your journey toward sustainable success begins. How may I help you today?`;
};

export const GREETING = getGreeting();

// Theme adjustments to fix alignment, padding, and font size
export const getThemeConfig = (theme: ColorScheme): ThemeOption => ({
  // Fix text alignment + greeting spacing
  typography: {
    body: {
      textAlign: "left",
      fontSize: "14px",
      lineHeight: "1.45",
    },
    greeting: {
      textAlign: "left",
      fontSize: "15px",    // smaller greeting
      lineHeight: "1.5",
      marginTop: "4px",     // reduce giant top padding
    },
  },

  layout: {
    message: {
      padding: "8px 12px",   // tighter spacing
      maxWidth: "95%",       // prevents “wide block”
    },
    container: {
      paddingTop: "6px",     // fixes huge top spacing
    },
  },

  color: {
    grayscale: {
      hue: 220,
      tint: 6,
      shade: theme === "dark" ? -1 : -4,
    },
    accent: {
      primary: theme === "dark" ? "#f1f5f9" : "#0f172a",
      level: 1,
    },
  },

  radius: "round",
});
