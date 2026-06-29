import type { Preview } from "@storybook/react";
import React from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import "../src/index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "app",
      values: [
        { name: "app", value: "hsl(0 0% 100%)" },
        { name: "app-dark", value: "hsl(222 47% 11%)" },
      ],
    },
    a11y: { test: "todo" },
  },
  globalTypes: {
    theme: {
      description: "Color scheme",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme ?? "light";
      return (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ThemeProvider
              attribute="class"
              defaultTheme={theme}
              forcedTheme={theme}
              enableSystem={false}
            >
              <TooltipProvider>
                <div className="min-h-screen bg-background p-6 text-foreground">
                  <Story />
                </div>
                <Toaster />
                <Sonner />
              </TooltipProvider>
            </ThemeProvider>
          </MemoryRouter>
        </QueryClientProvider>
      );
    },
  ],
};

export default preview;
