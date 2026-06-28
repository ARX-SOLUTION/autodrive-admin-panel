import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "@/components/ui/sonner";

const ToasterDemo = () => {
  const { toast } = useToast();
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() =>
          toast({
            title: "Saved",
            description: "Company settings updated.",
          })
        }
      >
        Show toast
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          toast({
            variant: "destructive",
            title: "Failed to save",
            description: "Check your network connection and try again.",
          })
        }
      >
        Destructive toast
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          sonnerToast.success("Company switched", {
            description: "Now viewing Acme Driving School.",
          })
        }
      >
        Sonner success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          sonnerToast.error("Sync failed", {
            description: "Could not reach the platform API.",
          })
        }
      >
        Sonner error
      </Button>
    </div>
  );
};

const meta = {
  title: "UI/Toaster",
  component: ToasterDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Two toast systems are wired in the admin panel: the shadcn `Toaster` (Radix-based) and `sonner`. Click a button to trigger each.",
      },
    },
  },
} satisfies Meta<typeof ToasterDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Triggers: Story = {};
