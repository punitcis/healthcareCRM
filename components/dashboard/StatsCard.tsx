import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  color?: "blue" | "green" | "red" | "amber" | "teal" | "purple";
  className?: string;
}

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-100 text-blue-700",
    text: "text-blue-700",
    border: "border-blue-100",
  },
  green: {
    bg: "bg-green-50",
    icon: "bg-green-100 text-green-700",
    text: "text-green-700",
    border: "border-green-100",
  },
  red: {
    bg: "bg-red-50",
    icon: "bg-red-100 text-red-700",
    text: "text-red-700",
    border: "border-red-100",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "bg-amber-100 text-amber-700",
    text: "text-amber-700",
    border: "border-amber-100",
  },
  teal: {
    bg: "bg-cyan-50",
    icon: "bg-cyan-100 text-cyan-700",
    text: "text-cyan-700",
    border: "border-cyan-100",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-100 text-purple-700",
    text: "text-purple-700",
    border: "border-purple-100",
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "blue",
  className,
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <Card className={cn("border", colors.border, className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-1.5">
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.positive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {trend.positive ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-xs text-gray-400">vs ieri</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl shrink-0",
              colors.icon
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
