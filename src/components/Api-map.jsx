// src/components/GoogleMapComponent.jsx
import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import HeptapodLogo from '@/assets/HeptapodLogo';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const darkCoolBlueStyle = [
    {
      elementType: "geometry",
      stylers: [{ color: "#1c2b30" }],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#1c2b30" }],
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#a3cfd8" }],
    },
    {
      featureType: "administrative",
      elementType: "geometry",
      stylers: [{ color: "#365b66" }],
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#2e4c4f" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#2a3f44" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#2f4a52" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#3d5e67" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#3d5e67" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2c3d42" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#3a768a" }],
    },
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "road",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "transit",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "administrative.neighborhood",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "administrative.province",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "administrative.country",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "landscape",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    },
    {
      featureType: "water",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
    
  ];  

const center = {
  lat: 34.0600,
  lng: -117.7650
};

const GoogleMapComponent = () => {
  const createCustomIcon = () => {
    if (window.google) {
      return {
        url: "/svg/HeptapodLogo.svg",
        scaledSize: new window.google.maps.Size(50, 50),
        anchor: new window.google.maps.Point(30, 50),
      };
    }
    return null;
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyDzNwq9C4TyuMZLxo4j8efcT1CQuKhwExc">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        options={{ styles: darkCoolBlueStyle }}
      >
        {window.google && (
          <Marker
            position={center}
            icon={createCustomIcon()}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapComponent;
