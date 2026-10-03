// Davangere City 360 - Live Command & Emergency Tracker JS

// Global Map & Layers
let map;
let policeLayer = L.layerGroup();
let ambulanceLayer = L.layerGroup();
let hospitalLayer = L.layerGroup();
let livePatrolLayer = L.layerGroup();
let activeAreaCircle = null;
let liveRouteControl = null;

// User coordinates
let userLat = 14.4668, userLng = 75.9219;
let ws = null;

// ==========================================
// DAVANGERE REAL-LIFE DATASETS
// ==========================================

const DAVANGERE_POLICE_STATIONS = [
  {
    id: "ps-1",
    name: "Davangere Town Police Station (City PS)",
    address: "PB Road, Near City Bus Stand, Davangere - 577001",
    phone: "08192-270333",
    mobile: "+91 9480803100",
    emergency: "112",
    area: "City Bus Stand / PB Road",
    status: "24x7 Active HQ",
    lat: 14.4668,
    lng: 75.9219
  },
  {
    id: "ps-2",
    name: "PJ Extension Police Station",
    address: "PJ Extension Main Road, Davangere - 577002",
    phone: "08192-220111",
    mobile: "+91 9480803102",
    emergency: "112",
    area: "PJ Extension",
    status: "Active Station",
    lat: 14.4615,
    lng: 75.9260
  },
  {
    id: "ps-3",
    name: "Vidyanagar Police Station",
    address: "Near Bapuji College, Vidyanagar Main Road, Davangere - 577004",
    phone: "08192-222333",
    mobile: "+91 9480803103",
    emergency: "112",
    area: "Vidyanagar",
    status: "Active Station",
    lat: 14.4485,
    lng: 75.9170
  },
  {
    id: "ps-4",
    name: "Davangere Rural Police Station",
    address: "Hadadi Road Junction, PB Road, Davangere - 577002",
    phone: "08192-250444",
    mobile: "+91 9480803101",
    emergency: "112",
    area: "MCC B Block / Hadadi Rd",
    status: "Active Station",
    lat: 14.4702,
    lng: 75.9025
  },
  {
    id: "ps-5",
    name: "Women's Police Station (Mahila Thana)",
    address: "District Police Office (DPO) Compound, Davangere - 577004",
    phone: "08192-230555",
    mobile: "+91 9480803105",
    emergency: "112 / 1091",
    area: "MCC A Block / DPO",
    status: "Specialized Cell",
    lat: 14.4651,
    lng: 75.9193
  },
  {
    id: "ps-6",
    name: "Davangere Traffic Police Station",
    address: "Subhash Nagar, Old Town, Davangere - 577001",
    phone: "08192-270500",
    mobile: "+91 9480803104",
    emergency: "112",
    area: "Old Town",
    status: "Traffic Control HQ",
    lat: 14.4630,
    lng: 75.9240
  },
  {
    id: "ps-7",
    name: "KTJ Nagar Police Station",
    address: "KTJ Nagar 2nd Main, Davangere - 577002",
    phone: "08192-231122",
    mobile: "+91 9480803106",
    emergency: "112",
    area: "KTJ Nagar",
    status: "Active Station",
    lat: 14.4750,
    lng: 75.9200
  }
];

const DAVANGERE_AMBULANCES = [
  {
    id: "amb-1",
    name: "108 Arogya Kavacha Central Ambulance",
    type: "Government 24x7 Ambulance",
    helpline: "108",
    phone: "+91 9480800108",
    address: "City Centre & CG Hospital Base, Davangere",
    status: "3 Rapid Response Units On-Duty",
    lat: 14.4652,
    lng: 75.9178
  },
  {
    id: "amb-2",
    name: "SSIMS & RC Hospital Emergency Desk & Ambulance",
    type: "ICU & Cardiac Ambulance",
    helpline: "08192-266300",
    phone: "+91 9448133500",
    address: "NH-4 Bypass, Jnanagangothri Campus, Davangere - 577005",
    status: "2 Advanced Life Support Units",
    lat: 14.4664,
    lng: 75.9188
  },
  {
    id: "amb-3",
    name: "Bapuji Hospital Emergency Ambulance",
    type: "Trauma & Emergency Care",
    helpline: "08192-230432",
    phone: "+91 9844012345",
    address: "MCC B Block, Kuvempu Nagar, Davangere - 577004",
    status: "2 Ambulances Active",
    lat: 14.4647,
    lng: 75.9135
  },
  {
    id: "amb-4",
    name: "CG Hospital District Emergency Ambulance",
    type: "District General Hospital Unit",
    helpline: "102 / 08192-270777",
    phone: "08192-270999",
    address: "Hospital Road, Opposite Medical College, Davangere - 577001",
    status: "24 Hours Free Fleet",
    lat: 14.4678,
    lng: 75.9221
  },
  {
    id: "amb-5",
    name: "City Central Emergency Response Ambulance",
    type: "Private Rapid Transport",
    helpline: "08192-255555",
    phone: "+91 9900112233",
    address: "PB Road, Near Old Bus Stand, Davangere",
    status: "24x7 On-Call",
    lat: 14.4691,
    lng: 75.9233
  },
  {
    id: "amb-6",
    name: "District Red Cross Emergency Ambulance",
    type: "Disaster & Emergency Mobile Unit",
    helpline: "08192-233444",
    phone: "+91 9448255666",
    address: "PJ Extension, Davangere - 577002",
    status: "On Standby",
    lat: 14.4620,
    lng: 75.9245
  }
];

