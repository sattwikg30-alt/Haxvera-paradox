"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sprout,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CloudRain,
  Bell,
  ThermometerSun,
  Droplets,
  Wind,
  MapPin,
  Sun,
  Loader2,
} from "lucide-react";
import { getUser, getToken } from "@/lib/authClient";

// ─── Types ──────────────────────────────────────────────────────────────────

interface CropDistribution {
  type: string;
  count: number;
  percentage: number;
}

interface Alert {
  id: number;
  message: string;
  severity: "high" | "medium" | "low";
}

interface Weather {
  location: string;
  temp: number;
  rain: number;
  humidity: number;
  windSpeed: number;
  condition: string;
}

interface OverviewData {
  totalCrops: number;
  avgYield: number | null;
  dominantRisk: string | null;
  cropDistribution: CropDistribution[];
  alerts: Alert[];
  weather: Weather | null;
  yieldChangePercent: number | null;
}

// ─── Palette for crop bars ──────────────────────────────────────────────────
const BAR_COLORS = [
  "bg-accent-green",
  "bg-yellow-500",
  "bg-sky-400",
  "bg-purple-400",
  "bg-pink-400",
  "bg-orange-400",
];

// ─── Sub-components ─────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <Card className="bg-white/5 border-white/10 animate-pulse">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-3 w-24 rounded bg-white/10" />
      <div className="h-8 w-8 rounded-lg bg-white/10" />
    </CardHeader>
    <CardContent>
      <div className="h-8 w-20 rounded bg-white/10 mt-2" />
      <div className="h-3 w-28 rounded bg-white/10 mt-3" />
    </CardContent>
  </Card>
);

const SummaryCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass,
  borderClass,
}: {
  title: string;
  value: string;
  subtitle: React.ReactNode;
  icon: React.ElementType;
  colorClass: string;
  borderClass: string;
}) => (
  <Card
    className={`hover:${borderClass} transition-colors group relative overflow-hidden bg-white/5 border-white/10`}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-text-secondary">
        {title}
      </CardTitle>
      <div
        className={`p-2 rounded-lg bg-white/5 border border-white/10 ${colorClass}`}
      >
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className={`text-3xl font-bold tracking-tight mt-2 ${colorClass}`}>
        {value}
      </div>
      <div className="mt-3 flex items-center">{subtitle}</div>
    </CardContent>
  </Card>
);

