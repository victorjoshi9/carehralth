import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

export const MapComponent = () => {
  const position: [number, number] = [27.9790, 73.2952]; // Approximate Gangashahar location

  return (
    <div className="w-full h-full relative rounded-[40px] overflow-hidden glass-neu border-none shadow-2xl">
      <MapContainer 
        center={position} 
        zoom={15} 
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <ChangeView center={position} zoom={15} />
        {/* CartoDB Dark Matter for that futuristic high-tech look */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="p-2 text-slate-800">
              <h4 className="font-bold text-rose-500 uppercase tracking-tighter">Divyam Hospital</h4>
              <p className="text-[10px] leading-tight mt-1">10A, Mahabalipuram, Near Sampat Place, Nokha Road, Gangashahar, Bikaner</p>
              <div className="mt-2 text-[8px] font-bold uppercase tracking-widest text-slate-400">Open 24 Hours</div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Overlay controls or branding */}
      <div className="absolute bottom-6 right-6 z-[1000] glass-neu px-6 py-4 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-2xl pointer-events-none">
         <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Divyam Tracking</div>
         <div className="text-sm font-display font-medium text-white">Bikaner Node Alpha</div>
      </div>
    </div>
  );
};
