// src/apiService.js
const API_BASE_URL = 'http://localhost:8089/api'; // Your Java backend URL for auth

const FAKE_LATENCY = 200;

// --- Define Dates for May 11 - May 18, 2024 ---
const START_DATE_STR = '2024-05-11';
const DATES_AVAILABLE = Array.from({ length: 8 }, (_, i) => {
    const date = new Date(START_DATE_STR + 'T00:00:00Z');
    date.setUTCDate(date.getUTCDate() + i);
    return date.toISOString().split('T')[0];
});

console.log("DATES_AVAILABLE (May 11-18):", DATES_AVAILABLE);


const SHOW_TIMES_PER_DAY = ['10:00 AM', '01:15 PM', '04:30 PM', '07:45 PM', '10:30 PM'];

const mockMoviesDb = [
    { id: 'm100', title: 'Yamadonga (Jr.NTR Re-release)', language: 'Telugu', genre: 'Fantasy/Action', posterUrl: 'https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/et00000127.jpg', duration: '170 min', description: 'The classic fantasy entertainer returns to the big screen! Special Re-release.', releaseContext: 'rerelease_yamadonga' },
    { id: 'm201', title: 'Kalki 2898 AD', language: 'Telugu', genre: 'Sci-Fi/Epic', posterUrl: 'https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/kalki-2898-ad-et00352941-1718275859.jpg', duration: '180 min', description: 'A futuristic epic set in a dystopian world, blending mythology and sci-fi.', releaseContext: 'upcoming_blockbuster' },
    { id: 'm202', title: 'HIT: The Third Case', language: 'Telugu', genre: 'Thriller/Crime', posterUrl: 'https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600,bg-CCCCCC:w-400.0,h-660.0,cm-pad_resize,bg-000000,fo-top:l-image,i-discovery-catalog@@icons@@star-icon-202203010609.png,lx-24,ly-615,w-29,l-end:l-text,ie-OC45LzEwICA1Ny45SyBWb3Rlcw%3D%3D,fs-29,co-FFFFFF,ly-612,lx-70,pa-8_0_0_0,l-end/et00410905-xlhtlqjgas-portrait.jpg', duration: '145 min', description: 'The next installment in the gripping HIT crime investigation series.', releaseContext: 'recent_thriller' },
    { id: 'm203', title: '#Single', language: 'Telugu', genre: 'Romance/Comedy', posterUrl: 'https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/-single-et00441505-1746771621.jpg', duration: '130 min', description: 'A light-hearted take on modern singledom and relationships.', releaseContext: 'recent_romcom' },
    { id: 'm204', title: 'Retro', language: 'Telugu', genre: 'Drama/Period', posterUrl: 'https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/retro-et00426563-1735202760.jpg', duration: '150 min', description: 'A nostalgic journey back in time, exploring stories from a bygone era.', releaseContext: 'new_drama' },
    { id: 'm205', title: 'Kaliyugam 2064', language: 'Telugu', genre: 'Sci-Fi/Dystopian', posterUrl: 'https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/kaliyugam-2064-et00443466-1745659416.jpg', duration: '160 min', description: 'A vision of the future, exploring societal changes and challenges in 2064.', releaseContext: 'new_scifi' },
    { id: 'm206', title: 'Subham', language: 'Telugu', genre: 'Family/Drama', posterUrl: 'https://assets-in.bmscdn.com/iedb/movies/images/mobile/thumbnail/xlarge/subham-et00440249-1743578371.jpg', duration: '140 min', description: 'An auspicious tale of family values and togetherness.', releaseContext: 'new_family' }
];
const mockTheatresDb = [
    { id: 't1', name: 'INOX: LEPL Centro', location: 'Vijayawada', isMultiplex: true, screens: [ { screenId: 't1s1', name: 'Screen 1', capacity: 100 }, { screenId: 't1s2', name: 'Screen 2', capacity: 80 } ]},
    { id: 't2', name: 'PVP Square Mall: PVR Cinemas', location: 'Vijayawada', isMultiplex: true, screens: [ { screenId: 't2s1', name: 'Audi 1', capacity: 120 }, { screenId: 't2s2', name: 'Audi 2', capacity: 90 }, { screenId: 't2s3', name: 'Audi 3 (LUXE)', capacity: 40 } ]},
    { id: 't3', name: 'Trendset Mall: Capital Cinemas', location: 'Vijayawada', isMultiplex: true, screens: [ { screenId: 't3s1', name: 'Screen A', capacity: 110 }, { screenId: 't3s2', name: 'Screen B', capacity: 70 } ]},
    { id: 't4', name: 'Annapurna Theatre A/C DTS', location: 'Vijayawada', isMultiplex: false, capacity: 200, isReReleaseCandidate: true },
    { id: 't5', name: 'Alankar Theatre A/C', location: 'Vijayawada', isMultiplex: false, capacity: 250, isReReleaseCandidate: true },
    { id: 't10', name: 'Raj Yuvraj Theatre', location: 'Vijayawada', isMultiplex: false, capacity: 180, isReReleaseCandidate: true },
    { id: 't6', name: 'Cinepolis: Mantra Mall', location: 'Guntur', isMultiplex: true, screens: [ { screenId: 't6s1', name: 'Audi X', capacity: 90 }, { screenId: 't6s2', name: 'Audi Y', capacity: 75 } ]},
    { id: 't7', name: 'Hollywood Theatre A/C DTS', location: 'Guntur', isMultiplex: false, capacity: 180 },
    { id: 't8', name: 'Krishna Mahal Deluxe A/C', location: 'Guntur', isMultiplex: false, capacity: 220 },
    { id: 't9', name: 'Naaz Theatre A/C DTS', location: 'Guntur', isMultiplex: false, capacity: 150 },
];
let screeningIdCounter = 1;
const mockScreeningsDb = [];
const mockScreeningSeatsDb = {};
function initializeMockScreenings() { /* ... same as before ... */
    if (mockScreeningsDb.length > 0) return;
    mockMoviesDb.forEach(movie => {
        mockTheatresDb.forEach(theatre => {
            let shouldShowMovie = false;
            let specificDatesForYamadonga = ['2024-05-17', '2024-05-18'];
            if (movie.releaseContext === 'rerelease_yamadonga') { if (theatre.location === 'Vijayawada' && theatre.isReReleaseCandidate && Math.random() < 0.7) { shouldShowMovie = true; }
            } else if (movie.releaseContext === 'upcoming_blockbuster') { shouldShowMovie = Math.random() < 0.9;
            } else if (['recent_thriller', 'recent_romcom', 'new_drama', 'new_scifi', 'new_family'].includes(movie.releaseContext)) { if (theatre.location === 'Vijayawada') shouldShowMovie = Math.random() < 0.75; else if (theatre.location === 'Guntur') shouldShowMovie = Math.random() < 0.65; }
            if (shouldShowMovie) {
                const datesToScreen = movie.releaseContext === 'rerelease_yamadonga' ? specificDatesForYamadonga : DATES_AVAILABLE;
                datesToScreen.forEach(date => {
                    if (!DATES_AVAILABLE.includes(date)) return;
                    if (movie.releaseContext !== 'rerelease_yamadonga' && Math.random() > 0.85) { return; }
                    if (theatre.isMultiplex) {
                        if (!theatre.screens || theatre.screens.length === 0) { console.warn(`Theatre "${theatre.name}" is multiplex but has no screens.`); return; }
                        theatre.screens.forEach(screen => {
                            if(!screen) { console.warn(`Undefined screen in theatre ${theatre.name}`); return; }
                            let screenAssignmentProb = 0.6;
                            if (movie.releaseContext === 'upcoming_blockbuster') screenAssignmentProb = 0.8; if (movie.releaseContext === 'rerelease_yamadonga') screenAssignmentProb = 0.5;
                            if (Math.random() < screenAssignmentProb) {
                                SHOW_TIMES_PER_DAY.forEach(time => {
                                    if (Math.random() > 0.2) {
                                        const screeningId = `scr-${screeningIdCounter++}`;
                                        mockScreeningsDb.push({ id: screeningId, movieId: movie.id, movieTitle: movie.title, posterUrl: movie.posterUrl, theatreId: theatre.id, theatreName: theatre.name, location: theatre.location, screenId: screen.screenId, screenName: screen.name, date: date, time: time, price: (screen.name && screen.name.toLowerCase().includes('luxe')) || (theatre.name && theatre.name.toLowerCase().includes('pvp')) ? 300 : (theatre.isMultiplex ? 220 : 160), capacity: screen.capacity });
                                        mockScreeningSeatsDb[screeningId] = Array.from({ length: screen.capacity || 50 }, (_, i) => ({ id: `${String.fromCharCode(65 + Math.floor(i / 10))}${(i % 10) + 1}`, status: 'available' }));
                                    }
                                });
                            }
                        });
                    } else { 
                        if(typeof theatre.capacity === 'undefined') { console.warn(`Single screen ${theatre.name} has no capacity.`); return;}
                        SHOW_TIMES_PER_DAY.forEach(time => {
                            if (movie.releaseContext === 'rerelease_yamadonga' && (time === '10:00 AM' || time === '10:30 PM') && Math.random() > 0.4) return;
                            if (Math.random() > 0.15) {
                                const screeningId = `scr-${screeningIdCounter++}`;
                                mockScreeningsDb.push({ id: screeningId, movieId: movie.id, movieTitle: movie.title, posterUrl: movie.posterUrl, theatreId: theatre.id, theatreName: theatre.name, location: theatre.location, screenId: null, screenName: 'Main Screen', date: date, time: time, price: 160, capacity: theatre.capacity });
                                mockScreeningSeatsDb[screeningId] = Array.from({ length: theatre.capacity || 100 }, (_, i) => ({ id: `${String.fromCharCode(65 + Math.floor(i / 20))}${(i % 20) + 1}`, status: 'available' }));
                            }
                        });
                    }
                });
            }
        });
    });
    console.log(`Generated ${mockScreeningsDb.length} screenings for the period.`);
}
initializeMockScreenings();
let mockBookingsDb_frontend_only = [];
let nextBookingId_frontend_only = 1;


