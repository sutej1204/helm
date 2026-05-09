import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from "react-simple-maps";
import { feature } from "topojson-client";
import { Tooltip } from "react-tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, Search, MapPin, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Use a simple world map GeoJSON
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// Sample supplier data with locations and risk levels
const supplierLocations = [
  { name: "Acme Electronics", coordinates: [121.5, 25.03], risk: "Critical", country: "Taiwan", industry: "Electronics", incidents: 3 },
  { name: "Global Materials", coordinates: [77.1, 28.7], risk: "High", country: "India", industry: "Manufacturing", incidents: 2 },
  { name: "Pacific Shipping", coordinates: [103.85, 1.35], risk: "High", country: "Singapore", industry: "Logistics", incidents: 1 },
  { name: "Eurotech Manufacturing", coordinates: [13.4, 52.52], risk: "Medium", country: "Germany", industry: "Electronics", incidents: 1 },
  { name: "American Components", coordinates: [-118.24, 34.05], risk: "Medium", country: "USA", industry: "Manufacturing", incidents: 0 },
  { name: "Brazilian Resources", coordinates: [-46.63, -23.55], risk: "Medium", country: "Brazil", industry: "Raw Materials", incidents: 2 },
  { name: "African Minerals", coordinates: [28.2, -25.7], risk: "High", country: "South Africa", industry: "Mining", incidents: 3 },
  { name: "Tokyo Tech", coordinates: [139.69, 35.69], risk: "Low", country: "Japan", industry: "Technology", incidents: 0 },
  { name: "Nordic Supplies", coordinates: [18.06, 59.33], risk: "Low", country: "Sweden", industry: "Manufacturing", incidents: 0 },
  { name: "Mexican Assembly", coordinates: [-99.13, 19.43], risk: "Medium", country: "Mexico", industry: "Manufacturing", incidents: 1 },
  { name: "Australian Resources", coordinates: [151.2, -33.87], risk: "Medium", country: "Australia", industry: "Mining", incidents: 1 },
  { name: "Korean Tech", coordinates: [126.98, 37.57], risk: "Low", country: "South Korea", industry: "Technology", incidents: 0 },
];

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "Critical":
      return "#ef4444";
    case "High":
      return "#f97316";
    case "Medium":
      return "#eab308";
    case "Low":
      return "#22c55e";
    default:
      return "#3b82f6";
  }
};

interface SupplierRiskMapProps {
  isLoading?: boolean;
}

export function SupplierRiskMap({ isLoading = false }: SupplierRiskMapProps) {
  const [tooltipContent, setTooltipContent] = useState("");
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  // Force re-render on component mount to ensure map renders correctly
  const [, forceUpdate] = useState(0);
  
  useEffect(() => {
    // Trigger a re-render after component mounts to ensure proper sizing
    const timer = setTimeout(() => {
      forceUpdate(n => n + 1);
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
    setPosition(position);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <CardTitle>Global Risk Map</CardTitle>
            <CardDescription>Geographic distribution of supplier risks</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" /> Search
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-1 md:p-2">
        <div className="border rounded overflow-hidden" style={{ aspectRatio: '1.7/1' }}>
          <div className="relative w-full h-full">
            <div className="flex justify-end p-2 absolute top-0 right-0 z-10 space-x-2">
              <button
                onClick={handleZoomIn}
                className="bg-white p-1 rounded-full shadow border hover:bg-gray-100"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <button
                onClick={handleZoomOut}
                className="bg-white p-1 rounded-full shadow border hover:bg-gray-100"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>

            <ComposableMap
              data-tip=""
              className="w-full h-full outline-none"
              projectionConfig={{
                scale: 150,
                rotate: [-10, 0, 0],
              }}
            >
              <ZoomableGroup
                zoom={position.zoom}
                center={position.coordinates as [number, number]}
                onMoveEnd={handleMoveEnd as any}
                maxZoom={5}
              >
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#f3f4f6"
                        stroke="#d1d5db"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { fill: "#e5e7eb", outline: "none" },
                          pressed: { outline: "none" },
                        }}
                      />
                    ))
                  }
                </Geographies>

                {supplierLocations.map(({ name, coordinates, risk, country, industry, incidents }) => (
                  <Marker
                    key={name}
                    coordinates={coordinates as [number, number]}
                    onMouseEnter={() => {
                      setTooltipContent(`
                        <div class="p-2">
                          <div class="font-bold">${name}</div>
                          <div class="text-sm text-gray-600">${country} · ${industry}</div>
                          <div class="mt-2 flex items-center">
                            <span class="inline-block w-2 h-2 rounded-full mr-1" style="background-color: ${getRiskColor(risk)};"></span>
                            <span>${risk} Risk</span>
                          </div>
                          ${incidents > 0 ? `
                          <div class="mt-1 text-xs flex items-center text-red-600">
                            <span>${incidents} recent incident${incidents > 1 ? 's' : ''}</span>
                          </div>
                          ` : ''}
                        </div>
                      `)
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                    }}
                  >
                    <g transform="translate(-12, -24)">
                      {incidents > 0 ? (
                        <>
                          <circle 
                            r={6 + incidents * 2} 
                            fill={`${getRiskColor(risk)}40`} 
                            stroke="none" 
                          />
                          <circle 
                            r={4 + incidents} 
                            fill={`${getRiskColor(risk)}80`} 
                            stroke="none" 
                          />
                        </>
                      ) : null}
                      <MapPin 
                        size={24} 
                        fill={getRiskColor(risk)} 
                        color={getRiskColor(risk)} 
                        data-tooltip-id="supplier-tooltip" 
                      />
                      {incidents > 0 ? (
                        <circle 
                          r={5} 
                          cx={12} 
                          cy={-4} 
                          fill="#ef4444" 
                          stroke="white"
                          strokeWidth={1}
                        />
                      ) : null}
                    </g>
                  </Marker>
                ))}
              </ZoomableGroup>
            </ComposableMap>

            <div className="absolute bottom-2 left-2 z-10 flex space-x-2">
              <div className="bg-white text-sm p-2 rounded shadow-sm border flex space-x-3">
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                  <span>Critical</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-1"></span>
                  <span>High</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
                  <span>Medium</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                  <span>Low</span>
                </div>
              </div>
              
              <Badge className="bg-red-50 text-red-600 flex items-center px-3 h-auto border border-red-200">
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                {supplierLocations.filter(s => s.risk === 'Critical' || s.risk === 'High').length} High Risk Suppliers
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm border-t pt-4">
          <div className="flex space-x-4">
            <div className="text-gray-500">
              <span className="font-medium text-gray-900">{supplierLocations.length}</span> suppliers mapped
            </div>
            <div className="text-gray-500">
              <span className="font-medium text-gray-900">12</span> countries
            </div>
          </div>
          <div className="text-gray-500">
            <span className="font-medium text-gray-900 text-red-600">{supplierLocations.filter(s => s.incidents > 0).length}</span> suppliers with active incidents
          </div>
        </div>
      </CardContent>

      <Tooltip 
        id="supplier-tooltip" 
        html 
        className="z-50 tooltip-shadow"
        content={tooltipContent} 
      />
    </Card>
  );
}
