import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";

// Función para cargar el script de Google Places
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export default function SearchBip() {
  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    loadScript(`https://maps.googleapis.com/maps/api/js?key=AIzaSyAOCToOTNlgzyCBW_C23zu7BnxAgHkbFz4&libraries=places`)
      .then(() => {
        const autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), {
          types: ['geocode'],
          componentRestrictions: { country: 'cl' },
          bounds: new google.maps.LatLngBounds(
            new google.maps.LatLng(-33.702, -70.692), // Suroeste de Santiago
            new google.maps.LatLng(-33.357, -70.510)  // Noreste de Santiago
          ),
          strictBounds: true,
        });
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry) {
            setSelectedLocation({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            });
            setQuery(place.formatted_address);
          }
        });
      })
      .catch((error) => console.error('Error loading Google Maps script:', error));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedLocation) return;

    setLoading(true);
    try {
      const response = await fetch(`https://www.red.cl/restservice/rest/getpuntoparada/?lat=${selectedLocation.lat}&lon=${selectedLocation.lng}&bip=1`);
      const data = await response.json();
      const filteredData = data.filter(point => point.distancia >= 0);
      const sortedData = filteredData.sort((a, b) => {
        const aHorarios = a.horarios || [];
        const bHorarios = b.horarios || [];
        if (aHorarios.length && !bHorarios.length) return -1;
        if (!aHorarios.length && bHorarios.length) return 1;
        return a.distancia - b.distancia;
      });
      setPoints(sortedData);
    } catch (error) {
      console.error('Error fetching points:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-800 py-4 px-6 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
        <Link href="/" className="flex justify-center items-center gap-2 bg-gray-700 shadow-md p-6 text-white rounded-md">
          <Image src="/logo-red.png" width={100} height={100} alt="Red Movilidad" />
          Volver
        </Link>
        <form onSubmit={handleSubmit} className="flex items-center gap-4">
          <Input
            type="text"
            id="autocomplete"
            placeholder="Ingrese su dirección actual"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-white dark:bg-gray-600 text-gray-800 dark:text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
          />
        </form>
      </header>
      <div className="bg-white dark:bg-gray-800 p-6 flex flex-col gap-4 flex-grow">
        {loading ? (
          <p className="text-center text-lg">Cargando puntos de carga...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Comuna</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Distancia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {points.map((point) => (
                <TableRow key={point.id}>
                  <TableCell>{point.name}</TableCell>
                  <TableCell>{point.direccion}</TableCell>
                  <TableCell>{point.comuna}</TableCell>
                  <TableCell>{point.horarios ? point.horarios.join(', ') : 'No disponible'}</TableCell>
                  <TableCell>{(point.distancia * 1000).toFixed(2)} m</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
