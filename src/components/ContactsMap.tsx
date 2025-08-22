import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ContactPopup } from "./ContactPopup";
import { ContactMapData } from "@/types/contact";

// Safe icon creation with fallback
const createSafeMarkerIcon = (marketType: string) => {
  try {
    const color = marketType === 'van_transport' ? '#003d82' : '#228B22';
    const emoji = marketType === 'van_transport' ? '🚐' : '🚲';
    
    return L.divIcon({
      html: `<div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${emoji}</div>`,
      className: 'safe-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });
  } catch (error) {
    console.warn('Failed to create custom icon, using default', error);
    return new L.Icon.Default();
  }
};

interface ContactsMapProps {
  contacts: ContactMapData[];
}

export function ContactsMap({ contacts }: ContactsMapProps) {
  const mapRef = useRef<L.Map>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Safe map bounds calculation
  const getMapDefaults = () => {
    try {
      if (contacts.length === 0) {
        return { center: [51.1657, 10.4515] as [number, number], zoom: 6 };
      }

      if (contacts.length === 1) {
        const contact = contacts[0];
        return {
          center: [contact.latitude, contact.longitude] as [number, number],
          zoom: 12
        };
      }

      // For multiple contacts, calculate center
      const latSum = contacts.reduce((sum, c) => sum + c.latitude, 0);
      const lngSum = contacts.reduce((sum, c) => sum + c.longitude, 0);
      const center = [latSum / contacts.length, lngSum / contacts.length] as [number, number];
      
      return { center, zoom: 8 };
    } catch (error) {
      console.warn('Error calculating map bounds:', error);
      return { center: [51.1657, 10.4515] as [number, number], zoom: 6 };
    }
  };

  const { center, zoom } = getMapDefaults();

  // Safe bounds fitting after map is ready
  useEffect(() => {
    if (!mapRef.current || !mapReady || contacts.length <= 1) return;

    try {
      const validCoords = contacts
        .filter(c => c.latitude && c.longitude)
        .map(c => [c.latitude, c.longitude] as [number, number]);
      
      if (validCoords.length > 1) {
        const bounds = L.latLngBounds(validCoords);
        mapRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
    } catch (error) {
      console.warn('Error fitting bounds:', error);
      setMapError('Error adjusting map view');
    }
  }, [contacts, mapReady]);

  if (mapError) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg">
        <div className="text-center">
          <p className="text-destructive mb-2">Map Error: {mapError}</p>
          <p className="text-sm text-muted-foreground">
            Showing {contacts.length} contacts as list
          </p>
        </div>
      </div>
    );
  }

  try {
    return (
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
        whenReady={() => {
          console.log('Map ready');
          setMapReady(true);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {contacts
          .filter(contact => contact.latitude && contact.longitude)
          .map((contact) => {
            try {
              return (
                <Marker
                  key={contact.id}
                  position={[contact.latitude, contact.longitude]}
                  icon={createSafeMarkerIcon(contact.market_type || 'van_transport')}
                >
                  <Popup maxWidth={300} className="custom-popup">
                    <ContactPopup contact={contact} />
                  </Popup>
                </Marker>
              );
            } catch (error) {
              console.warn(`Error rendering marker for ${contact.company_name}:`, error);
              return null;
            }
          })}
      </MapContainer>
    );
  } catch (error) {
    console.error('Critical map error:', error);
    setMapError(error instanceof Error ? error.message : 'Unknown map error');
    return null;
  }
}