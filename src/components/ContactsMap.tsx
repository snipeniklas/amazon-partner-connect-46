import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ContactMarker } from "./ContactMarker";
import { ContactPopup } from "./ContactPopup";
import { ContactMapData } from "@/types/contact";

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different market types
const createMarkerIcon = (marketType: string, isMain: boolean = true) => {
  const color = marketType === 'van_transport' ? '#003d82' : '#228B22'; // Amazon blue or green
  const size = isMain ? [25, 41] : [20, 32];
  const iconAnchor = isMain ? [12, 41] : [10, 32];
  
  return L.divIcon({
    html: `
      <div style="
        width: ${size[0]}px;
        height: ${size[1]}px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        position: relative;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          color: white;
          font-size: ${isMain ? '14px' : '12px'};
          font-weight: bold;
        ">
          ${marketType === 'van_transport' ? '🚐' : '🚲'}
        </div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: size as [number, number],
    iconAnchor: iconAnchor as [number, number],
    popupAnchor: [1, -34],
  });
};

interface ContactsMapProps {
  contacts: ContactMapData[];
}

export function ContactsMap({ contacts }: ContactsMapProps) {
  const mapRef = useRef<L.Map>(null);

  // Calculate map center and zoom based on contacts
  const getMapBounds = () => {
    if (contacts.length === 0) {
      return { center: [51.1657, 10.4515] as [number, number], zoom: 6 }; // Germany center
    }

    const bounds = L.latLngBounds(
      contacts.map(contact => [contact.latitude, contact.longitude])
    );
    
    return {
      center: bounds.getCenter(),
      zoom: contacts.length === 1 ? 12 : undefined,
      bounds: contacts.length > 1 ? bounds : undefined
    };
  };

  const { center, zoom, bounds } = getMapBounds();

  useEffect(() => {
    if (mapRef.current && bounds && contacts.length > 1) {
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [contacts, bounds]);

  return (
    <MapContainer
      ref={mapRef}
      center={center}
      zoom={zoom || 6}
      style={{ height: "100%", width: "100%" }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {contacts.map((contact) => (
        <Marker
          key={contact.id}
          position={[contact.latitude, contact.longitude]}
          icon={createMarkerIcon(contact.market_type || 'van_transport', true)}
        >
          <Popup maxWidth={300} className="custom-popup">
            <ContactPopup contact={contact} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}