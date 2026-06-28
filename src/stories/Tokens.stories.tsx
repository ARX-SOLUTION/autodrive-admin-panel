import type { Meta, StoryObj } from "@storybook/react";

// Visual reference for the Clinical design tokens consumed via
// `@autodrive/design-tokens`. Tokens are HSL components written to CSS vars
// in `tokens.css`; Tailwind utilities like `bg-primary` resolve to
// `hsl(var(--primary))`. Keep this in sync with the token source.

const SEMANTIC = [
  { name: "background", fg: "foreground" },
  { name: "foreground", fg: "background" },
  { name: "card", fg: "card-foreground" },
  { name: "popover", fg: "popover-foreground" },
  { name: "muted", fg: "muted-foreground" },
  { name: "primary", fg: "primary-foreground" },
  { name: "secondary", fg: "secondary-foreground" },
  { name: "accent", fg: "accent-foreground" },
  { name: "destructive", fg: "destructive-foreground" },
  { name: "success", fg: "success-foreground" },
  { name: "warning", fg: "warning-foreground" },
  { name: "info", fg: "info-foreground" },
  { name: "border", fg: "foreground" },
  { name: "input", fg: "foreground" },
  { name: "ring", fg: "foreground" },
] as const;

const RADII = ["sm", "md", "lg", "xl", "2xl", "full"] as const;

const Swatch = ({ name, fg }: { name: string; fg: string }) => (
  <div
    className="flex h-20 flex-col justify-between rounded-md border border-border p-3 text-xs font-medium"
    style={{
      background: `hsl(var(--${name}))`,
      color: `hsl(var(--${fg}))`,
    }}
  >
    <span>{name}</span>
    <span className="opacity-70">var(--{name})</span>
  </div>
);

const Palette = () => (
  <div className="space-y-8">
    <section>
      <h2 className="mb-3 text-lg font-semibold">Semantic colors</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {SEMANTIC.map((s) => (
          <Swatch key={s.name} name={s.name} fg={s.fg} />
        ))}
      </div>
    </section>

    <section>
      <h2 className="mb-3 text-lg font-semibold">Radius</h2>
      <div className="flex flex-wrap gap-4">
        {RADII.map((r) => (
          <div key={r} className="flex flex-col items-center gap-2">
            <div className={`h-16 w-16 bg-primary rounded-${r}`} />
            <span className="text-xs text-muted-foreground">rounded-{r}</span>
          </div>
        ))}
      </div>
    </section>

    <section>
      <h2 className="mb-3 text-lg font-semibold">Typography</h2>
      <div className="space-y-2">
        <p className="font-heading text-4xl">Heading — Unbounded</p>
        <p className="font-body text-base">
          Body — Inter. Quick brown fox jumps over the lazy dog. 0123456789.
        </p>
        <p className="text-sm text-muted-foreground">muted-foreground · 14px</p>
      </div>
    </section>
  </div>
);

const meta = {
  title: "Foundations/Tokens",
  component: Palette,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Clinical design tokens shared via `@autodrive/design-tokens`. Toggle the Theme toolbar to inspect light vs. dark.",
      },
    },
  },
} satisfies Meta<typeof Palette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
