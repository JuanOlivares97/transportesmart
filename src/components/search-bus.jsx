import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";

export default function SearchBus() {
  const [stopCode, setStopCode] = useState('');
  const [busData, setBusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    let value = e.target.value;
    value = value.trim().toUpperCase(); // Quitar espacios y convertir a mayúsculas
    setStopCode(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stopCode) {
      setError('Por favor, ingrese un código de parada válido.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.xor.cl/red/bus-stop/${stopCode}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (data.status_code === 0) {
        setBusData(data);
      } else {
        setError(data.status_description);
        setBusData(null);
      }
    } catch (error) {
      console.error('Error fetching bus data:', error);
      setError('Error fetching bus data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-800 dark:bg-gray-800 py-4 px-6 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
        <Link href="/" id="card" className="flex justify-center items-center gap-2 bg-gray-700 dark:bg-gray-700 shadow-md p-6 text-white rounded-md">
          <Image src="/logo-red.png" width={100} height={100} alt="Red Movilidad" />
          Volver
        </Link>
        <div className="flex items-center gap-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-4">
            <input
              type="text"
              value={stopCode}
              onChange={handleInputChange}
              placeholder="Ingrese el código de la parada Ej=PD7"
              className="bg-white dark:bg-gray-600 text-gray-800 dark:text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
            />
            <button
              type="submit"
              className="bg-red-600 text-white rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
            >
              Buscar
            </button>
          </form>
        </div>
      </header>
      <div className="bg-white dark:bg-gray-800 p-6 flex flex-col gap-4">
        {loading ? (
          <p className="text-center text-lg">Cargando datos del bus...</p>
        ) : error ? (
          <div className="flex flex-col bg-yellow-400 h-full text-center">
            <h1 className="text-red-600 font-bold text-4xl p-5">ERROR:</h1>
            <h2 className="text-3xl p-4">{error}</h2>
            <Link href="/" className="btn btn-lg btn-light font-bold self-center">Volver al inicio</Link>
          </div>
        ) : busData ? (
          <main className="container mx-auto flex flex-col pt-2 text-center items-center">
            <h1 className="text-2xl font-normal">{busData.name}</h1>
            <h2 className="text-xl shadow font-bold text-light bg-green-600 p-1 rounded-1">ID: {busData.id}</h2>
            <table className="table-auto w-full text-left mt-4">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Servicio</th>
                  <th className="border px-4 py-2">Patente</th>
                  <th className="border px-4 py-2">Llega entre</th>
                  <th className="border px-4 py-2">Distancia</th>
                </tr>
              </thead>
              <tbody>
                {busData.services?.sort((a, b) => (a.valid === b.valid ? 0 : a.valid ? -1 : 1)).map((service) =>
                  service.valid ? (
                    service.buses.map((bus) => {
                      let distanceText;
                      const patente = bus.id;
                      if (bus.min_arrival_time > 0 && bus.max_arrival_time >= 5) {
                        distanceText = `${bus.min_arrival_time} y ${bus.max_arrival_time} min`;
                      } else if (bus.meters_distance <= 500 && bus.max_arrival_time <= 3) {
                        distanceText = "Llegando";
                      } else if (bus.min_arrival_time === 0 && bus.max_arrival_time <= 5) {
                        distanceText = `Menos de ${bus.max_arrival_time} min`;
                      } else if (bus.min_arrival_time === 0) {
                        distanceText = `${bus.max_arrival_time} min`;
                      }
                      return (
                        <tr key={patente}>
                          <td className="border px-4 py-2 font-bold">{service.id}</td>
                          <td className="border px-4 py-2">{patente}</td>
                          <td className="border px-4 py-2">{distanceText}</td>
                          <td className="border px-4 py-2">{bus.meters_distance} mts.</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr key={service.id}>
                      <td className="border px-4 py-2 font-bold">{service.id}</td>
                      <td colSpan={4} className="border px-4 py-2">{service.status_description}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
            <Link href="/" className="btn btn-success w-75 font-bold self-center mt-5 mb-5">Presiona para volver al inicio</Link>
          </main>
        ) : (
          <p className="text-center text-lg">Ingrese el código de la parada para ver los datos del bus.</p>
        )}
      </div>
    </div>
  );
}
