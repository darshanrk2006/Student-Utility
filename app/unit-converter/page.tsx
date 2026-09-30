"use client";

import React, { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-data";
import { Scale, ArrowRightLeft, Copy, Check, Sparkles } from "lucide-react";

type UnitCategory = "length" | "mass" | "data" | "temp" | "speed" | "area" | "time";

interface UnitDefinition {
  id: string;
  name: string;
  toBase: (val: number) => number;
  fromBase: (baseVal: number) => number;
}

const CATEGORIES: Record<
  UnitCategory,
  { label: string; baseUnitName: string; units: UnitDefinition[] }
> = {
  data: {
    label: "Data & Storage",
    baseUnitName: "Bytes",
    units: [
      { id: "b", name: "Bytes (B)", toBase: (v) => v, fromBase: (b) => b },
      { id: "kb", name: "Kilobytes (KB)", toBase: (v) => v * 1024, fromBase: (b) => b / 1024 },
      { id: "mb", name: "Megabytes (MB)", toBase: (v) => v * 1024 ** 2, fromBase: (b) => b / 1024 ** 2 },
      { id: "gb", name: "Gigabytes (GB)", toBase: (v) => v * 1024 ** 3, fromBase: (b) => b / 1024 ** 3 },
      { id: "tb", name: "Terabytes (TB)", toBase: (v) => v * 1024 ** 4, fromBase: (b) => b / 1024 ** 4 },
      { id: "pb", name: "Petabytes (PB)", toBase: (v) => v * 1024 ** 5, fromBase: (b) => b / 1024 ** 5 },
    ],
  },
  length: {
    label: "Length & Distance",
    baseUnitName: "Meters",
    units: [
      { id: "m", name: "Meters (m)", toBase: (v) => v, fromBase: (b) => b },
      { id: "km", name: "Kilometers (km)", toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: "cm", name: "Centimeters (cm)", toBase: (v) => v * 0.01, fromBase: (b) => b / 0.01 },
      { id: "mm", name: "Millimeters (mm)", toBase: (v) => v * 0.001, fromBase: (b) => b / 0.001 },
      { id: "in", name: "Inches (in)", toBase: (v) => v * 0.0254, fromBase: (b) => b / 0.0254 },
      { id: "ft", name: "Feet (ft)", toBase: (v) => v * 0.3048, fromBase: (b) => b / 0.3048 },
      { id: "yd", name: "Yards (yd)", toBase: (v) => v * 0.9144, fromBase: (b) => b / 0.9144 },
      { id: "mi", name: "Miles (mi)", toBase: (v) => v * 1609.344, fromBase: (b) => b / 1609.344 },
    ],
  },
  mass: {
    label: "Mass & Weight",
    baseUnitName: "Grams",
    units: [
      { id: "g", name: "Grams (g)", toBase: (v) => v, fromBase: (b) => b },
      { id: "kg", name: "Kilograms (kg)", toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: "mg", name: "Milligrams (mg)", toBase: (v) => v * 0.001, fromBase: (b) => b / 0.001 },
      { id: "lb", name: "Pounds (lbs)", toBase: (v) => v * 453.59237, fromBase: (b) => b / 453.59237 },
      { id: "oz", name: "Ounces (oz)", toBase: (v) => v * 28.34952, fromBase: (b) => b / 28.34952 },
      { id: "ton", name: "Metric Tons", toBase: (v) => v * 1000000, fromBase: (b) => b / 1000000 },
    ],
  },
  temp: {
    label: "Temperature",
    baseUnitName: "Celsius",
    units: [
      { id: "c", name: "Celsius (°C)", toBase: (v) => v, fromBase: (b) => b },
      { id: "f", name: "Fahrenheit (°F)", toBase: (v) => (v - 32) * (5 / 9), fromBase: (b) => b * (9 / 5) + 32 },
      { id: "k", name: "Kelvin (K)", toBase: (v) => v - 273.15, fromBase: (b) => b + 273.15 },
    ],
  },
  speed: {
    label: "Speed & Velocity",
    baseUnitName: "m/s",
    units: [
      { id: "mps", name: "Meters / second (m/s)", toBase: (v) => v, fromBase: (b) => b },
      { id: "kmh", name: "Kilometers / hour (km/h)", toBase: (v) => v / 3.6, fromBase: (b) => b * 3.6 },
      { id: "mph", name: "Miles / hour (mph)", toBase: (v) => v * 0.44704, fromBase: (b) => b / 0.44704 },
      { id: "knot", name: "Knots (nautical mi/h)", toBase: (v) => v * 0.514444, fromBase: (b) => b / 0.514444 },
    ],
  },
  area: {
    label: "Area",
    baseUnitName: "Square Meters",
    units: [
      { id: "sqm", name: "Square Meters (m²)", toBase: (v) => v, fromBase: (b) => b },
      { id: "sqkm", name: "Square Kilometers (km²)", toBase: (v) => v * 1e6, fromBase: (b) => b / 1e6 },
      { id: "sqft", name: "Square Feet (ft²)", toBase: (v) => v * 0.092903, fromBase: (b) => b / 0.092903 },
      { id: "acre", name: "Acres", toBase: (v) => v * 4046.86, fromBase: (b) => b / 4046.86 },
      { id: "hectare", name: "Hectares (ha)", toBase: (v) => v * 10000, fromBase: (b) => b / 10000 },
    ],
  },
  time: {
    label: "Time",
    baseUnitName: "Seconds",
    units: [
      { id: "s", name: "Seconds (s)", toBase: (v) => v, fromBase: (b) => b },
      { id: "ms", name: "Milliseconds (ms)", toBase: (v) => v * 0.001, fromBase: (b) => b / 0.001 },
      { id: "min", name: "Minutes (min)", toBase: (v) => v * 60, fromBase: (b) => b / 60 },
      { id: "hr", name: "Hours (hr)", toBase: (v) => v * 3600, fromBase: (b) => b / 3600 },
      { id: "day", name: "Days", toBase: (v) => v * 86400, fromBase: (b) => b / 86400 },
      { id: "week", name: "Weeks", toBase: (v) => v * 604800, fromBase: (b) => b / 604800 },
    ],
  },
};

export default function UnitConverterPage() {
  const tool = TOOLS.find((t) => t.id === "unit-converter")!;
  const [category, setCategory] = useState<UnitCategory>("data");
  const [inputValue, setInputValue] = useState<string>("1024");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("mb");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentCategoryData = CATEGORIES[category];

  // Set default unit when category changes
  const handleCategoryChange = (newCat: UnitCategory) => {
    setCategory(newCat);
    setSelectedUnitId(CATEGORIES[newCat].units[0].id);
  };

  // Convert input value to all other units in category
  const conversionResults = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return [];

    const fromUnit =
      currentCategoryData.units.find((u) => u.id === selectedUnitId) ||
      currentCategoryData.units[0];

    const baseVal = fromUnit.toBase(num);

    return currentCategoryData.units.map((unit) => {
      const converted = unit.fromBase(baseVal);
      // Format number nicely
      let formatted = "";
      if (Math.abs(converted) >= 1e6 || (Math.abs(converted) < 1e-4 && converted !== 0)) {
        formatted = converted.toExponential(4);
      } else {
        formatted = parseFloat(converted.toFixed(6)).toString();
      }

      return {
        unit,
        value: formatted,
        isCurrent: unit.id === selectedUnitId,
      };
    });
  }, [inputValue, selectedUnitId, currentCategoryData]);

  const handleCopy = (val: string, id: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Category Pills */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Select Unit Category
          </label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORIES) as UnitCategory[]).map((catKey) => (
              <button
                key={catKey}
                onClick={() => handleCategoryChange(catKey)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  category === catKey
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-105"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {CATEGORIES[catKey].label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Value & Source Unit Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-7">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Amount / Value
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value..."
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-base font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Source Unit
              </label>
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-bold focus:outline-none"
              >
                {currentCategoryData.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* All Converted Results Grid */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Calculated Conversions
            </h3>
            <span className="text-xs text-slate-400 font-medium">Click any value to copy</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {conversionResults.map(({ unit, value, isCurrent }) => (
              <div
                key={unit.id}
                onClick={() => handleCopy(value, unit.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
                  isCurrent
                    ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-indigo-400"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <span className="text-xs text-slate-400 font-semibold block">{unit.name}</span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-mono truncate">
                    {value}
                  </p>
                </div>

                <button
                  type="button"
                  className="p-2 rounded-xl text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors flex-shrink-0"
                  title="Copy value"
                >
                  {copiedId === unit.id ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
