import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function RecenterMap({ position, center, zoom, onMapClick }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);

  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    },
  });

  if (position) {
    return <Marker position={position} />;
  }
  return null;
}

const toLatLng = (pos) => {
  if (!pos) return null;
  if (Array.isArray(pos)) return { lat: pos[0], lng: pos[1] };
  return pos;
};

const LocationPickerMap = ({ onChange, position, setPosition, defaultCenter, defaultZoom }) => {
  const [loading, setLoading] = useState(false);
  const pos = toLatLng(position);
  const [mapKey, setMapKey] = useState(0);

  const center = defaultCenter || [30.375, 69.345];
  const zoom = defaultZoom || 5;

  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [defaultCenter, defaultZoom]);

  const handleMapClick = async (latlng) => {
    if (setPosition) setPosition(latlng);
    setLoading(true);
    let addr = {};
    let ok = false;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&addressdetails=1`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'AflaCareers/1.0' } }
      );
      if (res.ok) {
        const data = await res.json();
        addr = data.address || {};
        ok = true;
      }
    } catch {
      /* Nominatim unavailable */
    }

    if (ok) {
      const roadParts = [addr.house_number, addr.road, addr.suburb, addr.neighbourhood].filter(Boolean);
      const address = roadParts.join(', ');
      const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
      const country = addr.country || '';
      const zip = addr.postcode || '';
      const parts = [address, city, country, zip].filter(Boolean);
      const formatted = parts.join(', ');
      onChange({
        address,
        city,
        country,
        zip,
        latitude: latlng.lat,
        longitude: latlng.lng,
        formatted,
      });
    } else {
      onChange({
        address: '',
        city: '',
        country: '',
        zip: '',
        latitude: latlng.lat,
        longitude: latlng.lng,
        formatted: `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`,
      });
    }
    setLoading(false);
  };

  const selectedLabel = pos
    ? `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`
    : '';

  return (
    <div className="space-y-2">
      <div className="h-64 rounded-lg overflow-hidden border border-gray-300 relative z-0">
        <MapContainer
          key={mapKey}
          center={center}
          zoom={zoom}
          className="h-full w-full"
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap position={pos} center={center} zoom={zoom} onMapClick={handleMapClick} />
        </MapContainer>
      </div>
      {loading && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <MapPin size={12} className="animate-pulse" />
          Getting address...
        </p>
      )}
      {pos && !loading && (
        <p className="text-xs text-gray-500 truncate">
          Selected: {selectedLabel}
        </p>
      )}
    </div>
  );
};

export default LocationPickerMap;