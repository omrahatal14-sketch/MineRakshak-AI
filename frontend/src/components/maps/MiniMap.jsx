"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const RISK_COLORS = { high: "#DC2626", medium: "#D97706", low: "#16A34A" };
const MINE_COORDS = [
  [22.309, 82.679], [22.331, 82.591], [23.739, 86.414],
  [23.694, 86.150], [22.085, 82.195], [21.826, 79.080],
  [23.270, 81.972], [24.186, 83.801], [22.098, 82.770], [21.190, 79.390],
];

export default function MiniMap({ mines = [] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas text-xs text-slate">
        Loading Map View…
      </div>
    );
  }

  return (
    <MapContainer center={[22.5, 82.5]} zoom={5} style={{ height: "100%", width: "100%" }} className="z-0">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
      {mines.map((mine, i) => {
        const lat = mine.latitude || MINE_COORDS[i]?.[0] || 22.3 + i * 0.3;
        const lng = mine.longitude || MINE_COORDS[i]?.[1] || 82.5 + i * 0.5;
        const color = RISK_COLORS[mine.riskLevel] || RISK_COLORS.low;
        return (
          <CircleMarker
            key={mine.id || i}
            center={[lat, lng]}
            radius={mine.riskLevel === "high" ? 12 : mine.riskLevel === "medium" ? 9 : 7}
            pathOptions={{ fillColor: color, fillOpacity: 0.85, color: color, weight: 2 }}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-bold text-ink">{mine.name}</p>
                <p className="text-slate">{mine.code} • {mine.zone}</p>
                <p className="mt-1">Risk: <strong className={mine.riskLevel === "high" ? "text-red-600" : mine.riskLevel === "medium" ? "text-amber-600" : "text-emerald-600"}>{mine.riskScore}/100</strong></p>
                <p>Compliance: <strong className="text-emerald-600">{mine.complianceRate}%</strong></p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
