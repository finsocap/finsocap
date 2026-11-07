"use client";

import React, { useEffect, useState, useRef } from "react";
import { Sun, Cloud, CloudRain, CloudSnow, Moon, MapPin, Droplets, Wind, Thermometer, Sunrise, Sunset, RefreshCw } from "lucide-react";

interface WeatherData {
  city: string;
  region: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windKph: number;
  conditionText: string;
  isDay: boolean;
  sunriseTime?: string;
  sunsetTime?: string;
  sunriseHour?: number;
  sunsetHour?: number;
}

export default function WeatherWidgetCard({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveTime, setLiveTime] = useState("");
  const [liveAmPm, setLiveAmPm] = useState("");
  const [liveDate, setLiveDate] = useState("");
  const [currentHour, setCurrentHour] = useState<number>(12);
  const activeQueryRef = useRef<string>("");

  // 1. Live browser clock (12-hour format e.g., 07:04 PM) & Hour Tracking
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const rawHours = now.getHours();
      const rawMinutes = now.getMinutes();
      // Floating hour for precise transition (e.g. 19:15 = 19.25)
      setCurrentHour(rawHours + rawMinutes / 60);

      const hours12 = rawHours % 12 === 0 ? 12 : rawHours % 12;
      const formattedHours = String(hours12).padStart(2, "0");
      const minutes = String(rawMinutes).padStart(2, "0");
      const ampm = rawHours >= 12 ? "PM" : "AM";

      setLiveTime(`${formattedHours}:${minutes}`);
      setLiveAmPm(ampm);

      const dayName = now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
      const monthNum = String(now.getMonth() + 1).padStart(2, "0");
      const dayNum = String(now.getDate()).padStart(2, "0");
      setLiveDate(`${dayName} ${monthNum}-${dayNum}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch Weather using Browser Geolocation with auto:ip fallback
  const fetchWeather = async (queryParam?: string, isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const apiKey = "9431aa0774214f6a853130539260711";
      const q = queryParam || activeQueryRef.current || "auto:ip";
      const res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(
          q
        )}&days=1&aqi=no&alerts=no`
      );
      if (!res.ok) throw new Error("Weather request failed");
      const json = await res.json();
      const astro = json.forecast?.forecastday?.[0]?.astro;

      // Parse sunrise & sunset strings (e.g., "06:41 AM" -> 6.68, "06:02 PM" -> 18.03)
      const parseTimeToDecimalHour = (timeStr?: string, defaultHour: number = 18): number => {
        if (!timeStr) return defaultHour;
        const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return defaultHour;
        let h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const ampm = match[3].toUpperCase();
        if (ampm === "PM" && h < 12) h += 12;
        if (ampm === "AM" && h === 12) h = 0;
        return h + m / 60;
      };

      const sunriseDecimal = parseTimeToDecimalHour(astro?.sunrise, 6.25);
      const sunsetDecimal = parseTimeToDecimalHour(astro?.sunset, 18.0);

      setData({
        city: json.location?.name || "Local",
        region: json.location?.region || json.location?.country || "",
        temp: Math.round(json.current?.temp_c ?? 26),
        feelsLike: Math.round(json.current?.feelslike_c ?? json.current?.temp_c ?? 26),
        humidity: Math.round(json.current?.humidity ?? 45),
        windKph: Math.round(json.current?.wind_kph ?? 12),
        conditionText: json.current?.condition?.text || "Clear",
        isDay: json.current?.is_day === 1,
        sunriseTime: astro?.sunrise || "06:30 AM",
        sunsetTime: astro?.sunset || "06:00 PM",
        sunriseHour: sunriseDecimal,
        sunsetHour: sunsetDecimal,
      });
    } catch {
      if (!data) {
        setData({
          city: "New Delhi",
          region: "India",
          temp: 28,
          feelsLike: 29,
          humidity: 48,
          windKph: 10,
          conditionText: "Clear",
          isDay: false,
          sunriseTime: "06:30 AM",
          sunsetTime: "06:00 PM",
          sunriseHour: 6.5,
          sunsetHour: 18.0,
        });
      }
    } finally {
      setLoading(false);
      if (isManualRefresh) {
        setTimeout(() => setIsRefreshing(false), 600);
      }
    }
  };

  const handleManualRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRefreshing) return;
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latLon = `${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`;
          activeQueryRef.current = latLon;
          fetchWeather(latLon, true);
        },
        () => {
          fetchWeather("auto:ip", true);
        },
        { timeout: 7000 }
      );
    } else {
      fetchWeather(undefined, true);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latLon = `${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`;
          activeQueryRef.current = latLon;
          fetchWeather(latLon);
        },
        () => {
          fetchWeather("auto:ip");
        },
        { timeout: 7000 }
      );
    } else {
      fetchWeather("auto:ip");
    }

    const interval = setInterval(() => {
      fetchWeather();
    }, 600000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic theme based on real-time Astronomy (Exact Sunrise & Sunset from Weather API)
  const getTheme = () => {
    const text = (data?.conditionText || "").toLowerCase();
    const sunrise = data?.sunriseHour ?? 6.5;
    const sunset = data?.sunsetHour ?? 18.0;

    // Is it daylight according to actual solar position or WeatherAPI
    const isDay = data?.isDay ?? (currentHour >= sunrise && currentHour < sunset);

    // Rain condition priority
    if (text.includes("rain") || text.includes("drizzle") || text.includes("shower") || text.includes("thunder")) {
      return {
        bg: "from-[#401a6b] via-[#35155a] to-[#1f0c38]",
        sunGlow: "from-purple-300/30 to-indigo-400/20",
        hill1: "text-[#2d114d]",
        hill2: "text-[#18082c]",
        Icon: CloudRain,
        ambient: "rain",
        phaseLabel: "Rainy",
      };
    }

    // Snow condition priority
    if (text.includes("snow") || text.includes("ice") || text.includes("blizzard")) {
      return {
        bg: "from-[#1d1b46] via-[#282156] to-[#3b2462]",
        sunGlow: "from-blue-200/40 to-indigo-300/20",
        hill1: "text-[#151336]",
        hill2: "text-[#0d0c24]",
        Icon: CloudSnow,
        ambient: "snow",
        phaseLabel: "Snowy",
      };
    }

    // Cloud condition priority
    if (text.includes("cloud") || text.includes("overcast") || text.includes("fog") || text.includes("mist") || text.includes("haze")) {
      return {
        bg: isDay
          ? "from-[#1e78b7] via-[#2980b9] to-[#1a5f91]"
          : "from-[#152347] via-[#1c2e5c] to-[#0f1730]",
        sunGlow: "from-sky-200/50 to-blue-300/20",
        hill1: isDay ? "text-[#165682]" : "text-[#0d162e]",
        hill2: isDay ? "text-[#0e3d5e]" : "text-[#060b17]",
        Icon: Cloud,
        ambient: "cloud",
        phaseLabel: "Overcast",
      };
    }

    // 1. Sunrise Window: 45 mins before to 45 mins after actual astronomical sunrise
    if (currentHour >= sunrise - 0.75 && currentHour < sunrise + 0.75) {
      return {
        bg: "from-[#f97316] via-[#ec4899] to-[#8b5cf6]",
        sunGlow: "from-amber-200 via-orange-400 to-rose-500",
        hill1: "text-[#701a75]",
        hill2: "text-[#4a044e]",
        Icon: Sunrise,
        ambient: "sunrise",
        phaseLabel: "Sunrise",
      };
    }

    // 2. Sunset / Shaam Window: 45 mins before to 30 mins after actual astronomical sunset
    if (currentHour >= sunset - 0.75 && currentHour < sunset + 0.5) {
      return {
        bg: "from-[#9a3412] via-[#7c2d12] to-[#3b0764]",
        sunGlow: "from-amber-400 via-orange-500 to-rose-600",
        hill1: "text-[#2e0854]",
        hill2: "text-[#150326]",
        Icon: Sunset,
        ambient: "sunset",
        phaseLabel: "Sunset",
      };
    }

    // 3. Morning / Daytime (Between Sunrise and Noon)
    if (currentHour >= sunrise + 0.75 && currentHour < 12) {
      return {
        bg: "from-[#2563eb] via-[#3b82f6] to-[#60a5fa]",
        sunGlow: "from-amber-200 via-yellow-300 to-amber-400",
        hill1: "text-[#1e40af]",
        hill2: "text-[#172554]",
        Icon: Sun,
        ambient: "sunny",
        phaseLabel: "Morning",
      };
    }

    // 4. Noon / Afternoon (Between 12:00 PM and Sunset Window)
    if (currentHour >= 12 && currentHour < sunset - 0.75) {
      return {
        bg: "from-[#522f8e] via-[#6539a6] to-[#7b46ba]",
        sunGlow: "from-amber-300 via-yellow-400 to-amber-500",
        hill1: "text-[#3f2270]",
        hill2: "text-[#28144a]",
        Icon: Sun,
        ambient: "sunny",
        phaseLabel: "Afternoon",
      };
    }

    // 5. Night / Raat (After Sunset + 30m or before Sunrise - 45m)
    return {
      bg: "from-[#070d24] via-[#0f1738] to-[#152352]",
      sunGlow: "from-amber-100/40 via-blue-200/20 to-indigo-300/10",
      hill1: "text-[#060b1c]",
      hill2: "text-[#02040a]",
      Icon: Moon,
      ambient: "night",
      phaseLabel: "Night",
    };
  };

  const theme = getTheme();
  const IconComponent = theme.Icon;

  // Mini collapsed view for icon-only sidebar
  if (isCollapsed) {
    return (
      <div
        title={`${data?.city || "Weather"} · ${data?.temp ?? "--"}° · ${data?.conditionText || ""}`}
        className={`w-10 h-10 mx-auto rounded-xl overflow-hidden bg-gradient-to-br ${theme.bg} text-white flex flex-col items-center justify-center border border-white/20 shadow-md cursor-pointer`}
      >
        <IconComponent className="w-4 h-4 text-amber-300 animate-pulse" />
        <span className="text-[9px] font-black leading-none mt-0.5">{data?.temp ?? "--"}°</span>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-[180px] rounded-2xl overflow-hidden bg-gradient-to-r ${theme.bg} text-white shadow-md shadow-indigo-950/20 select-none transition-all duration-700 shrink-0 border border-white/20 flex flex-col justify-between`}
    >
      {/* 1. Animated Celestial Orb (Sun/Moon/Sunrise/Sunset) */}
      <div className={`absolute pointer-events-none transition-all duration-1000 ${
        theme.ambient === "sunrise"
          ? "right-8 bottom-12"
          : theme.ambient === "sunset"
          ? "right-10 bottom-14"
          : "right-6 -top-3"
      }`}>
        <div
          className={`w-32 h-32 rounded-full bg-gradient-to-br ${theme.sunGlow} blur-[1px] opacity-90 animate-pulse`}
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute -inset-3 rounded-full bg-white/20 blur-md animate-ping"
          style={{ animationDuration: "6s" }}
        />
      </div>

      {/* 2. Twinkling Stars for Night & Evening Ambients (Positioned in middle/lower sky, away from clock) */}
      {(theme.ambient === "night" || theme.ambient === "sunset") && (
        <div className="absolute inset-0 pointer-events-none">
          <span className="absolute top-14 right-28 w-1 h-1 rounded-full bg-white animate-ping opacity-75" style={{ animationDuration: "3s" }} />
          <span className="absolute top-16 right-16 w-1.5 h-1.5 rounded-full bg-amber-200 animate-pulse opacity-90" style={{ animationDuration: "2.5s" }} />
          <span className="absolute top-20 right-8 w-1 h-1 rounded-full bg-white animate-pulse opacity-80" style={{ animationDuration: "4s" }} />
          <span className="absolute top-12 left-28 w-1 h-1 rounded-full bg-sky-200 animate-pulse opacity-70" style={{ animationDuration: "3.5s" }} />
          <span className="absolute top-18 right-24 w-1 h-1 rounded-full bg-yellow-100 animate-ping opacity-60" style={{ animationDuration: "4.5s" }} />
        </div>
      )}

      {/* 3. Rain Ambient Effect */}
      {theme.ambient === "rain" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
          <div className="w-[200%] h-full bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,0.7)_50%,transparent_60%)] bg-[length:14px_14px] animate-pulse" />
        </div>
      )}

      {/* 4. Snow Ambient Effect */}
      {theme.ambient === "snow" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <span className="absolute top-2 right-18 w-1.5 h-1.5 rounded-full bg-white/90 animate-bounce" style={{ animationDuration: "2s" }} />
          <span className="absolute top-7 right-10 w-1 h-1 rounded-full bg-white/80 animate-bounce" style={{ animationDuration: "3s" }} />
          <span className="absolute top-14 right-22 w-1 h-1 rounded-full bg-white/70 animate-bounce" style={{ animationDuration: "2.5s" }} />
        </div>
      )}

      {/* 5. Layered Silhouette Mountain Hills (Reference SS2 Design) */}
      <svg
        className={`absolute bottom-0 left-0 right-0 w-full h-20 pointer-events-none ${theme.hill1} opacity-50`}
        viewBox="0 0 240 65"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0,38 Q40,16 85,32 T170,24 T215,36 T240,30 L240,65 L0,65 Z" />
      </svg>
      <svg
        className={`absolute bottom-0 left-0 right-0 w-full h-14 pointer-events-none ${theme.hill2} opacity-85`}
        viewBox="0 0 240 50"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0,28 Q50,14 100,32 T190,22 T240,30 L240,50 L0,50 Z" />
      </svg>

      {/* 6. Dynamic Foreground Weather Information */}
      <div className="relative z-10 h-full p-4 flex flex-col justify-between">
        {/* Top Header: Weather Condition + Day/Night Phase + Live Browser 12h Clock */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/15">
              <IconComponent
                className={`w-4 h-4 text-amber-300 drop-shadow-sm shrink-0 ${theme.ambient === "sunny" ? "animate-spin" : "animate-pulse"}`}
                style={{ animationDuration: theme.ambient === "sunny" ? "16s" : "3s" }}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="capitalize tracking-wide truncate max-w-[110px] text-[12px] font-extrabold text-white leading-tight">
                {loading ? "Detecting..." : data?.conditionText}
              </span>
              <span className="text-[10px] font-semibold text-amber-200/90 tracking-wide uppercase leading-none mt-0.5">
                {theme.phaseLabel}
              </span>
            </div>
          </div>

          {/* Live Browser 12h Clock (e.g. 07:11 PM) & Date */}
          <div className="text-right flex flex-col items-end shrink-0 pl-2">
            <div className="flex items-baseline justify-end gap-1 font-mono font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] leading-none">
              <span className="text-[15px] tracking-tight">{liveTime || "07:00"}</span>
              <span className="text-[11px] font-extrabold text-amber-300 font-sans tracking-normal leading-none ml-0.5">
                {liveAmPm || "PM"}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block self-center ml-1" />
            </div>
            <div className="text-[10px] font-extrabold text-white/90 leading-none mt-1 tracking-wider uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
              {liveDate || "TODAY"}
            </div>
          </div>
        </div>

        {/* Middle: Temperature + Live Detected City */}
        <div className="flex items-end justify-between my-auto py-1.5">
          <div className="flex items-start select-none">
            <span className="text-4xl sm:text-[42px] font-black tracking-tight leading-none text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              {loading ? "--" : data?.temp}
            </span>
            <span className="text-xl sm:text-2xl font-bold leading-none ml-0.5 text-amber-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] -mt-1">
              °
            </span>
          </div>

          {/* Location Badge + Instant Refresh Action */}
          <div className="text-right flex items-center justify-end gap-1.5 min-w-0">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              title="Refresh live weather & location"
              className="p-1 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white/90 hover:text-amber-300 transition-all duration-200 active:scale-95 disabled:opacity-75 shadow-sm"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-amber-300" : ""}`} />
            </button>

            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-md">
              <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
              <span className="text-[11px] font-extrabold text-white tracking-wide drop-shadow truncate max-w-[105px] block">
                {loading ? "Locating..." : data?.city}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Pill Row: Extended Live Telemetry (Feels Like, Humidity, Wind) */}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/20 text-[11px] font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
          <div className="flex items-center gap-1.5" title="Feels like temperature">
            <Thermometer className="w-3.5 h-3.5 text-amber-300" />
            <span>Feels {loading ? "--" : `${data?.feelsLike}°`}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Humidity percentage">
            <Droplets className="w-3.5 h-3.5 text-sky-300" />
            <span>{loading ? "--" : `${data?.humidity}%`}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Wind speed">
            <Wind className="w-3.5 h-3.5 text-teal-300" />
            <span>{loading ? "--" : `${data?.windKph}km/h`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
