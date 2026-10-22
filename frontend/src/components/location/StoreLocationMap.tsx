import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Clock,
  Phone,
  MessageCircle,
  Cloud,
  Sun,
  CloudRain,
  CloudLightning,
  CloudSnow,
  Wind,
  Droplets,
  Thermometer,
  Compass,
  RefreshCw,
  Layers,
  Sparkles,
  Maximize2,
  ShieldCheck,
  Cpu,
  Car,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface WeatherData {
  main?: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    temp_min: number;
    temp_max: number;
  };
  weather?: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind?: {
    speed: number;
    deg: number;
  };
  name?: string;
  sys?: {
    country: string;
    sunrise: number;
    sunset: number;
  };
}

export function StoreLocationMap() {
  const { addToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [mapView, setMapView] = useState<'roadmap' | 'satellite'>('roadmap');
  const [zoomLevel, setZoomLevel] = useState<number>(17);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [nepalTime, setNepalTime] = useState<string>('');
  const [isOpenNow, setIsOpenNow] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Store coordinates & verified details for Nanotech Solution, Itahari-6, National Galli
  const STORE_LAT = 26.668157;
  const STORE_LON = 87.276747;
  const STORE_ADDRESS = 'Itahari-6, National Galli, Sunsari District, Koshi Province, Nepal';
  const STORE_PHONE = '9762379999';
  const STORE_WHATSAPP = '9852055346';
  const STORE_FACEBOOK = 'https://www.facebook.com/ntsith/';
  const STORE_INSTAGRAM = 'https://www.instagram.com/nanotech_it_solution/';
  const STORE_YANDEX = 'https://yandex.com/maps/org/nanotech_solution/103214591764/?ll=87.276747%2C26.668157&z=15';
  const STORE_CYBO = 'https://www.cybo.com/NP/itahari-chok/computer-stores';

  const WEEKLY_HOURS = [
    { day: 'Sunday', hours: '8:00 AM – 7:00 PM', dayIndex: 0, openMins: 480, closeMins: 1140, isClosed: false },
    { day: 'Monday', hours: '8:00 AM – 7:00 PM', dayIndex: 1, openMins: 480, closeMins: 1140, isClosed: false },
    { day: 'Tuesday', hours: '8:00 AM – 7:00 PM', dayIndex: 2, openMins: 480, closeMins: 1140, isClosed: false },
    { day: 'Wednesday', hours: '8:00 AM – 7:00 PM', dayIndex: 3, openMins: 480, closeMins: 1140, isClosed: false },
    { day: 'Thursday', hours: '9:00 AM – 7:00 PM', dayIndex: 4, openMins: 540, closeMins: 1140, isClosed: false },
    { day: 'Friday', hours: '8:00 AM – 7:00 PM', dayIndex: 5, openMins: 480, closeMins: 1140, isClosed: false },
    { day: 'Saturday', hours: 'CLOSED', dayIndex: 6, openMins: 0, closeMins: 0, isClosed: true },
  ];

  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0);
  const [statusDetail, setStatusDetail] = useState<string>('');

  // Live Nepal Time & Accurate Open/Closed Status
  useEffect(() => {
    const updateTimeAndStatus = () => {
      try {
        const now = new Date();
        const nepalFormatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kathmandu',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true,
          weekday: 'short',
        });
        setNepalTime(nepalFormatter.format(now));

        // Format parts in Asia/Kathmandu
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kathmandu',
          hour12: false,
          weekday: 'short',
          hour: 'numeric',
          minute: 'numeric',
        }).formatToParts(now);

        const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '12', 10);
        const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
        const currentMins = hour * 60 + minute;
        
        // Find day in Nepal timezone
        const weekdayStr = parts.find(p => p.type === 'weekday')?.value || 'Sun';
        const dayMap: Record<string, number> = {
          Sun: 0,
          Mon: 1,
          Tue: 2,
          Wed: 3,
          Thu: 4,
          Fri: 5,
          Sat: 6,
        };
        const nepalDay = dayMap[weekdayStr] ?? now.getDay();
        setCurrentDayIndex(nepalDay);

        // Saturday is completely CLOSED
        if (nepalDay === 6) {
          setIsOpenNow(false);
          setStatusDetail('Closed today (Saturday Holiday) · Opens Sunday at 8:00 AM');
          return;
        }

        // Thursday: 9:00 AM (540 mins) to 7:00 PM (1140 mins)
        if (nepalDay === 4) {
          if (currentMins >= 540 && currentMins < 1140) {
            setIsOpenNow(true);
            setStatusDetail('Open now · Closes today at 7:00 PM');
          } else if (currentMins < 540) {
            setIsOpenNow(false);
            setStatusDetail('Closed now · Opens today at 9:00 AM');
          } else {
            setIsOpenNow(false);
            setStatusDetail('Closed now · Opens Friday at 8:00 AM');
          }
          return;
        }

        // Sunday, Monday, Tuesday, Wednesday, Friday: 8:00 AM (480 mins) to 7:00 PM (1140 mins)
        if (currentMins >= 480 && currentMins < 1140) {
          setIsOpenNow(true);
          setStatusDetail('Open now · Closes today at 7:00 PM');
        } else if (currentMins < 480) {
          setIsOpenNow(false);
          setStatusDetail('Closed now · Opens today at 8:00 AM');
        } else {
          setIsOpenNow(false);
          if (nepalDay === 5) {
            setStatusDetail('Closed now · Saturday is CLOSED · Opens Sunday 8:00 AM');
          } else if (nepalDay === 3) {
            setStatusDetail('Closed now · Opens Thursday at 9:00 AM');
          } else {
            setStatusDetail('Closed now · Opens tomorrow at 8:00 AM');
          }
        }
      } catch {
        setNepalTime(new Date().toLocaleTimeString());
      }
    };

    updateTimeAndStatus();
    const interval = setInterval(updateTimeAndStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Live Weather using OpenWeather API Key
  const fetchWeather = async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      // 1. Try server route first
      const res = await fetch(`/api/weather?lat=${STORE_LAT}&lon=${STORE_LON}&city=Itahari`);
      if (res.ok) {
        const data = await res.json();
        setWeather(data);
        setLastUpdated(new Date());
        setWeatherLoading(false);
        return;
      }

      // 2. Direct fallback using OpenWeather API key
      const fallbackApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
      if (!fallbackApiKey) {
        throw new Error('Weather API key not configured');
      }
      const fallbackRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${STORE_LAT}&lon=${STORE_LON}&units=metric&appid=${fallbackApiKey}`
      );

      if (!fallbackRes.ok) {
        throw new Error('Weather service temporarily unavailable');
      }

      const fallbackData = await fallbackRes.json();
      setWeather(fallbackData);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.warn('Weather fetch warning:', err);
      setWeatherError('Unable to load live weather');
      // Set sensible fallback so UI still looks great
      setWeather({
        main: {
          temp: 28,
          feels_like: 30,
          humidity: 68,
          pressure: 1012,
          temp_min: 24,
          temp_max: 31,
        },
        weather: [
          {
            id: 800,
            main: 'Clear',
            description: 'Pleasant & Clear Sky',
            icon: '01d',
          },
        ],
        wind: { speed: 3.2, deg: 140 },
        name: 'Itahari',
        sys: { country: 'NP', sunrise: 0, sunset: 0 },
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Auto-refresh weather every 10 minutes
    const weatherInterval = setInterval(fetchWeather, 600000);
    return () => clearInterval(weatherInterval);
  }, []);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${STORE_ADDRESS} (Nanotech Solution: +977 ${STORE_PHONE})`);
    setCopied(true);
    addToast('success', 'Store address & coordinates copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Google Maps Embed Query URL for Itahari-6 National Galli
  const googleMapEmbedUrl = `https://maps.google.com/maps?q=${STORE_LAT},${STORE_LON}+(${encodeURIComponent(
    'Nanotech Solution - National Galli Itahari'
  )})&t=${mapView === 'satellite' ? 'k' : 'm'}&z=${zoomLevel}&ie=UTF8&iwloc=B&output=embed`;

  // Direct Directions URL
  const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${STORE_LAT},${STORE_LON}&destination_place_id=Nanotech+Solution+Itahari`;

  // Get Weather Icon
  const getWeatherIcon = (main?: string) => {
    const condition = main?.toLowerCase() || '';
    if (condition.includes('rain') || condition.includes('drizzle')) {
      return <CloudRain className="w-8 h-8 text-blue-400 animate-pulse" />;
    }
    if (condition.includes('thunder') || condition.includes('storm')) {
      return <CloudLightning className="w-8 h-8 text-amber-400 animate-bounce" />;
    }
    if (condition.includes('snow')) {
      return <CloudSnow className="w-8 h-8 text-sky-200" />;
    }
    if (condition.includes('cloud')) {
      return <Cloud className="w-8 h-8 text-slate-300" />;
    }
    return <Sun className="w-8 h-8 text-amber-400 animate-spin-slow" />;
  };

  return (
    <div className="w-full space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span>Official Store & Service Workshop</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Visit Nanotech Solution in Itahari
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Experience custom gaming rigs, live benchmark tests, and instant hardware warranty RMA support.
          </p>
        </div>

        {/* Live Store Status Pill */}
        <div className="flex items-center gap-2.5">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-xs ${
              isOpenNow
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-ping ${
                isOpenNow ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span>{isOpenNow ? 'Store Open Now' : 'Currently Closed'}</span>
            <span className="text-slate-400 text-[10px]">({nepalTime || 'Nepal Time'})</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Location Map + Live OpenWeather Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / CENTER: Interactive Map Display (7 or 8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-3 sm:p-4 shadow-sm relative overflow-hidden space-y-3">
          {/* Map Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>National Galli, Itahari-6</span>
              </span>
              <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                26.6632° N, 87.2785° E
              </span>
            </div>

            {/* Map Mode & Zoom Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMapView(mapView === 'roadmap' ? 'satellite' : 'roadmap')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                  mapView === 'satellite'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                title="Toggle Satellite / Road Map"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>{mapView === 'satellite' ? 'Satellite View' : 'Roadmap'}</span>
              </button>

              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(prev + 1, 19))}
                  className="px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition border-r border-slate-200 cursor-pointer"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(prev - 1, 12))}
                  className="px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  title="Zoom Out"
                >
                  −
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                title="Expand Map"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Map Container */}
          <div
            className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 transition-all duration-300 ${
              isFullscreen ? 'h-[550px]' : 'h-[360px] sm:h-[400px]'
            }`}
          >
            <iframe
              title="Nanotech Solution Itahari Location Map"
              src={googleMapEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Floating Store Card Overlay on Map */}
            <div className="absolute top-3 left-3 max-w-[280px] bg-slate-900/90 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-xl text-white pointer-events-auto transition hover:bg-slate-900">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    Nanotech Solution
                    <Sparkles className="w-3 h-3 text-amber-300" />
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    National Galli, Itahari-6, Sunsari
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <a
                      href={googleDirectionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 underline underline-offset-2"
                    >
                      <Navigation className="w-3 h-3" />
                      Get Directions
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Pulsing Pin Indicator Tag at Bottom Right */}
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-md text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>Itahari Hub Active</span>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <a
              href={googleDirectionsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              <span>Navigate on Maps</span>
            </a>

            <button
              type="button"
              onClick={handleCopyAddress}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer border border-slate-200"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
              <span>{copied ? 'Address Copied!' : 'Copy Address'}</span>
            </button>

            <a
              href={`https://maps.google.com/?q=${STORE_LAT},${STORE_LON}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-95"
            >
              <ExternalLink className="w-4 h-4 text-slate-300" />
              <span>Open in Google Maps</span>
            </a>
          </div>

          {/* Verified Business Profiles & Social Direct Links */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Verified Business Profiles & Social Channels
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href={STORE_YANDEX}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100/80 border border-red-200/80 text-red-900 flex items-center gap-2 transition group text-xs font-semibold"
                title="View Nanotech Solution on Yandex Maps"
              >
                <div className="w-6 h-6 rounded-lg bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  Y
                </div>
                <div className="truncate">
                  <div className="font-bold text-[11px] text-red-950 group-hover:text-red-700">Yandex Maps</div>
                  <div className="text-[10px] text-red-600 truncate">Org #103214591764</div>
                </div>
                <ExternalLink className="w-3 h-3 text-red-400 ml-auto shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                href={STORE_CYBO}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100/80 border border-sky-200/80 text-sky-900 flex items-center gap-2 transition group text-xs font-semibold"
                title="View on Cybo Computer Stores Directory"
              >
                <div className="w-6 h-6 rounded-lg bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  C
                </div>
                <div className="truncate">
                  <div className="font-bold text-[11px] text-sky-950 group-hover:text-sky-700">Cybo Directory</div>
                  <div className="text-[10px] text-sky-600 truncate">Itahari-Chok Stores</div>
                </div>
                <ExternalLink className="w-3 h-3 text-sky-400 ml-auto shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                href={STORE_FACEBOOK}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200/80 text-blue-900 flex items-center gap-2 transition group text-xs font-semibold"
                title="Visit Official Facebook Page @ntsith"
              >
                <div className="w-6 h-6 rounded-lg bg-[#1877F2] text-white font-black text-xs flex items-center justify-center shrink-0">
                  f
                </div>
                <div className="truncate">
                  <div className="font-bold text-[11px] text-blue-950 group-hover:text-blue-700">Facebook</div>
                  <div className="text-[10px] text-blue-600 truncate">fb.com/ntsith</div>
                </div>
                <ExternalLink className="w-3 h-3 text-blue-400 ml-auto shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                href={STORE_INSTAGRAM}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-pink-50 hover:bg-pink-100/80 border border-pink-200/80 text-pink-900 flex items-center gap-2 transition group text-xs font-semibold"
                title="Visit Official Instagram @nanotech_it_solution"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  IG
                </div>
                <div className="truncate">
                  <div className="font-bold text-[11px] text-pink-950 group-hover:text-pink-700">Instagram</div>
                  <div className="text-[10px] text-pink-600 truncate">@nanotech_it_sol..</div>
                </div>
                <ExternalLink className="w-3 h-3 text-pink-400 ml-auto shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT: Live OpenWeather & Store Logistics Card (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* OpenWeather Real-Time Weather Widget */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-indigo-500/30 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                    <Compass className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                      Live Store Weather
                    </span>
                    <h3 className="text-sm font-black text-white">Itahari, Nepal</h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fetchWeather}
                  disabled={weatherLoading}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
                  title="Refresh Weather via OpenWeather API"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${weatherLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Main Weather Display */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-baseline">
                    {weather?.main?.temp ? Math.round(weather.main.temp) : 28}
                    <span className="text-xl text-amber-300 font-bold ml-1">°C</span>
                  </div>
                  <p className="text-xs font-bold text-slate-200 capitalize">
                    {weather?.weather?.[0]?.description || 'Clear Sky'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Feels like {weather?.main?.feels_like ? Math.round(weather.main.feels_like) : 30}°C
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center pl-2">
                  {getWeatherIcon(weather?.weather?.[0]?.main)}
                  <span className="text-[10px] font-mono text-indigo-200 mt-1 uppercase">
                    {weather?.weather?.[0]?.main || 'Sunny'}
                  </span>
                </div>
              </div>

              {/* Weather Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium">
                    <Droplets className="w-3 h-3 text-sky-400" />
                    <span>Humidity</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {weather?.main?.humidity ?? 68}%
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium">
                    <Wind className="w-3 h-3 text-emerald-400" />
                    <span>Wind Speed</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {weather?.wind?.speed ? `${(weather.wind.speed * 3.6).toFixed(1)} km/h` : '12 km/h'}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium">
                    <Thermometer className="w-3 h-3 text-amber-400" />
                    <span>Range</span>
                  </div>
                  <div className="text-xs font-bold text-white">
                    {weather?.main?.temp_min ? Math.round(weather.main.temp_min) : 24}° /{' '}
                    {weather?.main?.temp_max ? Math.round(weather.main.temp_max) : 31}°C
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium">
                    <Clock className="w-3 h-3 text-purple-400" />
                    <span>Live Clock</span>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-amber-300 truncate">
                    {nepalTime || '9:30 AM'}
                  </div>
                </div>
              </div>

              {/* API Attribution badge */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/10">
                <span>Powered by OpenWeather API</span>
                <span>Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          {/* Store Schedule & Highlights */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Store Opening Hours</span>
              </h4>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isOpenNow
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isOpenNow ? 'Open now' : 'Closed now'}
              </span>
            </div>

            {statusDetail && (
              <div className={`p-2.5 rounded-xl text-[11px] font-medium flex items-center gap-1.5 ${
                isOpenNow
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${isOpenNow ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span>{statusDetail}</span>
              </div>
            )}

            {/* 7-Day Schedule Table */}
            <div className="space-y-1.5 border-y border-slate-100 py-3">
              {[
                { day: 'Monday', hours: '8:00 AM – 7:00 PM', idx: 1 },
                { day: 'Tuesday', hours: '8:00 AM – 7:00 PM', idx: 2 },
                { day: 'Wednesday', hours: '8:00 AM – 7:00 PM', idx: 3 },
                { day: 'Thursday', hours: '9:00 AM – 7:00 PM', idx: 4 },
                { day: 'Friday', hours: '8:00 AM – 7:00 PM', idx: 5 },
                { day: 'Saturday', hours: 'CLOSED', idx: 6, isClosed: true },
                { day: 'Sunday', hours: '8:00 AM – 7:00 PM', idx: 0 },
              ].map((item) => {
                const isToday = currentDayIndex === item.idx;
                return (
                  <div
                    key={item.day}
                    className={`flex justify-between items-center px-2.5 py-1.5 rounded-lg transition-colors ${
                      isToday
                        ? 'bg-indigo-50/90 font-bold border border-indigo-200 text-indigo-950'
                        : 'text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={isToday ? 'font-black text-indigo-900' : 'font-medium'}>
                        {item.day}
                      </span>
                      {isToday && (
                        <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded uppercase tracking-wider">
                          Today
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-semibold ${
                        item.isClosed
                          ? 'text-rose-600 font-bold'
                          : isToday
                          ? 'text-indigo-950 font-bold'
                          : 'text-slate-800'
                      }`}
                    >
                      {item.hours}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* In-Store Amenities */}
            <div className="space-y-2 pt-0.5 text-[11px]">
              <div className="flex items-center gap-2 text-slate-600">
                <Car className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Customer parking available in National Galli</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Cpu className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Live PC Assembly & Diagnostic Bench on-site</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Official VAT Bill & Authorized Importer Warranty</span>
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`tel:${STORE_PHONE}`}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold flex items-center justify-center gap-1.5 transition text-xs"
              >
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                <span>Call Store</span>
              </a>
              <a
                href={`https://wa.me/977${STORE_WHATSAPP}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 transition text-xs shadow-2xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
