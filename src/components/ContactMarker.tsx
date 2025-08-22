import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { ContactPopup } from "./ContactPopup";
import { ContactMapData } from "@/types/contact";

// Custom marker icon factory
const createMarkerIcon = (marketType: string, isMain: boolean = true) => {
  const color = marketType === 'van_transport' ? 'hsl(var(--amazon-blue))' : 'hsl(120, 60%, 35%)';
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

interface ContactMarkerProps {
  contact: ContactMapData;
  isMain?: boolean;
}

export function ContactMarker({ contact, isMain = true }: ContactMarkerProps) {
  return (
    <Marker
      position={[contact.latitude, contact.longitude]}
      icon={createMarkerIcon(contact.market_type || 'van_transport', isMain)}
    >
      <Popup maxWidth={300} className="custom-popup">
        <ContactPopup contact={contact} />
      </Popup>
    </Marker>
  );
}