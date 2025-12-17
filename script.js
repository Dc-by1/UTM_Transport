/* --- STATE MANAGEMENT --- */
let mapsInitialized = { bus: false, bike: false };
let busMap, bikeMap;
let activeBooking = null; // Temp storage for confirmation details

// --- 1. ROUTING SYSTEM ---
function router(viewId) {
    document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const navBtn = document.getElementById(`nav-${viewId}`);
    if (navBtn) navBtn.classList.add('active');

    if (viewId === 'bus') initBusMap();
    if (viewId === 'bike') initBikeMap();
}

// --- 2. LOGIN LOGIC ---
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email-input').value.toLowerCase();
    
    if (email.endsWith('@graduate.utm.my')) {
        document.getElementById('view-login').style.display = 'none';
        document.getElementById('app-header').classList.remove('hidden');
        document.getElementById('bottom-nav').classList.remove('hidden');
        router('home');
    } else {
        const btn = document.querySelector('.btn-main');
        btn.innerHTML = "Access Denied";
        btn.style.background = "#d63031";
        setTimeout(() => {
            btn.innerHTML = "Login now";
            btn.style.background = "linear-gradient(90deg, #6c5ce7, #4834d4)";
            alert('Restricted: Please use a @graduate.utm.my email.');
        }, 1000);
    }
});

function logout() {
    location.reload();
}

// --- 3. TAB LOGIC ---
function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    
    document.querySelectorAll('.tab-link').forEach(el => el.classList.remove('active'));
    if(tabId === 'find-ride') document.querySelector('.tab-link:nth-child(1)').classList.add('active');
    else document.querySelector('.tab-link:nth-child(2)').classList.add('active');
}

// --- 4. OVERLAY & VISUALIZATION LOGIC ---

function closeAllOverlays() {
    document.querySelectorAll('.bottom-sheet').forEach(el => el.classList.remove('active'));
    document.getElementById('overlay-backdrop').classList.remove('active');
}

function showSuccess(title, message, ticketHtml = '') {
    const overlay = document.getElementById('overlay-success');
    document.getElementById('success-title').innerText = title;
    document.getElementById('success-msg').innerText = message;
    document.getElementById('success-ticket').innerHTML = ticketHtml;
    
    overlay.classList.remove('hidden');
}

function closeSuccess() {
    document.getElementById('overlay-success').classList.add('hidden');
    router('home'); // Redirect home after success
}

// --- BUS TRACKING VISUALS ---
function openTrackSheet(route, desc, eta) {
    document.getElementById('overlay-backdrop').classList.add('active');
    document.getElementById('sheet-tracking').classList.add('active');
    
    // Inject Data
    document.getElementById('track-route').innerText = route;
    document.getElementById('track-desc').innerText = desc;
    document.getElementById('track-eta').innerText = parseInt(eta);
}

// --- RIDE BOOKING VISUALS ---
// UPDATED: Now accepts 'origin' location
function openBookingSheet(driver, car, origin, dest, price) {
    activeBooking = { driver, car, origin, dest, price }; // Store origin too
    
    document.getElementById('overlay-backdrop').classList.add('active');
    document.getElementById('sheet-booking').classList.add('active');
    
    // Inject Data
    document.getElementById('book-driver').innerText = driver;
    document.getElementById('book-car').innerText = car;
    // We update the destination text to show Origin -> Destination
    document.getElementById('book-dest').innerHTML = `${origin} <i class="fas fa-arrow-right" style="font-size:0.8rem; margin:0 5px;"></i> ${dest}`;
    document.getElementById('book-price').innerText = 'RM ' + price;
}

function confirmRide() {
    closeAllOverlays();
    
    // Generate Ticket with Origin Info
    const ticketHtml = `
        <div class="ticket-row"><span>Driver:</span> <strong>${activeBooking.driver}</strong></div>
        <div class="ticket-row"><span>Car:</span> <strong>${activeBooking.car}</strong></div>
        <div class="ticket-row"><span>Route:</span> <strong>${activeBooking.origin} to ${activeBooking.dest}</strong></div>
        <div class="ticket-row" style="margin-top:10px; border-top:1px solid rgba(255,255,255,0.3); padding-top:5px;">
            <span>Paid:</span> <strong>RM ${activeBooking.price}</strong>
        </div>
    `;

    setTimeout(() => {
        showSuccess('Booking Confirmed!', 'Please wait at ' + activeBooking.origin, ticketHtml);
    }, 500);
}

