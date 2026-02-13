'use client';

import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { Input } from './input';
import { Search } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 47.3769,
  lng: 8.5417,
};

const libraries: ('places')[] = ['places'];

export const GoogleMapsSearch = ({ onSelectLocation }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);
  
  const onSearchBoxLoad = (ref: google.maps.places.SearchBox) => {
    searchBoxRef.current = ref;
  };

  const onPlacesChanged = () => {
    if (searchBoxRef.current) {
        const places = searchBoxRef.current.getPlaces();

        if (places && places.length > 0) {
            const place = places[0];
            const location = place.geometry?.location;

            if (location && map) {
                const newCenter = { lat: location.lat(), lng: location.lng() };
                map.panTo(newCenter);
                setMarkerPosition(newCenter);
                
                const addressComponents = place.address_components;
                const getAddressComponent = (type: string) => addressComponents?.find(c => c.types.includes(type))?.long_name || '';

                onSelectLocation({
                    name: place.name,
                    address: {
                        street: getAddressComponent('route'),
                        house_number: getAddressComponent('street_number'),
                        postcode: getAddressComponent('postal_code'),
                        city: getAddressComponent('locality'),
                    },
                    label: place.formatted_address,
                });
            }
        }
    }
  };


  if (loadError) {
    return <div>Error loading maps. Please check your API key.</div>;
  }

  return isLoaded ? (
    <div className="w-full h-full flex flex-col gap-4 p-6">
        <StandaloneSearchBox
          onLoad={onSearchBoxLoad}
          onPlacesChanged={onPlacesChanged}
        >
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input placeholder="Adresse oder Praxis suchen..." className="pl-9" />
          </div>
        </StandaloneSearchBox>
        <div className="flex-grow rounded-lg overflow-hidden">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={markerPosition}
                zoom={15}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                }}
            >
                <Marker position={markerPosition} />
            </GoogleMap>
        </div>
    </div>
  ) : <div className="flex items-center justify-center h-full">Loading Maps...</div>;
};