const InsightSection = ({
  data,
}: {
  data: OverviewData;
}) => {
  const { yieldChangePercent, dominantRisk, cropDistribution, totalCrops } =
    data;

  const riskCropsCount = data.alerts.length;

  return (
    <Card className="hover:border-accent-green/30 transition-colors bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle>Quick Insights</CardTitle>
        <CardDescription>
          Automated analysis based on your farm activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Yield Snapshot */}
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-blue-500/10 text-blue-400 mt-1">
            {yieldChangePercent !== null && yieldChangePercent >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              Yield Snapshot
            </h4>
            <p className="text-sm text-text-secondary">
              {yieldChangePercent !== null
                ? `Your average yield ${
                    yieldChangePercent >= 0 ? "increased" : "decreased"
                  } by ${Math.abs(yieldChangePercent)}% compared to last month.`
                : totalCrops === 0
                ? "No crops recorded yet – add your first crop to get insights."
                : "Not enough historical data to compute yield trends yet."}
            </p>
          </div>
        </div>

        {/* Risk Insight */}
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-yellow-500/10 text-yellow-500 mt-1">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Risk Insight</h4>
            <p className="text-sm text-text-secondary">
              {riskCropsCount > 0
                ? `${riskCropsCount} crop${riskCropsCount > 1 ? "s are" : " is"} at ${
                    dominantRisk ?? "elevated"
                  } risk – review your alerts below.`
                : "No risk alerts detected across your crops. Great work!"}
            </p>
          </div>
        </div>

        {/* Crop Distribution */}
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-accent-green/10 text-accent-green mt-1">
            <Sprout className="h-4 w-4" />
          </div>
          <div className="w-full">
            <h4 className="text-sm font-semibold text-white">
              Crop Distribution
            </h4>
            {totalCrops === 0 ? (
              <p className="text-sm text-text-secondary mt-1">
                No crops to display yet.
              </p>
            ) : (
              <div className="mt-3 space-y-3 w-full md:pr-4">
                {cropDistribution.slice(0, 4).map((item, i) => (
                  <div key={item.type} className="space-y-1.5">
                    <div className="flex justify-between text-xs text-white">
                      <span>
                        {item.type} ({item.count} crop
                        {item.count > 1 ? "s" : ""})
                      </span>
                      <span className="text-text-secondary font-medium">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          BAR_COLORS[i % BAR_COLORS.length]
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const WeatherCard = ({ weather }: { weather: Weather | null }) => {
  if (!weather) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-sky-400" />
            Weather Preview
          </CardTitle>
          <CardDescription>
            Weather data unavailable – check your location settings.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="hover:border-sky-400/30 transition-colors bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-sky-400" />
          Weather Preview
        </CardTitle>
        <CardDescription>
          Current conditions at {weather.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <ThermometerSun className="h-5 w-5 text-orange-400" />
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">
                Temperature
              </p>
              <p className="font-bold text-white text-lg">{weather.temp}°C</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <Droplets className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">
                Rainfall
              </p>
              <p className="font-bold text-white text-lg">{weather.rain}mm</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <Wind className="h-5 w-5 text-teal-400" />
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">
                Humidity
              </p>
              <p className="font-bold text-white text-lg">
                {weather.humidity}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
            <Sun className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">
                Condition
              </p>
              <p className="font-bold text-white text-lg">
                {weather.condition}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const alertSeverityStyles: Record<
  Alert["severity"],
  { bg: string; border: string; text: string; iconColor: string }
> = {
  high: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    text: "text-red-100",
    iconColor: "text-red-400",
  },
  medium: {
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    text: "text-orange-100",
    iconColor: "text-orange-400",
  },
  low: {
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
    text: "text-yellow-100",
    iconColor: "text-yellow-400",
  },
};

const AlertList = ({ alerts }: { alerts: Alert[] }) => (
  <Card className="hover:border-orange-400/30 transition-colors h-full bg-white/5 border-white/10">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-orange-400" />
        Recent Alerts
        {alerts.length > 0 && (
          <span className="ml-auto text-xs font-semibold bg-orange-400/20 text-orange-300 px-2 py-0.5 rounded-full">
            {alerts.length}
          </span>
        )}
      </CardTitle>
      <CardDescription>System notifications requiring attention</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
          <div className="p-3 rounded-full bg-accent-green/10">
            <Sprout className="h-5 w-5 text-accent-green" />
          </div>
          <p className="text-sm font-medium text-white">All clear!</p>
          <p className="text-xs text-text-secondary">
            No alerts at the moment. Your crops look healthy.
          </p>
        </div>
      ) : (
        alerts.map((alert) => {
          const styles = alertSeverityStyles[alert.severity];
          return (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3 rounded-lg ${styles.bg} border ${styles.border} hover:opacity-90 transition-opacity`}
            >
              <AlertTriangle
                className={`h-5 w-5 ${styles.iconColor} shrink-0 mt-0.5`}
              />
              <p className={`text-sm font-medium ${styles.text}`}>
                {alert.message}
              </p>
            </div>
          );
        })
      )}
    </CardContent>
  </Card>
);

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function FarmerOverview() {
  const user = getUser();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const token = getToken();
        const res = await fetch("/api/dashboard/overview", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.message ?? "Failed to load overview");
        }

        const json = await res.json();
        setData(json.data);
      } catch (err: any) {
        setError(err.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchOverview();
  }, []);

  const getRiskBadgeVariant = (risk: string | null) => {
    if (!risk) return "secondary";
    const r = risk.toLowerCase();
    if (r === "high") return "destructive";
    if (r === "medium") return "warning";
    return "success";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-h-[calc(100vh-100px)] pb-10">
      {/* Header */}
      <div className="relative">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">🌾</span> Farm Overview
        </h1>
        <p className="text-base text-text-secondary">
          Monitor your crops, yields, and risks in one place
          {user?.name ? `, ${user.name}` : ""}.
        </p>
        <div className="absolute top-0 right-10 w-96 h-96 bg-accent-green/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <Card className="bg-red-500/10 border-red-500/20 p-6">
          <p className="text-sm text-red-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </p>
        </Card>
      ) : data ? (
        <>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5 z-10 relative">
            <SummaryCard
              title="Active Crops"
              value={`${data.totalCrops}`}
              subtitle={
                <p className="text-xs text-text-secondary mt-1">
                  Total monitored fields
                </p>
              }
              icon={Sprout}
              colorClass="text-accent-green"
              borderClass="border-accent-green/50"
            />
            <SummaryCard
              title="Average Yield"
              value={data.avgYield !== null ? `${data.avgYield}` : "—"}
              subtitle={
                <div className="flex items-center gap-1.5 mt-1">
                  <p className="text-xs text-text-secondary">tons/ha</p>
                  {data.yieldChangePercent !== null && (
                    <>
                      {data.yieldChangePercent >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-blue-400 ml-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400 ml-1" />
                      )}
                      <span
                        className={`text-xs font-semibold ${
                          data.yieldChangePercent >= 0
                            ? "text-blue-400"
                            : "text-red-400"
                        }`}
                      >
                        {data.yieldChangePercent > 0 ? "+" : ""}
                        {data.yieldChangePercent}%
                      </span>
                    </>
                  )}
                </div>
              }
              icon={TrendingUp}
              colorClass="text-blue-400"
              borderClass="border-blue-400/50"
            />
            <SummaryCard
              title="Risk Level"
              value={data.dominantRisk ?? "None"}
              subtitle={
                <Badge
                  variant={getRiskBadgeVariant(data.dominantRisk) as any}
                  className="mt-1"
                >
                  {data.dominantRisk
                    ? data.dominantRisk === "Low"
                      ? "Looking good"
                      : "Monitor closely"
                    : "All clear"}
                </Badge>
              }
              icon={AlertTriangle}
              colorClass="text-yellow-500"
              borderClass="border-yellow-500/50"
            />
            <SummaryCard
              title="Weather"
              value={data.weather ? `${data.weather.temp}°C` : "—"}
              subtitle={
                <p className="text-xs text-text-secondary mt-1">
                  {data.weather
                    ? `${data.weather.rain}mm rain · ${data.weather.condition}`
                    : "No weather data"}
                </p>
              }
              icon={CloudRain}
              colorClass="text-sky-400"
              borderClass="border-sky-400/50"
            />
            <SummaryCard
              title="Alerts"
              value={`${data.alerts.length}`}
              subtitle={
                <p className="text-xs text-text-secondary mt-1">
                  {data.alerts.length === 0
                    ? "No warnings"
                    : "Warnings pending"}
                </p>
              }
              icon={Bell}
              colorClass="text-orange-400"
              borderClass="border-orange-400/50"
            />
          </div>

          {/* Lower Section */}
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3 z-10 relative">
            {/* Left: Insights + Weather */}
            <div className="lg:col-span-2 space-y-6">
              <InsightSection data={data} />
              <WeatherCard weather={data.weather} />
            </div>

            {/* Right: Alerts */}
            <div className="lg:col-span-1">
              <AlertList alerts={data.alerts} />
            </div>
          </div>
        </>
      ) : null}

      {/* Full-page loading overlay (only on first mount) */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent pointer-events-none z-50">
          <Loader2 className="h-8 w-8 text-accent-green animate-spin opacity-50" />
        </div>
      )}
    </div>
  );
}