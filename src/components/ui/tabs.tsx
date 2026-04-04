import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);

  if (!context) {
    throw new Error("Tabs components must be used within <Tabs />");
  }

  return context;
}

export function Tabs({
  className,
  defaultValue,
  children,
}: React.HTMLAttributes<HTMLDivElement> & { defaultValue: string }) {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("inline-flex items-center gap-2 bg-white p-1", className)} {...props} />;
}

export function TabsTrigger({
  className,
  value,
  children,
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const { value: activeValue, setValue } = useTabsContext();

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        activeValue === value ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
        className,
      )}
      onClick={() => setValue(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  className,
  value,
  children,
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const { value: activeValue } = useTabsContext();

  if (activeValue !== value) {
    return null;
  }

  return <div className={className}>{children}</div>;
}
