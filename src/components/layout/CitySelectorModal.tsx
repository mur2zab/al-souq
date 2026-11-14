'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CITIES } from '@/data/cities';
import { MapPin, Globe, Check, X } from 'lucide-react';

export const CitySelectorModal: React.FC = () => {
  const {
    isCityModalOpen,
    setIsCityModalOpen,
    selectedCityId,
    setSelectedCityId,
    selectedLocality,
    setSelectedLocality,
  } = useApp();

  if (!isCityModalOpen) return null;

  const currentCityObj = CITIES.find((c) => c.id === selectedCityId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-lg rounded-2xl shadow-elevated border border-border overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-muted/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-base">Select Community Hub</h3>
              <p className="text-xs text-slate-500">Filter Visual Souq & Classifieds by Mohalla</p>
            </div>
          </div>
          <button
            onClick={() => setIsCityModalOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Filter Option */}
        <div className="p-4 border-b border-border bg-emerald-950/5">
          <button
            onClick={() => {
              setSelectedCityId('all');
              setSelectedLocality('All Localities');
              setIsCityModalOpen(false);
            }}
            className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm font-semibold transition ${
              selectedCityId === 'all'
                ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm ring-1 ring-gold-500/40'
                : 'bg-surface text-slate-800 border-border hover:border-emerald-800/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Globe className={`w-4 h-4 ${selectedCityId === 'all' ? 'text-gold-300' : 'text-emerald-600'}`} />
              <div className="text-left">
                <div className={selectedCityId === 'all' ? 'text-white font-bold' : ''}>
                  Global Jamaat (Worldwide Feed)
                </div>
                <div className={`text-[11px] font-normal ${selectedCityId === 'all' ? 'text-emerald-100' : 'opacity-80'}`}>
                  Browse all cities, international drops & global shipping
                </div>
              </div>
            </div>
            {selectedCityId === 'all' && <Check className="w-4 h-4 text-gold-300" />}
          </button>
        </div>

        {/* City and Mohalla Selection */}
        <div className="p-4 overflow-y-auto space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
              Select City / Jamaat
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CITIES.map((city) => (
                <button
                  key={city.id}
                  onClick={() => {
                    setSelectedCityId(city.id);
                    setSelectedLocality('All Localities');
                  }}
                  className={`px-3 py-2 rounded-xl text-left border text-xs font-medium transition ${
                    selectedCityId === city.id
                      ? 'bg-emerald-50 border-emerald-800 text-emerald-900 font-bold shadow-xs'
                      : 'bg-surface border-border text-slate-700 hover:bg-surface-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{city.name}</span>
                    <span className="text-[10px] text-slate-400">{city.country}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Localities in selected city */}
          {currentCityObj && selectedCityId !== 'all' && (
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                Select Mohalla in {currentCityObj.name}
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {currentCityObj.localities.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setSelectedLocality(loc);
                      setIsCityModalOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition ${
                      selectedLocality === loc
                        ? 'bg-emerald-900 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-900'
                    }`}
                  >
                    <span className={selectedLocality === loc ? 'text-white font-bold' : ''}>{loc}</span>
                    {selectedLocality === loc && <Check className="w-3.5 h-3.5 text-gold-300" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-surface-muted/30 flex justify-end">
          <button
            onClick={() => setIsCityModalOpen(false)}
            className="px-4 py-1.5 bg-emerald-900 hover:bg-emerald-950 text-gold-400 font-semibold text-xs rounded-lg transition"
          >
            Apply Location Filter
          </button>
        </div>
      </div>
    </div>
  );
};
