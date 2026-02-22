import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

export function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card className="border-none bg-secondary/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium font-headline">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-300">{value}</div>
        <p className="text-xs text-muted-foreground text-slate-300">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