export const apiService = {
  // AUTHENTICATION - NOW USES BACKEND
  registerUser: async (username, email, password, role = 'CUSTOMER') => {
    console.log("apiService: Calling REAL backend for registerUser");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role }),
      });
      const data = await response.json(); // Backend returns JwtResponse or ErrorResponse
      if (!response.ok) {
        // Attempt to parse backend's ErrorResponse structure
        const errorMessage = data.message || (data.errors ? Object.values(data.errors).join(', ') : 'Registration failed');
        throw new Error(errorMessage);
      }
      // Backend's AuthController returns JwtResponse on successful registration.
      // The RegisterPage component only needs a success message.
      // We don't log the user in automatically here based on current App.jsx flow.
      return { message: "Registration successful. Please log in." };
    } catch (error) {
      console.error("apiService.registerUser Error:", error);
      throw new Error(error.message || 'Registration failed due to a network or unexpected error.');
    }
  },

  loginUser: async (email, password) => {
    console.log("apiService: Calling REAL backend for loginUser");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json(); // Expects JwtResponse { token, user: UserResponse } or ErrorResponse
      if (!response.ok) {
        const errorMessage = data.message || (data.errors ? Object.values(data.errors).join(', ') : 'Login failed');
        throw new Error(errorMessage);
      }
      
      // Store token and user data (ensure key 'ticketUser' matches App.jsx)
      localStorage.setItem('token', data.token);
      localStorage.setItem('ticketUser', JSON.stringify(data.user)); // 'data.user' is UserResponse from backend
      console.log("apiService: Login successful, token and user stored.", data.user);
      return data; // Returns { token, user } which App.jsx will use via LoginPage
    } catch (error) {
      console.error("apiService.loginUser Error:", error);
      throw new Error(error.message || 'Login failed due to a network or unexpected error.');
    }
  },

  requestPasswordReset: async (email) => {
    console.log("apiService: Attempting REAL backend for requestPasswordReset");
    try {
        const response = await fetch(`${API_BASE_URL}/auth/request-password-reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await response.json(); // Expects { message: "..." } or ErrorResponse
        if (!response.ok) {
            const errorMessage = data.message || (data.errors ? Object.values(data.errors).join(', ') : 'Failed to request password reset');
            throw new Error(errorMessage);
        }
        return data; // Returns { message: "..." } from backend
    } catch (error) {
        // This catch block handles network errors or if backend doesn't respond as expected
        console.warn("apiService.requestPasswordReset: Backend call failed or error:", error.message);
        console.warn("apiService.requestPasswordReset: Falling back to frontend mock for forgot password.");
        // Fallback to frontend mock ONLY if the actual API call fails completely (network error, etc.)
        // OR if the backend endpoint for this isn't ready and returns a non-JSON error or 404.
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ message: "If an account with this email exists, a password reset simulation has been processed (frontend mock)." });
            }, FAKE_LATENCY);
        });
    }
  },

    // --- MOVIE & SCREENING DATA (Still Uses internal Mocks as per original design) ---
    getLocations: async () => new Promise(res => setTimeout(() => res(['Vijayawada', 'Guntur']), FAKE_LATENCY)),
    getMoviesByLocation: async (location) => { /* ... same as before ... */
        console.warn(`getMoviesByLocation for ${location}: USING FRONTEND MOCK DATA.`);
        return new Promise((resolve) => {
            setTimeout(() => {
                const movieIdsInLocation = new Set(mockScreeningsDb.filter(s => s.location === location).map(s => s.movieId));
                let movies = mockMoviesDb.filter(m => movieIdsInLocation.has(m.id));
                movies.sort((a,b) => { if (location === 'Vijayawada') { if (a.releaseContext === 'rerelease_yamadonga') return -1; if (b.releaseContext === 'rerelease_yamadonga') return 1; } if (a.releaseContext === 'upcoming_blockbuster') return -1; if (b.releaseContext === 'upcoming_blockbuster') return 1; const order = { 'recent_thriller': 2, 'recent_romcom': 3, 'new_drama': 4, 'new_scifi': 5, 'new_family': 6 }; return (order[a.releaseContext] || 99) - (order[b.releaseContext] || 99); });
                resolve([...movies]);
            }, FAKE_LATENCY);
        });
    },
    getMovieById: async (movieId) => { /* ... same as before ... */
        console.warn(`getMovieById for ${movieId}: USING FRONTEND MOCK DATA.`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const movie = mockMoviesDb.find(m => m.id === movieId);
                if (movie) resolve({ ...movie }); else reject({ message: "Movie not found (mock)." });
            }, FAKE_LATENCY);
        });
    },
    getAvailableDatesForMovieInLocation: async (movieId, location) => { /* ... same as before ... */
        console.warn(`getAvailableDates for ${movieId} in ${location}: USING FRONTEND MOCK DATA.`);
        return new Promise((resolve) => {
            setTimeout(() => {
                const dates = [...new Set(mockScreeningsDb.filter(s => s.movieId === movieId && s.location === location).map(s => s.date))].sort();
                resolve(dates);
            }, FAKE_LATENCY);
        });
    },
    getScreeningsByMovieLocationDate: async ({ movieId, location, date }) => { /* ... same as before ... */
        console.warn(`getScreenings for ${movieId}, ${location}, ${date}: USING FRONTEND MOCK DATA.`);
        return new Promise((resolve) => {
            setTimeout(() => {
                const filtered = mockScreeningsDb.filter(s => s.movieId === movieId && s.location === location && s.date === date);
                const groupedByTheatre = filtered.reduce((acc, screening) => { if (!acc[screening.theatreId]) { acc[screening.theatreId] = { theatreId: screening.theatreId, theatreName: screening.theatreName, shows: [] }; } acc[screening.theatreId].shows.push({ screeningId: screening.id, screenName: screening.screenName, time: screening.time, price: screening.price }); acc[screening.theatreId].shows.sort((a, b) => new Date('1970/01/01 ' + a.time) - new Date('1970/01/01 ' + b.time)); return acc; }, {});
                resolve(Object.values(groupedByTheatre));
            }, FAKE_LATENCY + 50);
        });
    },
    getScreeningDetails: async (screeningId) => { /* ... same as before ... */
        console.warn(`getScreeningDetails for ${screeningId}: USING FRONTEND MOCK DATA.`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const screening = mockScreeningsDb.find(s => s.id === screeningId);
                if (screening) resolve({ ...screening }); else reject({ message: "Screening not found (mock)." });
            }, FAKE_LATENCY);
        });
    },
    getSeatsForScreening: async (screeningId) => { /* ... same as before ... */
        console.warn(`getSeatsForScreening for ${screeningId}: USING FRONTEND MOCK DATA.`);
        return new Promise((resolve) => {
            setTimeout(() => { resolve(mockScreeningSeatsDb[screeningId] ? mockScreeningSeatsDb[screeningId].map(s => ({ ...s })) : []); }, FAKE_LATENCY);
        });
    },
    processDummyPaymentAndBookTickets: async (userId, screeningId, selectedSeatIds, totalPriceInRupees, paymentDetails, couponCode) => { /* ... same as before ... */
        console.log("API MOCK (Frontend): Processing DUMMY payment and booking tickets (Frontend Logic)...");
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (paymentDetails.method === "card" && paymentDetails.cardNumber && paymentDetails.cardNumber.endsWith("0000")) { reject({ message: "Dummy Payment Failed: Invalid card details provided." }); return; }
                if (paymentDetails.method === "upi" && paymentDetails.upiId === "fail@upi") { reject({ message: "Dummy Payment Failed: UPI transaction could not be processed." }); return; }
                if (couponCode && couponCode.toUpperCase() === "INVALID") { reject({ message: "Invalid coupon code used."}); return; }
                let finalPrice = totalPriceInRupees; if (couponCode) { if (couponCode.toUpperCase() === "SAVE10") { finalPrice *= 0.90; } else if (couponCode.toUpperCase() === "FLAT50" && finalPrice > 50) { finalPrice -= 50; } } finalPrice = Math.max(0, finalPrice);
                const screening = mockScreeningsDb.find(s => s.id === screeningId); if (!screening) { reject({ message: "Screening not found for booking (mock)." }); return; }
                let conflict = false; selectedSeatIds.forEach(seatId => { const seat = mockScreeningSeatsDb[screeningId]?.find(s => s.id === seatId); if (seat && seat.status === 'available') { seat.status = 'booked'; } else { conflict = true; } });
                if (conflict) { reject({ message: "Seat booking conflict during dummy processing (mock). Some seats were taken. Please try again." }); return; }
                const newBooking = { id: `B-DUMMY-${nextBookingId_frontend_only++}`, userId, screeningId, movieTitle: screening.movieTitle, theatreName: screening.theatreName, screenName: screening.screenName, date: screening.date, time: screening.time, seats: selectedSeatIds, totalAmount: finalPrice, bookingTime: new Date().toISOString(), ticket_codes: selectedSeatIds.map(sid => `TICKET-DUMMY-${screeningId.slice(4)}-${sid}-${Date.now().toString().slice(-4)}`), paymentInfo: { method: paymentDetails.method, transactionId: `DUMMY_TRANS_${Date.now()}`, coupon: couponCode || "None" } };
                mockBookingsDb_frontend_only.push(newBooking);
                resolve({ booking: newBooking, message: "Booking Successful! (Dummy Payment Processed - Frontend Mock)." });
            }, FAKE_LATENCY + 400);
        });
    },
    getUserBookings: async (userId) => { /* ... same as before ... */
        console.warn("getUserBookings is using frontend mock data. Ensure backend is implemented for real data.");
        return new Promise(res => {
            setTimeout(() => { const userBookings = mockBookingsDb_frontend_only.filter(b => b.userId === userId); res([...userBookings]); }, FAKE_LATENCY);
        });
    },
};