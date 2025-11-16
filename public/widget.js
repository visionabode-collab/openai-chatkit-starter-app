// Simple ChatKit Widget Loader

(function () {
  const widget = document.createElement("div");
  widget.id = "chatkit-widget-container";
  widget.style.position = "fixed";
  widget.style.bottom = "20px";
  widget.style.right = "20px";
  widget.style.width = "420px";
  widget.style.height = "600px";
  widget.style.zIndex = "999999";
  widget.style.borderRadius = "14px";
  widget.style.overflow = "hidden";
  widget.style.boxShadow = "0 4px 18px rgba(0,0,0,0.25)";
  widget.style.display = "none"; // Hidden at start

  document.body.appendChild(widget);

  // Load the ChatKit web component
  const script = document.createElement("script");
  script.type = "module";
  script.src = "https://chat.openai.com/cdn/chatkit/chatkit.js";

  script.onload = () => {
    const chat = document.createElement("openai-chatkit");
    chat.setAttribute("workflow-id", "YOUR_WORKFLOW_ID_HERE"); 
    chat.setAttribute("api-key", "YOUR_PUBLIC_KEY_IF_NEEDED");
    chat.style.width = "100%";
    chat.style.height = "100%";

    widget.appendChild(chat);
    widget.style.display = "block";
  };

  document.head.appendChild(script);
})();
