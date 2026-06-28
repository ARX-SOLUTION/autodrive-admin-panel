import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
    "@chromatic-com/storybook",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  async viteFinal(viteConfig) {
    // Strip app-only plugins (`lovable-tagger`, `vite-plugin-pwa`) that are
    // noisy and unnecessary inside Storybook. Keep the rest of the config
    // (aliases, etc.) so stories resolve `@/` imports.
    const flatten = (input: unknown): unknown[] =>
      Array.isArray(input) ? input.flatMap(flatten) : [input];
    viteConfig.plugins = flatten(viteConfig.plugins).filter((plugin) => {
      if (!plugin || typeof plugin !== "object") return false;
      const name = (plugin as { name?: string }).name ?? "";
      return !name.startsWith("vite-plugin-pwa") && !name.includes("lovable");
    }) as typeof viteConfig.plugins;
    return viteConfig;
  },
};

export default config;
