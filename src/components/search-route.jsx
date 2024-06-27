import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import 'leaflet/dist/leaflet.css';

// Dynamic import for MapContainer, TileLayer, Polyline, Marker, and Tooltip to ensure they are only loaded on the client
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then(mod => mod.Tooltip), { ssr: false });
const customIcon = dynamic(() =>
  import('leaflet').then(L => new L.Icon({
    iconUrl: '/puntero-de-parada-de-autobus.png', // Cambia la ruta del icono según corresponda
    iconSize: [35, 41],
    iconAnchor: [24, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })), { ssr: false }
);

export default function SearchRoute() {
  const [route, setRoute] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const mapRef = useRef();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Fetch the list of routes
      fetch('https://us-central1-transportes-red.cloudfunctions.net/app/get-recorridos/all')
        .then((response) => response.json())
        .then((data) => {
          setRoutes(data);
        })
        .catch((error) => console.error('Error fetching routes:', error));
    }
  }, []);

  useEffect(() => {
    if (selectedRoute && typeof window !== 'undefined') {
      // Fetch the route path
      fetch(`https://us-central1-transportes-red.cloudfunctions.net/app/recorridos/${selectedRoute}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Error fetching route data');
          }
          return response.json();
        })
        .then((data) => {
          const path = data.map((point) => [point.latitud, point.longitud]);
          setRoute(path);

          if (mapRef.current) {
            const map = mapRef.current;
            map.fitBounds(path);
          }
        })
        .catch((error) => console.error('Error fetching route:', error));

      // Fetch the stops for the selected route
      fetch(`https://us-central1-transportes-red.cloudfunctions.net/app/get-stops/${selectedRoute}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Error fetching stops data');
          }
          return response.json();
        })
        .then((data) => {
          setStops(data);
        })
        .catch((error) => console.error('Error fetching stops:', error));
    }
  }, [selectedRoute]);

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-[#1f2937] dark:bg-[#1f2937] py-4 px-6 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
        <Link href="/" id="card" className="flex justify-center items-center gap-2 dark:bg-[#374151] shadow-md p-6 text-white">
          <Image src="/logo-red.png" width={100} height={100} alt="Red Movilidad" />
          Volver
        </Link>
        <div className="flex items-center gap-4">
          <Select onValueChange={setSelectedRoute}>
            <SelectTrigger className="bg-white dark:bg-[#374151] text-[#1f2937] dark:text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#dc2626] focus:ring-opacity-50">
              <SelectValue placeholder="Selecciona una ruta" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {routes.map((route) => (
                  <SelectItem key={route} value={route}>
                    {route}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </header>
      <main className="flex-1">
        <div className="h-full">
          {typeof window !== 'undefined' && (
            <MapContainer center={[-33.4567, -70.6789]} zoom={13} style={{ height: "100%", width: "100%", zIndex:"-1" }} whenCreated={mapInstance => { mapRef.current = mapInstance; }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {route.length > 0 && (
                <Polyline positions={route} color="blue" />
              )}
              {stops.map((stop) => (
                <Marker key={stop.stop_code} position={[stop.stop_lat, stop.stop_lon]} icon={customIcon}>
                  <Tooltip>
                    <div>
                      <strong>Codigo Parada:</strong> {stop.stop_code} <br />
                      <strong>Nombre:</strong> {stop.stop_name}
                    </div>
                  </Tooltip>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </main>
    </div>
  );
}
