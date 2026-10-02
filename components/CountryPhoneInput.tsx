"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check, Globe } from "lucide-react";
import { COUNTRY_PHONE_CODES, CountryPhoneData, parsePhoneNumber } from "@/lib/country-codes";

interface CountryPhoneInputProps {
  value: string;
  onChange: (fullPhone: string) => void;
  placeholder?: string;
  isError?: boolean;
  isValid?: boolean;
  id?: string;
  className?: string;
  disabled?: boolean;
}

export const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  value,
  onChange,
  placeholder,
  isError = false,
  isValid = false,
  id,
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);

  // Parse current value to determine active country & national digits
  const { country: currentCountry, nationalNumber } = useMemo(() => {
    return parsePhoneNumber(value);
  }, [value]);

  const [selectedCountry, setSelectedCountry] = useState<CountryPhoneData>(currentCountry);

  // Sync selectedCountry when value externally changes with a different dial code
  useEffect(() => {
    if (value && value.startsWith("+")) {
      const parsed = parsePhoneNumber(value);
      setSelectedCountry(parsed.country);
    }
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Filter countries by search query
  const filteredCountries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return COUNTRY_PHONE_CODES;
    return COUNTRY_PHONE_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.dialCode.replace("+", "").includes(q)
    );
  }, [searchQuery]);

  // Handle selecting a country from dropdown
  const handleSelectCountry = (country: CountryPhoneData) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery("");

    // Reconstruct full phone with new country code
    const newFullPhone = nationalNumber ? `${country.dialCode} ${nationalNumber}` : `${country.dialCode} `;
    onChange(newFullPhone);
    numberInputRef.current?.focus();
  };

  // Handle national number typing
  const handleNationalNumberChange = (rawDigits: string) => {
    // If user pastes a full international number starting with +
    if (rawDigits.trim().startsWith("+")) {
      const parsed = parsePhoneNumber(rawDigits);
      setSelectedCountry(parsed.country);
      const cleaned = parsed.nationalNumber.replace(/[^0-9 -]/g, "");
      onChange(cleaned ? `${parsed.country.dialCode} ${cleaned}` : "");
      return;
    }
    // Only permit digits, spaces, hyphens, and parenthesis
    const cleaned = rawDigits.replace(/[^0-9 -]/g, "");
    const combined = cleaned ? `${selectedCountry.dialCode} ${cleaned}` : "";
    onChange(combined);
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative flex items-stretch rounded-xl border transition-all ${
        isError
          ? "border-rose-400 bg-rose-50/40 dark:bg-rose-950/30 ring-1 ring-rose-400/40 text-rose-900 dark:text-rose-100"
          : isValid
          ? "border-emerald-400 dark:border-emerald-700 bg-emerald-50/20 dark:bg-emerald-950/10 ring-1 ring-emerald-400/30 text-slate-900 dark:text-slate-100"
          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/30"
      } ${className}`}
    >
      {/* Country Code Trigger - Compact & Clean */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Country Code"
        className="flex items-center gap-1 px-2.5 py-2 shrink-0 border-r border-slate-200 dark:border-slate-800 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer select-none rounded-l-xl"
      >
        <span className="text-base leading-none" role="img" aria-label={selectedCountry.name}>
          {selectedCountry.flag}
        </span>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-tight">
          {selectedCountry.dialCode}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Phone Number Input - Seamlessly integrated */}
      <input
        ref={numberInputRef}
        id={id}
        type="tel"
        inputMode="tel"
        disabled={disabled}
        value={nationalNumber}
        onKeyDown={(e) => {
          // Allow navigation keys, backspace, delete, tab, enter, Ctrl/Cmd shortcuts
          if (
            e.key === "Backspace" ||
            e.key === "Delete" ||
            e.key === "Tab" ||
            e.key === "Escape" ||
            e.key === "Enter" ||
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight" ||
            e.key === "ArrowUp" ||
            e.key === "ArrowDown" ||
            e.ctrlKey ||
            e.metaKey
          ) {
            return;
          }
          // Block alphabetic and other non-digit keys
          if (!/[0-9 -]/.test(e.key)) {
            e.preventDefault();
          }
        }}
        onChange={(e) => handleNationalNumberChange(e.target.value)}
        placeholder={placeholder || selectedCountry.formatHint || "98765 43210"}
        className="w-full flex-1 min-w-0 bg-transparent px-2.5 py-2 text-xs font-semibold focus:outline-none placeholder:text-slate-400 text-slate-900 dark:text-slate-100 rounded-r-xl"
      />

      {/* Scrollable & Searchable Country Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 max-h-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Header */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country (+91, India, US...)"
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Scrollable List */}
          <div className="overflow-y-auto flex-1 max-h-56 divide-y divide-slate-100 dark:divide-slate-800/60 scrollbar-thin">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const isSelected = selectedCountry.code === country.code && selectedCountry.dialCode === country.dialCode;
                return (
                  <button
                    key={`${country.code}-${country.dialCode}`}
                    type="button"
                    onClick={() => handleSelectCountry(country)}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950/50 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/80 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="text-base shrink-0 leading-none">{country.flag}</span>
                      <span className="truncate font-medium">{country.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">({country.code})</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      <span>{country.dialCode}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 flex flex-col items-center gap-1">
                <Globe className="w-5 h-5 opacity-40" />
                <span>No countries matching &quot;{searchQuery}&quot;</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
