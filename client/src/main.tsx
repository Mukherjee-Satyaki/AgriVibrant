import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

// Import fonts
const fontLinks = [
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;600&family=Inter:wght@400;500;600&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
];

// Create and append font links
fontLinks.forEach(href => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
});

// Add title
const title = document.createElement('title');
title.textContent = 'AgriTech Hub - Your Agricultural Marketplace';
document.head.appendChild(title);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <Toaster />
  </QueryClientProvider>
);
