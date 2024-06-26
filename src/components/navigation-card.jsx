'use client'
import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";

export function NavigationCard() {
  const [konamiIndex, setKonamiIndex] = useState(0);
  const [showTrollImage, setShowTrollImage] = useState(false);
  const konamiCode = "troll";

  useEffect(() => {
    const handleKeyPress = (e) => {
      const key = e.key.toLowerCase();
      if (key === konamiCode[konamiIndex]) {
        setKonamiIndex(prevIndex => prevIndex + 1);
        if (konamiIndex + 1 === konamiCode.length) {
          setShowTrollImage(true);
          setKonamiIndex(0);
        }
      } else {
        setKonamiIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [konamiIndex, konamiCode]);

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-[#1f2937] dark:bg-[#1f2937]">
      <div id="card" className="flex justify-center mb-8 bg-white dark:bg-[#374151] shadow-md  p-6">
        <Image src="/logo-red.png" width={250} height={100} alt="Red Movilidad" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 sm:mx-8">
        <Link
          href={"/searchroute"}
          id="card"
          className="bg-white dark:bg-[#374151] shadow-md  p-6 flex flex-col items-center justify-center">
          <SearchIcon className="text-[#dc2626] w-12 h-12 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-[#1f2937] dark:text-white">Busca tu recorrido</h3>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Encuentra la ruta más eficiente para llegar a tu destino.
          </p>
        </Link>

        <Link
          href={"/searchbus"}
          id="card"
          className="bg-white dark:bg-[#374151] shadow-md  p-6 flex flex-col items-center justify-center">
          <ClockIcon className="text-[#dc2626] w-12 h-12 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-[#1f2937] dark:text-white">Revisa cuando llega tu bus</h3>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Consulta los tiempos de llegada de los buses en tiempo real.
          </p>
        </Link>

        <Link
          href={"/searchbip"}
          id="card"
          className="bg-white dark:bg-[#374151] shadow-md  p-6 flex flex-col items-center justify-center">
          <MapPinIcon className="text-[#dc2626] w-12 h-12 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-[#1f2937] dark:text-white">
            Encuentra el punto de recarga bip más cercano
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Ubica los puntos de recarga de tu tarjeta bip más cercanos.
          </p>
        </Link>
      </div>

      {showTrollImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <Image src="/troll.jpeg" width={500} height={500} alt="Troll" />
        </div>
      )}
    </div>
  );
}

function ClockIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MapPinIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function SearchIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
