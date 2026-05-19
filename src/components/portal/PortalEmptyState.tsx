import BrandIcon from "@/components/brand/BrandIcon";

export default function PortalEmptyState({
  title,
  description,
  icon = "clarity"
}: {
  title: string;
  description: string;
  icon?: "clarity" | "guide" | "billing" | "incident" | "attention" | "portal";
}) {
  return (
    <div className="ffo-portal-card rounded-[30px] p-8 text-center">
      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-[22px] border border-[#1b6fd8]/12 bg-[#1b6fd8]/8 text-[#1b6fd8]">
        <BrandIcon name={icon} className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-forne-ink">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-forne-muted">{description}</p>
    </div>
  );
}
