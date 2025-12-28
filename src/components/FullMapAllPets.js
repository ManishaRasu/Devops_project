import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

export default function FullMapAllPets() {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef([]);
    const userMarkerRef = useRef(null);
    const watchIdRef = useRef(null);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Inject minimal pulse CSS for the live location marker once
    useEffect(() => {
        if (document.getElementById('tm-live-loc-style')) return;
        const style = document.createElement('style');
        style.id = 'tm-live-loc-style';
        style.innerHTML = `
        .tm-live-loc { position:relative; width:18px; height:18px; }
        .tm-live-loc .dot { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:12px; height:12px; background:#2563eb; border-radius:50%; border:2px solid #fff; box-shadow:0 0 8px rgba(37,99,235,0.8); }
        .tm-live-loc .pulse { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:12px; height:12px; border-radius:50%; border:3px solid rgba(37,99,235,0.45); animation:tmPulse 1.6s linear infinite; }
        @keyframes tmPulse { 0% { transform:translate(-50%,-50%) scale(1); opacity:0.9 } 70% { transform:translate(-50%,-50%) scale(2.4); opacity:0 } 100% { opacity:0 } }
        `;
        document.head.appendChild(style);
    }, []);

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
        if (!mapRef.current) return;
        if (mapInstance.current) return;

        mapInstance.current = L.map(mapRef.current, { attributionControl: true }).setView([20, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);

        // Start geolocation watch for live location
        if (navigator.geolocation) {
            // get current position once to center
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                if (!mapInstance.current) return; // guard against teardown
                try {
                    mapInstance.current.setView([latitude, longitude], 14);
                    // create marker if not exists
                    if (!userMarkerRef.current) {
                        const html = `<div class="tm-live-loc"><div class="dot"></div><div class="pulse"></div></div>`;
                        const icon = L.divIcon({ html, className: 'tm-live-loc-wrapper', iconSize: [18, 18], iconAnchor: [9, 9] });
                        userMarkerRef.current = L.marker([latitude, longitude], { icon }).addTo(mapInstance.current).bindPopup('You are here');
                    }
                } catch (e) {
                    console.warn('Error initializing user marker', e);
                }
            }, (err) => {
                console.warn('Initial geolocation error', err && err.message);
            }, { enableHighAccuracy: true, timeout: 8000 });

            // watch position
            watchIdRef.current = navigator.geolocation.watchPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                if (!mapInstance.current) return; // guard against teardown
                try {
                    if (userMarkerRef.current) {
                        userMarkerRef.current.setLatLng([latitude, longitude]);
                    } else {
                        const html = `<div class="tm-live-loc"><div class="dot"></div><div class="pulse"></div></div>`;
                        const icon = L.divIcon({ html, className: 'tm-live-loc-wrapper', iconSize: [18, 18], iconAnchor: [9, 9] });
                        userMarkerRef.current = L.marker([latitude, longitude], { icon }).addTo(mapInstance.current).bindPopup('You are here');
                    }
                } catch (e) {
                    console.warn('Error updating user marker', e);
                }
            }, (err) => {
                console.warn('Geolocation watch error', err && err.message);
            }, { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 });
        }

        return () => {
            // Clear watch first to avoid callbacks during map teardown
            if (watchIdRef.current && navigator.geolocation && navigator.geolocation.clearWatch) {
                try { navigator.geolocation.clearWatch(watchIdRef.current); } catch (e) { }
                watchIdRef.current = null;
            }
            if (mapInstance.current) {
                try { mapInstance.current.remove(); } catch (e) { }
                mapInstance.current = null;
            }
        };
    }, []);


    useEffect(() => {
        if (!mapInstance.current) return;
        markersRef.current.forEach(m => { try { mapInstance.current.removeLayer(m); } catch (e) { } });
        markersRef.current = [];
        const coords = [];
        pets.forEach((pet) => {
            if (pet && pet.location && pet.location.lat != null && pet.location.lng != null) {
                const lat = pet.location.lat;
                const lng = pet.location.lng;
                coords.push([lat, lng]);
                const img = pet.image ? `<div style="width:100%;height:110px;background-size:cover;background-position:center;border-radius:6px;background-image:url('${pet.image}')"></div>` : '';
                const popupHtml = `
          <div style="min-width:220px;max-width:380px;font-family:system-ui,Arial,sans-serif;">
            ${img}
            <h4 style="margin:8px 0 4px;font-size:16px;">${pet.name || 'Pet'}</h4>
            <div style="font-size:13px;color:#374151;margin-bottom:8px;">${pet.description ? (pet.description.length > 140 ? pet.description.substring(0, 137) + '...' : pet.description) : ''}</div>
            <div style="display:flex;gap:8px;margin-top:6px;">
              <a href="/pets/${pet._id}" style="text-decoration:none;padding:8px 12px;background:#2563eb;color:#fff;border-radius:6px;font-size:13px;">View</a>
            </div>
          </div>
        `;
                const marker = L.marker([lat, lng]).addTo(mapInstance.current).bindPopup(popupHtml, { maxWidth: 380 });
                markersRef.current.push(marker);
            }
        });

        if (coords.length === 0) {
            mapInstance.current.setView([20, 0], 2);
        } else if (coords.length === 1) {
            mapInstance.current.setView(coords[0], 13);
        } else {
            try { mapInstance.current.fitBounds(L.latLngBounds(coords), { padding: [60, 60] }); } catch (e) { }
        }
    }, [pets]);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 13000 }}>
                <button onClick={() => { try { if (window.opener) { window.close(); } else { navigate('/'); } } catch (e) { navigate('/'); } }} style={{ background: '#111827', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, boxShadow: '0 2px 6px rgba(0,0,0,0.25)' }}>Close</button>
            </div>
            {loading && <div style={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', zIndex: 10000, background: 'rgba(31,41,55,0.85)', color: '#fff', padding: '6px 12px', borderRadius: 6 }}>Loading map...</div>}
            {error && <div style={{ position: 'absolute', top: 60, left: 12, zIndex: 10000, background: '#b91c1c', color: '#fff', padding: '6px 12px', borderRadius: 6 }}>{error}</div>}
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
}
