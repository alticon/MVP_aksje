import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
}

export function KPICard({ title, value, subtitle, icon: Icon, gradient }: KPICardProps) {
  return (
    <Card className={`p-6 ${gradient} text-white shadow-lg hover:shadow-xl transition-all hover:scale-102`}>
      <div className="flex items-start justify-between mb-4">
        <Icon className="w-6 h-6 opacity-90" />
      </div>
      <p className="text-sm opacity-90 mb-1">{title}</p>
      <p className="text-4xl font-bold mb-2">{value}</p>
      <p className="text-sm opacity-90">{subtitle}</p>
    </Card>
  );
}
