import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ContactPopup } from "./ContactPopup";
import { ContactMapData } from "@/types/contact";

// Standard leaflet marker icons with stable URLs
const createStandardMarkerIcon = (marketType: string) => {
  const iconUrl = marketType === 'van_transport' 
    ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png'
    : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png';
  
  const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png';

  return new L.Icon({
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
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
                  icon={createStandardMarkerIcon(contact.market_type || 'van_transport')}
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