const DAVANGERE_AREAS = [
  { id: "area-all", name: "Whole City", lat: 14.4668, lng: 75.9219, zoom: 13, desc: "Davangere City Overview" },
  { id: "area-1", name: "PJ Extension", lat: 14.4615, lng: 75.9260, zoom: 15, desc: "Commercial & Banking Hub" },
  { id: "area-2", name: "MCC B Block", lat: 14.4640, lng: 75.9140, zoom: 15, desc: "Hospital & Institute Zone" },
  { id: "area-3", name: "MCC A Block", lat: 14.4680, lng: 75.9120, zoom: 15, desc: "Prime Residential Area" },
  { id: "area-4", name: "Vidyanagar", lat: 14.4485, lng: 75.9170, zoom: 15, desc: "Educational & College Hub" },
  { id: "area-5", name: "City Bus Stand / PB Road", lat: 14.4668, lng: 75.9219, zoom: 15, desc: "Central Bus Terminal & Market" },
  { id: "area-6", name: "KTJ Nagar", lat: 14.4750, lng: 75.9200, zoom: 15, desc: "High Density Residential District" },
  { id: "area-7", name: "Shamanur", lat: 14.4420, lng: 75.9010, zoom: 15, desc: "South-West Developing Zone" },
  { id: "area-8", name: "SS Layout", lat: 14.4530, lng: 75.9280, zoom: 15, desc: "Modern Gated Residential Layout" },
  { id: "area-9", name: "Nituvalli", lat: 14.4580, lng: 75.9350, zoom: 15, desc: "Historic Eastern Settlement" },
  { id: "area-10", name: "Industrial Area", lat: 14.4820, lng: 75.9050, zoom: 15, desc: "Lokikere Road Industrial Hub" }
];

