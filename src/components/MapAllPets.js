import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Ensure default icons work in bundler
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function MapAllPets() {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef([]);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/pets');
                setPets(res.data || []);
            } catch (err) {
                console.error('Failed to fetch pets', err.message || err);
                setError('Failed to load pets');
            } finally {
                setLoading(false);
            }
        };
        fetchPets();
    }, []);

    useEffect(() => {
        // initialize map
        if (!mapRef.current) return;
        if (mapInstance.current) return; // single init

        mapInstance.current = L.map(mapRef.current, { attributionControl: true }).setView([20, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);
        setMapReady(true);

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Open fullmap when user clicks on the map surface (ignore clicks on controls, markers, popups and links)
    useEffect(() => {
        if (!mapReady) return;
        const container = mapRef.current;
        if (!container) return;

        const handleMapClick = (ev) => {
            try {
                // only react to primary button (left click)
                if (ev.button !== undefined && ev.button !== 0) return;
                let el = ev.target;
                // normalize text node targets
                if (el && el.nodeType !== 1) el = el.parentElement;
                if (!el) return;
                // ignore clicks on leaflet controls, markers, popups, and inside links
                if (el.closest('.leaflet-control') || el.closest('.leaflet-marker-icon') || el.closest('.leaflet-popup') || el.closest('a')) return;
                // open full map in new tab
                window.open(window.location.origin + '/fullmap', '_blank');
            } catch (e) {
                // ignore
            }
        };

        container.addEventListener('click', handleMapClick);
        return () => container.removeEventListener('click', handleMapClick);
    }, [mapReady]);

    useEffect(() => {
        if (!mapInstance.current) return;

        // clear existing markers
        markersRef.current.forEach(m => {
            try {
                mapInstance.current.removeLayer(m);
            } catch (e) { /* ignore */ }
        });
        markersRef.current = [];

        const coords = [];
        pets.forEach((pet) => {
            if (pet && pet.location && pet.location.lat != null && pet.location.lng != null) {
                const lat = pet.location.lat;
                const lng = pet.location.lng;
                coords.push([lat, lng]);

                const img = pet.image ? `<div style="width:100%;height:90px;background-size:cover;background-position:center;border-radius:6px;background-image:url('${pet.image}')"></div>` : '';
                const name = pet.name || 'Pet';
                const desc = pet.description ? (pet.description.length > 120 ? pet.description.substring(0, 117) + '...' : pet.description) : '';
                const popupHtml = `
          <div style="min-width:220px;max-width:320px;font-family:system-ui,Arial,sans-serif;">
            ${img}
            <h4 style="margin:8px 0 4px;font-size:15px;">${name}</h4>
            <div style="font-size:13px;color:#374151;margin-bottom:8px;">${desc}</div>
            <div style="display:flex;gap:8px;margin-top:6px;">
              <a href="/pets/${pet._id}" style="text-decoration:none;padding:8px 12px;background:#2563eb;color:#fff;border-radius:6px;font-size:13px;">View</a>
            </div>
          </div>
        `;

                const marker = L.marker([lat, lng]).addTo(mapInstance.current).bindPopup(popupHtml, { maxWidth: 360 });
                markersRef.current.push(marker);
            }
        });

        if (coords.length === 0) {
            // no markers: keep default world view
            mapInstance.current.setView([20, 0], 2);
        } else if (coords.length === 1) {
            mapInstance.current.setView(coords[0], 13);
        } else {
            try {
                const bounds = L.latLngBounds(coords);
                mapInstance.current.fitBounds(bounds, { padding: [40, 40] });
            } catch (e) { /* ignore */ }
        }

    }, [pets]);

    return (
        <div style={{ width: '100%', position: 'relative' }}>
            {loading && <div style={{ padding: 8 }}>Loading map...</div>}
            {error && <div style={{ padding: 8, color: '#b91c1c' }}>{error}</div>}
            <div style={{ position: 'relative' }}>
                <div ref={mapRef} style={{ width: '100%', height: 420, borderRadius: 8, overflow: 'hidden' }} />
                <button
                    onClick={() => window.open(window.location.origin + '/fullmap', '_blank')}
                    style={{
                        position: 'absolute',
                        right: 12,
                        top: 12,
                        zIndex: 800,
                        background: '#111827',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                    }}
                >
                    Open fullmap
                </button>
            </div>
        </div>
    );
}
