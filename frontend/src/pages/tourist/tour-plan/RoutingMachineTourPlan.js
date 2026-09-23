import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';


const RoutingMachine = ({ waypoints, onDistanceChange }) => {
  
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map || waypoints.length < 2) return;

    if (routingControlRef.current) {
      try {
        routingControlRef.current.getPlan().setWaypoints([]);
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      } catch (error) {
        console.warn('Failed to safely remove previous routing control:', error);
      }
    }

    const control = L.Routing.control({
      waypoints: waypoints.map(coord => L.latLng(coord[0], coord[1])),
      lineOptions: { styles: [{ color: 'blue', weight: 4 }] },
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      createMarker: () => null
    })
      .on('routesfound', function (e) {
        const route = e.routes[0];
        const distanceInKm = (route.summary.totalDistance / 1000).toFixed(2);
        onDistanceChange(distanceInKm);
      })
      .addTo(map);

    routingControlRef.current = control;

    return () => {
      if (routingControlRef.current && map) {
        try {
          routingControlRef.current.getPlan().setWaypoints([]);
          map.removeControl(routingControlRef.current);
          routingControlRef.current = null;
        } catch (err) {
          console.warn('Error removing routing control on cleanup:', err);
        }
      }
    };
  }, [map, waypoints, onDistanceChange]);

  return null;
};

export default RoutingMachine;

