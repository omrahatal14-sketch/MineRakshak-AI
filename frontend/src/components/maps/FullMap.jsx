"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const RISK_COLORS = {
  high: { fill: "#DC2626", stroke: "#991B1B" },
  medium: { fill: "#D97706", stroke: "#92400E" },
  low: { fill: "#16A34A", stroke: "#166534" },
};

function MapLegend() {
  return (
    <div className="absolute bottom-5 left-5 z-[1000] rounded-xl border border-border bg-white/95 backdrop-blur-sm p-4 shadow-lg">
      <h4 className="text-xs font-bold text-ink mb-2 uppercase tracking-wider">Risk Legend</h4>
      <div className="space-y-1.5">
        {[
          { level: "high", label: "High Risk (≥70)" },
          { level: "medium", label: "Medium Risk (35–69)" },
          { level: "low", label: "Low Risk (<35)" },
        ].map(({ level, label }) => (
          <div key={level} className="flex items-center gap-2">
            <div
              className="h-3.5 w-3.5 rounded-full border-2 shadow-sm"
              style={{ backgroundColor: RISK_COLORS[level].fill, borderColor: RISK_COLORS[level].stroke }}
            />
            <span className="text-[11px] text-ink font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FitBounds({ mines }) {
  const map = useMap();
  useEffect(() => {
    if (mines.length > 0) {
      const bounds = mines.map((m) => [m.latitude || 22.3, m.longitude || 82.5]);
      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
      }
    }
  }, [mines, map]);
  return null;
}

export default function FullMap({ mines = [], onSelectMine }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas text-xs text-slate">
        Loading GIS Map…
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[22.5, 82.5]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds mines={mines} />

        {mines.map((mine) => {
          const colors = RISK_COLORS[mine.riskLevel] || RISK_COLORS.low;
          const radius = mine.riskLevel === "high" ? 14 : mine.riskLevel === "medium" ? 11 : 8;
          return (
            <CircleMarker
              key={mine.id}
              center={[mine.latitude, mine.longitude]}
              radius={radius}
              pathOptions={{
                fillColor: colors.fill,
                fillOpacity: 0.85,
                color: colors.stroke,
                weight: 2.5,
              }}
              eventHandlers={{
                click: () => onSelectMine && onSelectMine(mine),
              }}
            >
              <Popup maxWidth={320} className="mine-popup">
                <div className="min-w-[240px]">
                  <h3 className="font-bold text-sm text-ink mb-1">{mine.name}</h3>
                  <p className="text-[11px] text-slate mb-2">{mine.code} • {mine.zone}</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="font-semibold text-slate">Risk Score:</span>
                      <span className={`ml-1 font-bold ${mine.riskLevel === "high" ? "text-red-600" : mine.riskLevel === "medium" ? "text-amber-600" : "text-emerald-600"}`}>
                        {mine.riskScore}/100
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate">Compliance:</span>
                      <span className="ml-1 font-bold text-emerald-600">{mine.complianceRate}%</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate">Open Violations:</span>
                      <span className={`ml-1 font-bold ${mine.openViolations > 0 ? "text-red-600" : "text-slate"}`}>{mine.openViolations}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate">Overdue Actions:</span>
                      <span className={`ml-1 font-bold ${mine.overdueActions > 0 ? "text-amber-600" : "text-slate"}`}>{mine.overdueActions}</span>
                    </div>
                  </div>
                  {mine.riskExplanation && (
                    <p className="mt-2 text-[10px] text-slate border-t border-border pt-1.5">{mine.riskExplanation}</p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <MapLegend />
    </div>
  );
}
