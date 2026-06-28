import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { CompanySwitcher } from "@/components/layout/CompanySwitcher";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/types/user";

// Three fixture companies seeded directly into TanStack Query's cache so the
// switcher renders without hitting the backend. The component reads from
// `useCompanies({ limit: 200 })` which is keyed by `['platform-companies', params]`.
const fixtures = [
  { id: "co_001", name: "Acme Driving School" },
  { id: "co_002", name: "Bright Wheel Academy" },
  { id: "co_003", name: "City Driving Hub" },
];

const devUser = {
  id: "usr_dev_1",
  name: "Dev User",
  email: "dev@autodrive.test",
  role: "dev",
} as unknown as User;

const ownerUser = {
  id: "usr_owner_1",
  name: "Owner User",
  email: "owner@autodrive.test",
  role: "owner",
} as unknown as User;

interface DemoProps {
  role: "dev" | "owner";
  activeCompanyId?: string;
  emptyList?: boolean;
}

const Demo = ({ role, activeCompanyId = "", emptyList = false }: DemoProps) => {
  // A story-local QueryClient prevents the global preview client from
  // bleeding state between stories.
  const client = useMemo(() => {
    const c = new QueryClient({
      defaultOptions: {
        queries: { retry: false, refetchOnWindowFocus: false },
      },
    });
    const items = emptyList ? [] : fixtures;
    c.setQueryData(["platform-companies", { limit: 200 }], {
      items,
      total: items.length,
      page: 1,
      limit: 200,
    });
    return c;
  }, [emptyList]);

  useEffect(() => {
    const user = role === "dev" ? devUser : ownerUser;
    useAuthStore.setState({
      token: "storybook-token",
      user,
      isAuthenticated: true,
      hasHydrated: true,
      activeCompanyId,
    });
    return () => {
      useAuthStore.setState({
        token: null,
        user: null,
        isAuthenticated: false,
        activeCompanyId: "",
      });
    };
  }, [role, activeCompanyId]);

  return (
    <QueryClientProvider client={client}>
      <div className="flex flex-col gap-3">
        <CompanySwitcher />
        <p className="text-xs text-muted-foreground">
          Role: <code>{role}</code> · activeCompanyId:{" "}
          <code>{activeCompanyId || "(empty = all)"}</code>
        </p>
      </div>
    </QueryClientProvider>
  );
};

const meta = {
  title: "Admin/CompanySwitcher",
  component: Demo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          'Dev-only "view-as" switcher. Renders `null` for non-dev roles. Cache is pre-seeded with three fixture companies.',
      },
    },
  },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DevWithCompanies: Story = {
  args: { role: "dev" },
};

export const DevWithActiveCompany: Story = {
  args: { role: "dev", activeCompanyId: "co_002" },
};

export const DevEmptyList: Story = {
  args: { role: "dev", emptyList: true },
};

export const HiddenForOwner: Story = {
  args: { role: "owner" },
  parameters: {
    docs: {
      description: {
        story: "Returns `null` for non-dev roles — the switcher is invisible.",
      },
    },
  },
};
