import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "tel", "url"],
    },
    disabled: { control: "boolean" },
  },
  args: {
    placeholder: "Type something…",
    type: "text",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true, value: "Cannot edit" },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-[320px] gap-2">
      <Label htmlFor="company-name">Company name</Label>
      <Input id="company-name" {...args} placeholder="Acme Driving School" />
    </div>
  ),
};

export const Email: Story = {
  args: { type: "email", placeholder: "name@example.com" },
};

export const Password: Story = {
  args: { type: "password", placeholder: "••••••••" },
};

export const Invalid: Story = {
  render: (args) => (
    <div className="grid w-[320px] gap-2">
      <Label htmlFor="email-invalid">Email</Label>
      <Input
        id="email-invalid"
        {...args}
        type="email"
        defaultValue="not-an-email"
        aria-invalid
        className="border-destructive focus-visible:ring-destructive"
      />
      <p className="text-xs text-destructive">Enter a valid email address.</p>
    </div>
  ),
};