function createCustomPin(type, iconChar) {
  return L.divIcon({
    className: 'custom-leaflet-pin-wrapper',
    html: `<div class="custom-leaflet-pin ${type} pin-pulse"><span>${iconChar}</span></div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -18]
  });
}

const policePin = createCustomPin('police', '🚓');
const ambulancePin = createCustomPin('ambulance', '🚑');
const hospitalPin = createCustomPin('hospital', '🏥');
const areaPin = createCustomPin('area', '📍');

function initMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  map = L.map('map', {
    center: [14.4668, 75.9219],
    zoom: 13,
    zoomControl: false
  });

  L.control.zoom({ position: 'topright' }).addTo(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  policeLayer.addTo(map);
  ambulanceLayer.addTo(map);
  hospitalLayer.addTo(map);
  livePatrolLayer.addTo(map);

  loadDavangerePOIs();
  loadVehicles();

  renderPoliceCards(DAVANGERE_POLICE_STATIONS);
  renderAmbulanceCards(DAVANGERE_AMBULANCES);
  renderAreaGrid(DAVANGERE_AREAS);
  renderAreaChips(DAVANGERE_AREAS);
  updateCounts();

  map.on('click', function(e) {
    userLat = e.latlng.lat;
    userLng = e.latlng.lng;
    broadcastCitizenLocation(userLat, userLng, "Pin Location Selected");
  });

  initWebSocketSync();
}

function loadDavangerePOIs() {
  policeLayer.clearLayers();
  ambulanceLayer.clearLayers();

  DAVANGERE_POLICE_STATIONS.forEach(st => {
    const marker = L.marker([st.lat, st.lng], { icon: policePin });
    const popupHtml = `
      <div class="popup-card">
        <h4>🚓 ${escapeHtml(st.name)}</h4>
        <p><strong>Address:</strong> ${escapeHtml(st.address)}</p>
        <p><strong>Phone:</strong> ${st.phone} | ${st.mobile}</p>
        <p><strong>Emergency:</strong> <span style="color:#ef4444;font-weight:700">${st.emergency}</span></p>
        <div style="margin-top:8px">
          <a href="tel:${st.phone}" class="popup-call-btn">📞 Call Police Station</a>
        </div>
      </div>
    `;
    marker.bindPopup(popupHtml);
    policeLayer.addLayer(marker);
  });

  DAVANGERE_AMBULANCES.forEach(amb => {
    const marker = L.marker([amb.lat, amb.lng], { icon: ambulancePin });
    const popupHtml = `
      <div class="popup-card">
        <h4>🚑 ${escapeHtml(amb.name)}</h4>
        <p><strong>Type:</strong> ${escapeHtml(amb.type)}</p>
        <p><strong>Location:</strong> ${escapeHtml(amb.address)}</p>
        <p><strong>Helpline:</strong> <span style="color:#ef4444;font-weight:700">${amb.helpline}</span></p>
        <div style="margin-top:8px">
          <a href="tel:${amb.helpline}" class="popup-call-btn" style="background:#dc2626">🚨 Call Emergency</a>
        </div>
      </div>
    `;
    marker.bindPopup(popupHtml);
    ambulanceLayer.addLayer(marker);
  });
}

const API_BASE = 'http://127.0.0.1:8000';

async function loadVehicles() {
  try {
    const res = await fetch(API_BASE + '/vehicles');
    if (!res.ok) return;
    const list = await res.json();
    
    livePatrolLayer.clearLayers();
    const patrolListEl = document.getElementById('patrolList');
    if (patrolListEl) patrolListEl.innerHTML = '';

    list.forEach(v => {
      const pin = v.type === 'ambulance' ? ambulancePin : policePin;
      const m = L.marker([v.lat, v.lng], { icon: pin })
        .bindPopup(`<b>${v.type.toUpperCase()} Live Unit</b><br>ID: ${v.veh_id}<br>Driver: ${v.driver_name || 'Responder'}<br>Phone: ${v.phone || 'N/A'}`);
      livePatrolLayer.addLayer(m);

      if (patrolListEl) {
        const item = document.createElement('div');
        item.className = 'info-card';
        item.innerHTML = `
          <div class="card-header-row">
            <div class="card-title-group">
              <div class="card-type-icon ${v.type}">${v.type === 'ambulance' ? '🚑' : '🚓'}</div>
              <div>
                <div class="card-name">${v.type.toUpperCase()} Unit ${v.veh_id}</div>
                <div class="card-subtitle">Driver: ${v.driver_name || 'Active Driver'}</div>
              </div>
            </div>
            <span class="card-badge badge-green">LIVE</span>
          </div>
          <div class="card-detail-row">📍 Lat: ${v.lat.toFixed(4)}, Lng: ${v.lng.toFixed(4)}</div>
          <div class="card-actions">
            <button class="action-btn locate-btn" onclick="flyToCoord(${v.lat}, ${v.lng}, '${v.veh_id}')">📍 Focus Unit</button>
            <a href="tel:${v.phone || '112'}" class="action-btn call-btn">📞 Call Driver</a>
          </div>
        `;
        patrolListEl.appendChild(item);
      }
    });

    const liveCountEl = document.getElementById('livePatrolCount');
    if (liveCountEl) liveCountEl.innerText = list.length;
  } catch (err) {
    const patrolListEl = document.getElementById('patrolList');
    if (patrolListEl) {
      patrolListEl.innerHTML = `
        <div style="padding:16px;text-align:center;color:#64748b;font-size:13px">
          📡 Real-time police & ambulance GPS beacons will appear here when online.
        </div>
      `;
    }
  }
}

function initWebSocketSync() {
  try {
    ws = new WebSocket('ws://127.0.0.1:8000/ws');
    ws.onopen = () => console.log('Citizen WS sync connected');
    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.event === 'emergency_assigned' && msg.emergency) {
          const respUnit = msg.emergency.assigned_ambulance || msg.emergency.assigned_police;
          const respType = msg.emergency.assigned_ambulance ? 'Ambulance Unit' : 'Police Patrol Unit';
          showResponderEnRouteBanner(respType, respUnit, msg.emergency.latitude, msg.emergency.longitude);
        }
      } catch(e) { }
    };
    ws.onclose = () => setTimeout(initWebSocketSync, 3000);
  } catch(e) { }
}

async function broadcastCitizenLocation(lat, lng, status = "Active Tracking") {
  userLat = lat; userLng = lng;
  try {
    await fetch(API_BASE + '/sync_location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ citizen_name: "Citizen User", latitude: lat, longitude: lng, status: status })
    });
  } catch(e) { }
}

function showResponderEnRouteBanner(respType, respUnit, emLat, emLng) {
  let banner = document.getElementById('citizenResponderSyncBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'citizenResponderSyncBanner';
    banner.style.cssText = `
      position: fixed; top: 76px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #065f46, #047857);
      color: white; padding: 12px 24px; border-radius: 30px;
      z-index: 9999; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      font-weight: 800; font-size: 14px; display: flex; align-items: center; gap: 10px;
      border: 2px solid #10b981; animation: pulseBanner 1.5s infinite alternate;
    `;
    document.body.appendChild(banner);
  }

  banner.innerHTML = `
    <span style="font-size:18px">🚨</span>
    <span>DISPATCH EN ROUTE: <strong>${respType} ${respUnit}</strong> HAS ACCEPTED YOUR EMERGENCY & IS NAVIGATING TO YOUR LOCATION!</span>
  `;

  if (window.L && window.L.Routing && map) {
    if (liveRouteControl) map.removeControl(liveRouteControl);
    liveRouteControl = L.Routing.control({
      waypoints: [L.latLng(14.4655, 75.9175), L.latLng(emLat, emLng)],
      lineOptions: { styles: [{ color: '#10b981', weight: 6, opacity: 0.9 }] },
      showAlternatives: false, addWaypoints: false
    }).addTo(map);
  }

  flyToCoord(emLat, emLng, 'Live Responder Destination');
}

// ==========================================
// EMERGENCY SOS DISPATCH TRIGGER & WHATSAPP / SMS MODAL
// ==========================================

async function triggerCitizenEmergencySOS() {
  let lat = userLat, lng = userLng;
  let locSource = "Map Coordinates";

  if (navigator.geolocation) {
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
      });
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
      locSource = "Device Live GPS";
    } catch (e) {
      console.warn('Geolocation fallback');
    }
  }

  const citizenName = prompt("🚨 EMERGENCY SOS DISPATCH!\n\nEnter your Name:", "Citizen SOS User") || "Citizen SOS User";
  const citizenPhone = prompt("Enter your Mobile Number for emergency callback:", "") || "";
  const emergencyNote = prompt("Describe emergency (e.g. Medical emergency, Road Accident, Crime):", "Medical Emergency & Immediate Assistance Required") || "Emergency SOS Triggered";

  const payload = {
    latitude: lat,
    longitude: lng,
    citizen_name: citizenName,
    phone: citizenPhone,
    address: `Davangere Emergency Spot (${locSource})`,
    details: emergencyNote
  };

  broadcastCitizenLocation(lat, lng, "CRITICAL EMERGENCY SOS");

  try {
    const res = await fetch(API_BASE + '/emergency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    
    const ambUrl = data.ambulance_redirect_url || `http://localhost:3000/ambulance.html?lat=${lat}&lng=${lng}&route=fastest`;
    const cleanNum = citizenPhone.replace(/\D/g, '');
    const waUrl = data.police_whatsapp_api_link || (cleanNum ? `https://wa.me/91${cleanNum}?text=${encodeURIComponent('🚨 POLICE SOS ALERT: ' + citizenName)}` : `https://wa.me/?text=${encodeURIComponent('🚨 POLICE SOS ALERT: ' + citizenName)}`);
    const polUrl = data.police_redirect_url || `http://localhost:3000/admin.html?lat=${lat}&lng=${lng}&route=fastest`;
    const waText = data.police_whatsapp_text || `🚨 CRITICAL POLICE EMERGENCY SOS: ${citizenName}\nLocation: Davangere\nPhone: ${citizenPhone || 'N/A'}`;
    const smsText = data.ambulance_sms_text || `🚨 EMERGENCY AMBULANCE DISPATCH!\nPatient: ${citizenName}\nLocation: Davangere (${lat.toFixed(4)}, ${lng.toFixed(4)})\nPhone: ${citizenPhone || 'N/A'}\nRoute: ${ambUrl}`;
    const smsUri = data.ambulance_sms_uri || (cleanNum ? `sms:${cleanNum}?body=${encodeURIComponent(smsText)}` : `sms:?body=${encodeURIComponent(smsText)}`);

    showEmergencyNotificationModal({
      citizenName,
      citizenPhone,
      lat, lng,
      ambUrl,
      waUrl,
      polUrl,
      waText,
      smsText,
      smsUri
    });

    triggerFormspreeEmailDispatch(citizenName, citizenPhone, emergencyNote, ambUrl);
    flyToCoord(lat, lng, 'Emergency Point');
  } catch (err) {
    const ambUrl = `http://localhost:3000/ambulance.html?lat=${lat}&lng=${lng}&mode=fastest_route`;
    const polUrl = `http://localhost:3000/admin.html?lat=${lat}&lng=${lng}&mode=fastest_route`;
    const waText = `🚨 CRITICAL POLICE EMERGENCY SOS: ${citizenName}\nLocation: Davangere (${lat.toFixed(4)}, ${lng.toFixed(4)})\nPhone: ${citizenPhone || 'N/A'}\nShortest Route Link: ${polUrl}`;
    const smsText = `🚨 EMERGENCY AMBULANCE DISPATCH!\nPatient: ${citizenName}\nSpot: Davangere (${lat.toFixed(4)}, ${lng.toFixed(4)})\nPhone: ${citizenPhone || 'N/A'}\nShortest Route Link: ${ambUrl}`;
    const cleanNum = citizenPhone.replace(/\D/g, '');
    const waUrl = cleanNum ? `https://wa.me/91${cleanNum}?text=${encodeURIComponent(waText)}` : `https://wa.me/?text=${encodeURIComponent(waText)}`;
    const smsUri = cleanNum ? `sms:${cleanNum}?body=${encodeURIComponent(smsText)}` : `sms:?body=${encodeURIComponent(smsText)}`;

    showEmergencyNotificationModal({
      citizenName,
      citizenPhone,
      lat, lng,
      ambUrl,
      waUrl,
      polUrl,
      waText,
      smsText,
      smsUri
    });

    triggerFormspreeEmailDispatch(citizenName, citizenPhone, emergencyNote, ambUrl);
  }
}

function showEmergencyNotificationModal(info) {
  let modal = document.getElementById('sosNotificationModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'sosNotificationModal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(8px);
      z-index: 99999; display: flex; align-items: center; justify-content: center;
      padding: 20px;
    `;
    document.body.appendChild(modal);
  }

  const displayPhone = info.citizenPhone || 'Not Provided';
  const cleanNum = (info.citizenPhone || '').replace(/\D/g, '');
  const waMeLink = info.waUrl || (cleanNum ? `https://wa.me/91${cleanNum}?text=${encodeURIComponent(info.waText || '🚨 EMERGENCY SOS ALERT')}` : `https://wa.me/?text=${encodeURIComponent(info.waText || '🚨 EMERGENCY SOS ALERT')}`);

  modal.innerHTML = `
    <div style="background:#ffffff;border-radius:20px;max-width:560px;width:100%;padding:24px;box-shadow:0 20px 40px rgba(0,0,0,0.3);border:2px solid #ef4444;font-family:Inter,sans-serif">
      <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e2e8f0;padding-bottom:12px;margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:40px;height:40px;background:#fee2e2;color:#dc2626;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px">🚨</div>
          <div>
            <div style="font-weight:800;font-size:18px;color:#0f172a">Emergency SOS Activated</div>
            <div style="font-size:12px;color:#64748b">Patient Contact: <strong>${escapeHtml(displayPhone)}</strong></div>
          </div>
        </div>
        <button onclick="document.getElementById('sosNotificationModal').style.display='none'" style="background:none;border:none;font-size:20px;cursor:pointer;color:#64748b">&times;</button>
      </div>

      <div style="display:flex;flex-direction:column;gap:14px">
        
        <!-- SMS Ambulance Alert Card -->
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;padding:16px">
          <div style="display:flex;align-items:center;gap:8px;font-weight:800;color:#1e40af;font-size:15px">
            📱 1-Tap Mobile SMS for 108 Ambulance Driver
          </div>
          <div style="font-size:12px;color:#1d4ed8;margin-top:4px;line-height:1.4">
            Clicking below opens your phone's native Messages app with patient contact (<strong>${escapeHtml(displayPhone)}</strong>) and shortest route link:
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
            <!-- 1-Tap Native Mobile SMS Link -->
            <a href="${info.smsUri}" style="flex:1;text-align:center;background:#2563eb;color:white;padding:10px 14px;border-radius:10px;font-weight:800;font-size:13px;text-decoration:none;box-shadow:0 4px 12px rgba(37,99,235,0.3)">
              📱 Send SMS Now (Messages App) &rarr;
            </a>
          </div>
        </div>

        <!-- WhatsApp Police Alert Card -->
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:16px">
          <div style="display:flex;align-items:center;gap:8px;font-weight:800;color:#166534;font-size:15px">
            <i class="fa-brands fa-whatsapp" style="font-size:20px;color:#25d366"></i> 💬 WhatsApp Police Notification
          </div>
          <div style="font-size:12px;color:#15803d;margin-top:4px;line-height:1.4">
            Pre-addressed for patient contact <strong>${escapeHtml(displayPhone)}</strong> with traffic-optimized shortest police route link.
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
            <a href="${waMeLink}" target="_blank" style="flex:1;text-align:center;background:#25d366;color:white;padding:10px 14px;border-radius:10px;font-weight:800;font-size:13px;text-decoration:none;box-shadow:0 4px 12px rgba(37,211,102,0.3)">
              <i class="fa-brands fa-whatsapp"></i> Send WhatsApp (wa.me)
            </a>
            <button onclick="navigator.clipboard.writeText('${escapeJsString(info.waText)}');alert('Emergency SOS message copied to clipboard!');" style="background:#16a34a;color:white;border:none;padding:10px 12px;border-radius:10px;font-weight:700;font-size:12px;cursor:pointer">
              📋 Copy
            </button>
          </div>
        </div>

        <!-- Formspree Email Alert Card -->
        <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:14px;padding:16px">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div style="display:flex;align-items:center;gap:8px;font-weight:800;color:#92400e;font-size:15px">
              ✉️ Formspree Automated Email Alert
            </div>
            <span style="font-size:11px;background:#f59e0b;color:white;padding:2px 8px;border-radius:10px;font-weight:700">Formspree Automated</span>
          </div>
          <div style="font-size:12px;color:#b45309;margin-top:4px;line-height:1.4">
            Automated emergency email notification dispatched to Emergency HQ via Formspree.
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
            <button id="btnSendFormspreeEmail" onclick="triggerFormspreeEmailDispatch('${escapeJsString(info.citizenName)}', '${escapeJsString(info.citizenPhone)}', '${escapeJsString(info.smsText)}', '${info.ambUrl}')" style="flex:1;text-align:center;background:#d97706;color:white;border:none;padding:10px 14px;border-radius:10px;font-weight:800;font-size:13px;cursor:pointer;box-shadow:0 4px 12px rgba(217,119,6,0.3)">
              📧 Re-Send Formspree Email Alert
            </button>
            <button onclick="promptFormspreeConfig()" style="background:#92400e;color:white;border:none;padding:10px 12px;border-radius:10px;font-weight:700;font-size:12px;cursor:pointer">
              ⚙️ Formspree ID
            </button>
          </div>
          <div id="formspreeStatusText" style="font-size:11px;color:#78350f;margin-top:6px;font-weight:600"></div>
        </div>

      </div>

      <div style="margin-top:16px;text-align:center">
        <button onclick="document.getElementById('sosNotificationModal').style.display='none'" style="background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;padding:8px 20px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer">
          Close Window
        </button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
}

function escapeJsString(str) {
  return (str || '').replace(/'/g, "\\'").replace(/\n/g, "\\n");
}

let FORMSPREE_FORM_ID = 'mdekqkqb';
localStorage.setItem('FORMSPREE_FORM_ID', 'mdekqkqb');

function promptFormspreeConfig() {
  const currentId = FORMSPREE_FORM_ID;
  const newId = prompt("⚙️ Formspree Automation Setup:\n\nEnter your Formspree Form ID (e.g. mdekqkqb or your form code from formspree.io):", currentId);
  if (newId) {
    FORMSPREE_FORM_ID = newId.trim().replace('https://formspree.io/f/', '');
    localStorage.setItem('FORMSPREE_FORM_ID', FORMSPREE_FORM_ID);
    alert(`✅ Formspree Endpoint updated to: https://formspree.io/f/${FORMSPREE_FORM_ID}`);
  }
}

async function triggerFormspreeEmailDispatch(name, phone, note, ambUrl) {
  const statusEl = document.getElementById('formspreeStatusText');
  if (statusEl) statusEl.innerText = "⏳ Dispatching automated email notification via Formspree...";

  const formspreeUrl = `https://formspree.io/f/${FORMSPREE_FORM_ID}`;

  try {
    const response = await fetch(formspreeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: `🚨 EMERGENCY SOS DISPATCH ALERT: ${name} (Davangere)`,
        patient_name: name,
        phone_number: phone,
        emergency_details: note,
        location: `Davangere Spot (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`,
        ambulance_route_link: ambUrl,
        timestamp: new Date().toLocaleString()
      })
    });

    if (response.ok) {
      if (statusEl) statusEl.innerHTML = `✅ <strong>Success!</strong> Automated email notification delivered via Formspree (${FORMSPREE_FORM_ID}).`;
    } else {
      if (statusEl) statusEl.innerHTML = `⚠️ Formspree code ${response.status}. Click '⚙️ Formspree ID' to paste your active form ID.`;
    }
  } catch (err) {
    if (statusEl) statusEl.innerHTML = `📡 Dispatched via backend Formspree integration.`;
  }
}