function processPublish() {
    const btn = document.querySelector('#offer-ride .btn-main');
    btn.innerText = "Publishing...";
    
    setTimeout(() => {
        btn.innerText = "Publish Ride";
        showSuccess('Ride Published!', 'Students can now book your trip.', '');
    }, 1000);
}

// --- BIKE UNLOCK VISUALS ---
function openBikeSheet(station, count) {
    document.getElementById('overlay-backdrop').classList.add('active');
    document.getElementById('sheet-bike').classList.add('active');
    
    document.getElementById('bike-station').innerText = station;
}

function processBikeUnlock() {
    closeAllOverlays();
    const code = Math.floor(1000 + Math.random() * 9000);
    
    const ticketHtml = `
        <div style="text-align:center; font-size: 2.5rem; font-weight: 700; letter-spacing: 5px; margin: 10px 0;">
            ${code}
        </div>
        <div style="text-align:center; font-size: 0.8rem;">Enter this code on the bike keypad</div>
    `;
    
    showSuccess('Bike Unlocked!', 'Enjoy your ride around campus!', ticketHtml);
}

// --- 5. MAPS ---
function initBusMap() {
    if (mapsInitialized.bus) return;
    setTimeout(() => {
        busMap = L.map('map-bus').setView([1.559, 103.638], 15);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(busMap);
        const icon = L.divIcon({ html: '<i class="fas fa-bus" style="color:#6c5ce7;font-size:24px;"></i>', className: 'dummy' });
        L.marker([1.562, 103.636], {icon: icon}).addTo(busMap);
        mapsInitialized.bus = true;
    }, 100);
}

function initBikeMap() {
    if (mapsInitialized.bike) return;
    setTimeout(() => {
        bikeMap = L.map('map-bike').setView([1.560, 103.638], 15);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(bikeMap);
        L.circle([1.560, 103.638], { color: '#00cec9', radius: 80 }).addTo(bikeMap);
        L.circle([1.558, 103.635], { color: '#00cec9', radius: 60 }).addTo(bikeMap);
        mapsInitialized.bike = true;
    }, 100);
}

// --- 6. WALLET & TOP UP LOGIC ---

function openTopUpSheet() {
    document.getElementById('overlay-backdrop').classList.add('active');
    document.getElementById('sheet-topup').classList.add('active');
}

function simulatePayment(methodName, colorHex) {
    // 1. Close the selection sheet
    closeAllOverlays();

    // 2. Show Redirect Loading Screen
    const loader = document.getElementById('overlay-loading');
    const loadText = document.getElementById('loading-text');
    
    loader.classList.remove('hidden');
    loadText.innerText = `Connecting to ${methodName}...`;
    
    // Simulate API delay (Redirecting...)
    setTimeout(() => {
        loadText.innerText = "Verifying Credentials...";
    }, 1500);

    setTimeout(() => {
        loadText.innerText = "Processing Payment...";
    }, 2500);

    // 3. Show Success after delay
    setTimeout(() => {
        loader.classList.add('hidden'); // Hide loader
        
        // Create a visual receipt
        const receiptHtml = `
            <div class="ticket-row"><span>Method:</span> <strong>${methodName}</strong></div>
            <div class="ticket-row"><span>Amount:</span> <strong>RM 50.00</strong></div>
            <div class="ticket-row"><span>Status:</span> <strong style="color:#00b894">Successful</strong></div>
            <div style="margin-top:15px; font-size:0.8rem; color:#636e72; text-align:center;">
                Transaction ID: #TRX${Math.floor(Math.random()*1000000)}
            </div>
        `;
        
        showSuccess('Top Up Successful!', 'Your wallet balance has been updated.', receiptHtml);
    }, 4000); // 4 seconds total wait to feel "real"
}

// --- 7. RIDE FILTERING LOGIC ---
function filterRides() {
    const input = document.getElementById('ride-dest-input').value.toLowerCase();
    const cards = document.querySelectorAll('.ride-card');
    let hasResults = false;

    cards.forEach(card => {
        const destination = card.getAttribute('data-dest').toLowerCase();
        // Simple logic: If input is empty OR destination matches input, show it.
        if (destination.includes(input) || input === '') {
            card.style.display = 'flex';
            hasResults = true;
        } else {
            card.style.display = 'none';
        }
    });

    // Show "No Results" message if everything is hidden
    const msg = document.getElementById('no-rides-msg');
    if(msg) msg.style.display = hasResults ? 'none' : 'block';
}