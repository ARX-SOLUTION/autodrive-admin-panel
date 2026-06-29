import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Company overview</CardTitle>
        <CardDescription>Tenant-wide stats at a glance.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Use Cards as the primary content container for grouped information.
        </p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>New branch</CardTitle>
        <CardDescription>Create a branch for this company.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Branches inherit the company's settings unless overridden.
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost">Cancel</Button>
        <Button>Create</Button>
      </CardFooter>
    </Card>
  ),
};

export const Stat: Story = {
  render: () => (
    <Card className="w-[240px]">
      <CardHeader className="pb-2">
        <CardDescription>Active students</CardDescription>
        <CardTitle className="text-3xl">1,284</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-success">
        +12% vs last month
      </CardContent>
    </Card>
  ),
};