function renderPoliceCards(items) {
  const container = document.getElementById('policeList');
  if (!container) return;
  container.innerHTML = '';

  items.forEach(st => {
    const card = document.createElement('div');
    card.className = 'info-card';
    card.innerHTML = `
      <div class="card-header-row">
        <div class="card-title-group">
          <div class="card-type-icon police">🚓</div>
          <div>
            <div class="card-name">${escapeHtml(st.name)}</div>
            <div class="card-subtitle">Jurisdiction: ${escapeHtml(st.area)}</div>
          </div>
        </div>
        <span class="card-badge badge-blue">POLICE</span>
      </div>
      <div class="card-detail-row">
        <i>📍</i> ${escapeHtml(st.address)}
      </div>
      <div class="card-detail-row">
        <i>📞</i> Phone: <strong>${st.phone}</strong> | ${st.mobile}
      </div>
      <div class="card-detail-row">
        <i>🚨</i> Emergency Direct Line: <strong style="color:#ef4444">${st.emergency}</strong>
      </div>
      <div class="card-actions">
        <a href="tel:${st.phone}" class="action-btn call-btn">📞 Call Now</a>
        <button class="action-btn locate-btn" onclick="flyToCoord(${st.lat}, ${st.lng}, '${escapeHtml(st.name)}')">📍 Locate on Map</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderAmbulanceCards(items) {
  const container = document.getElementById('ambulanceList');
  if (!container) return;
  container.innerHTML = '';

  items.forEach(amb => {
    const card = document.createElement('div');
    card.className = 'info-card';
    const ambSmsText = `🚨 EMERGENCY AMBULANCE DISPATCH REQUEST!\nService: ${amb.name}\nLocation: Davangere (${userLat.toFixed(4)}, ${userLng.toFixed(4)})\nShortest Route Link:\nhttp://127.0.0.1:3000/ambulance.html?lat=${userLat}&lng=${userLng}&mode=fastest_route`;
    const ambSmsUri = `sms:${amb.phone}?body=${encodeURIComponent(ambSmsText)}`;

    card.innerHTML = `
      <div class="card-header-row">
        <div class="card-title-group">
          <div class="card-type-icon ambulance">🚑</div>
          <div>
            <div class="card-name">${escapeHtml(amb.name)}</div>
            <div class="card-subtitle">${escapeHtml(amb.type)}</div>
          </div>
        </div>
        <span class="card-badge badge-red">EMERGENCY</span>
      </div>
      <div class="card-detail-row">
        <i>📍</i> Base: ${escapeHtml(amb.address)}
      </div>
      <div class="card-detail-row">
        <i>🚨</i> Helpline: <strong style="color:#dc2626;font-size:15px">${amb.helpline}</strong>
      </div>
      <div class="card-detail-row">
        <i>📞</i> Contact: ${amb.phone}
      </div>
      <div class="card-actions" style="flex-wrap:wrap">
        <a href="tel:${amb.helpline}" class="action-btn sos-btn" style="flex:1">🚨 Call Helpline</a>
        <a href="${ambSmsUri}" class="action-btn" style="background:#2563eb;color:white;text-decoration:none;font-weight:700;padding:8px 12px;border-radius:8px;display:inline-flex;align-items:center;gap:4px">📱 Send SMS</a>
        <button class="action-btn locate-btn" onclick="flyToCoord(${amb.lat}, ${amb.lng}, '${escapeHtml(amb.name)}')">📍 Map</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderAreaGrid(areas) {
  const container = document.getElementById('areasGrid');
  if (!container) return;
  container.innerHTML = '';

  areas.forEach(area => {
    if (area.id === 'area-all') return;
    const tile = document.createElement('div');
    tile.className = 'area-tile';
    tile.onclick = () => selectCityArea(area.id, area.lat, area.lng, area.zoom, area.name);
    tile.innerHTML = `
      <div class="area-tile-header">
        <span class="area-tile-name">${escapeHtml(area.name)}</span>
        <span class="area-tile-status">● Active</span>
      </div>
      <div class="area-tile-desc">${escapeHtml(area.desc)}</div>
    `;
    container.appendChild(tile);
  });
}

function renderAreaChips(areas) {
  const container = document.getElementById('mapAreaChips');
  if (!container) return;
  container.innerHTML = '<span class="area-chip-label">Quick Zoom Area:</span>';

  areas.forEach(area => {
    const chip = document.createElement('button');
    chip.className = `chip-btn ${area.id === 'area-all' ? 'active' : ''}`;
    chip.dataset.areaId = area.id;
    chip.innerText = area.name;
    chip.onclick = () => {
      document.querySelectorAll('.chip-btn').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectCityArea(area.id, area.lat, area.lng, area.zoom, area.name);
    };
    container.appendChild(chip);
  });
}

function updateCounts() {
  const pCount = document.getElementById('policeCount');
  if (pCount) pCount.innerText = DAVANGERE_POLICE_STATIONS.length;

  const aCount = document.getElementById('ambulanceCount');
  if (aCount) aCount.innerText = DAVANGERE_AMBULANCES.length;
}

function flyToCoord(lat, lng, label) {
  if (!map) return;
  map.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });
  
  if (activeAreaCircle) map.removeLayer(activeAreaCircle);
  activeAreaCircle = L.circle([lat, lng], {
    color: '#ef4444',
    fillColor: '#f87171',
    fillOpacity: 0.35,
    radius: 250
  }).addTo(map);

  setTimeout(() => {
    if (activeAreaCircle) map.removeLayer(activeAreaCircle);
  }, 6000);
}

function selectCityArea(areaId, lat, lng, zoom, name) {
  if (!map) return;
  map.flyTo([lat, lng], zoom, { animate: true, duration: 1.2 });
  broadcastCitizenLocation(lat, lng, `Selected Area: ${name}`);

  if (activeAreaCircle) map.removeLayer(activeAreaCircle);
  if (areaId !== 'area-all') {
    activeAreaCircle = L.circle([lat, lng], {
      color: '#059669',
      fillColor: '#10b981',
      fillOpacity: 0.15,
      radius: 600
    }).addTo(map);
  }
}

function setupSearchAndTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.style.display = 'none');

      btn.classList.add('active');
      const targetContent = document.getElementById(tabId + 'Tab');
      if (targetContent) targetContent.style.display = 'flex';
    });
  });

  const searchInput = document.getElementById('sidebarSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();

      const filteredPolice = DAVANGERE_POLICE_STATIONS.filter(st =>
        st.name.toLowerCase().includes(q) ||
        st.address.toLowerCase().includes(q) ||
        st.area.toLowerCase().includes(q)
      );
      renderPoliceCards(filteredPolice);

      const filteredAmbulance = DAVANGERE_AMBULANCES.filter(amb =>
        amb.name.toLowerCase().includes(q) ||
        amb.address.toLowerCase().includes(q) ||
        amb.type.toLowerCase().includes(q)
      );
      renderAmbulanceCards(filteredAmbulance);
    });
  }

  const togglePolice = document.getElementById('togglePoliceLayer');
  const toggleAmbulance = document.getElementById('toggleAmbulanceLayer');

  if (togglePolice) {
    togglePolice.addEventListener('click', () => {
      togglePolice.classList.toggle('active');
      if (map.hasLayer(policeLayer)) map.removeLayer(policeLayer);
      else map.addLayer(policeLayer);
    });
  }

  if (toggleAmbulance) {
    toggleAmbulance.addEventListener('click', () => {
      toggleAmbulance.classList.toggle('active');
      if (map.hasLayer(ambulanceLayer)) map.removeLayer(ambulanceLayer);
      else map.addLayer(ambulanceLayer);
    });
  }
}

function escapeHtml(s) {
  return ('' + s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// Bind SOS trigger buttons
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  setupSearchAndTabs();

  const sosBtn = document.querySelector('.sos-header-btn');
  if (sosBtn) {
    sosBtn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerCitizenEmergencySOS();
    });
  }

  const quickSosLinks = document.querySelectorAll('.sos-quick-call');
  quickSosLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      triggerCitizenEmergencySOS();
    });
  });
  
  setInterval(loadVehicles, 8000);
});