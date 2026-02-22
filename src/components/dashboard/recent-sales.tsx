import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type RecentSaleItem = {
  buyerName?: string | null;
  buyerEmail?: string | null;
  total: number;
  currency?: string;
  createdAt?: string;
  avatarUrl?: string;
};

function getInitials(name?: string | null, email?: string | null) {
  const n = (name || "").trim();
  if (n) {
    const parts = n.split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "??";
  }
  const user = (email || "").split("@")[0] || "";
  return ((user[0] ?? "") + (user[1] ?? "")).toUpperCase() || "??";
}

function fmtAmount(value: number, currency = "ARS") {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  } catch {
    return `$${(value ?? 0).toLocaleString("es-AR")}`;
  }
}

export function RecentSales({
  items = [],
  loading = false,
  limit = 8,
  scrollable = true,
  maxHeight = 320,
  className = "",
}: {
  items?: RecentSaleItem[];
  loading?: boolean;
  limit?: number;
  scrollable?: boolean;
  maxHeight?: number | string;
  className?: string;
}) {
  const list = (items || []).slice(0, limit);

  if (loading) {
    return (
      <div
        className={`space-y-8 ${scrollable ? "pr-2" : ""} ${className}`}
        style={
          scrollable
            ? {
                maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
                overflowY: "auto",
                scrollbarWidth: "thin",
              }
            : undefined
        }
        aria-label="Ventas recientes (cargando)"
      >
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="flex items-center animate-pulse">
            <div className="h-9 w-9 rounded-full bg-muted" />
            <div className="ml-4 flex-1">
              <div className="h-3 w-40 rounded bg-muted mb-2" />
              <div className="h-3 w-56 rounded bg-muted" />
            </div>
            <div className="ml-auto h-4 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (!list.length) {
    return (
      <div className="text-sm text-muted-foreground">No hay ventas recientes.</div>
    );
  }

  return (
    <div
      className={`space-y-8 ${scrollable ? "pr-2" : ""} ${className}`}
      style={
        scrollable
          ? {
              maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
              overflowY: "auto",
              scrollbarWidth: "thin",
            }
          : undefined
      }
      aria-label="Ventas recientes"
    >
      {list.map((sale, index) => {
        const initials = getInitials(sale.buyerName, sale.buyerEmail);
        return (
          <div className="flex items-center" key={`${sale.buyerEmail}-${index}`}>
            <Avatar className="h-9 w-9">
              {sale.avatarUrl ? (
                <AvatarImage src={sale.avatarUrl} alt={sale.buyerName || "Avatar"} />
              ) : (
                <AvatarImage
                  src={`/avatars/0${(index % 5) + 1}.png`}
                  alt="Avatar"
                />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {sale.buyerName || "Sin nombre"}
              </p>
              <p className="text-sm text-muted-foreground">
                {sale.buyerEmail || "sin-email@example.com"}
              </p>
            </div>

            <div className="ml-auto font-medium">
              {`+${fmtAmount(sale.total, sale.currency || "ARS")}`}
            </div>
          </div>
        );
      })}
    </div>
  );
}
