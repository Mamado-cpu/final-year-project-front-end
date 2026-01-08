import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Default truck icon for collector markers
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1995/1995574.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

interface MapViewProps {
  center: [number, number];
  zoom: number;
  markers?: Array<{
    position: [number, number];
    title: string;
    description?: string;
    iconUrl?: string;
  }>;
  onLocationSelect?: (lat: number, lng: number) => void;
  isInteractive?: boolean;
}

const MapView: React.FC<MapViewProps> = ({
  center,
  zoom,
  markers = [],
  onLocationSelect,
  isInteractive = false
}) => {
  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (isInteractive && onLocationSelect) {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    }
  };

  const MapEvents = () => {
    const map = useMap();
    map.on('click', handleMapClick);
    return null;
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker, index) => (
        <Marker key={index} position={marker.position} icon={marker.iconUrl ? new L.Icon({ iconUrl: marker.iconUrl, iconSize: [32,32], iconAnchor: [16,32], popupAnchor: [0, -28] }) : truckIcon}>
          <Popup>
            <div>
              <h3>{marker.title}</h3>
              {marker.description && <p>{marker.description}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

// Component to recenter map
export const RecenterMap: React.FC<{ position: [number, number] }> = ({ position }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(position);
  }, [position, map]);
  return null;
};

export default MapView;