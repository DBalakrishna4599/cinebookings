// src/App.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from './apiService';
import './App.css';

// --- Utility Components --- (Same as before)
const LoadingSpinner = ({ text = "Loading..."}) => <div className="message info" style={{ textAlign: 'center', padding: '20px' }}>{text}</div>;
const ErrorMessage = ({ message }) => message ? <div className="message error">{message}</div> : null;
const SuccessMessage = ({ message }) => message ? <div className="message success">{message}</div> : null;

// --- Page/Feature Components ---
const Navbar = ({ currentUser, onNavigate, onLogout }) => { /* ... same as before ... */
    return (
        <nav className="navbar">
            <div className="navbar-brand" onClick={() => onNavigate('home')}>CineBookings ₹</div>
            <div className="navbar-links">
                <button onClick={() => onNavigate('home')}>Movies</button>
                {currentUser && <button onClick={() => onNavigate('myTickets')}>My Tickets</button>}
            </div>
            <div className="navbar-user">
                {currentUser ? ( <><span>Hi, {currentUser.username}!</span><button onClick={onLogout}>Logout</button></>
                ) : ( <><button onClick={() => onNavigate('login')}>Login</button><button onClick={() => onNavigate('register')}>Register</button></>)}
            </div>
        </nav>
    );
};

const LoginPage = ({ onLoginSuccess, onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [forgotPasswordMsg, setForgotPasswordMsg] = useState('');
    const [forgotPasswordError, setForgotPasswordError] = useState('');


    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setForgotPasswordMsg(''); setForgotPasswordError(''); setLoading(true);
        try {
            // Calls backend via apiService
            const responseData = await apiService.loginUser(email, password); // responseData is { token, user }
            onLoginSuccess(responseData.user); // Pass UserResponse DTO from backend
        } catch (err) {
            setError(err.message || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setForgotPasswordMsg('');
            setForgotPasswordError("Please enter your email address above first.");
            setError('');
            return;
        }
        setLoading(true); setError(''); setForgotPasswordMsg(''); setForgotPasswordError('');
        try {
            const response = await apiService.requestPasswordReset(email); // response is { message: "..." }
            setForgotPasswordMsg(response.message);
        } catch (err) {
            setForgotPasswordError(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Login</h2>
            <ErrorMessage message={error} />
            <SuccessMessage message={forgotPasswordMsg} />
            <ErrorMessage message={forgotPasswordError} /> {/* For forgot password errors */}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="login-email">Email Address:</label>
                    <input type="email" id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com"/>
                </div>
                <div className="form-group">
                    <label htmlFor="login-password">Password:</label>
                    <input type="password" id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"/>
                </div>
                <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '15px' }}>
                     <button type="button" onClick={handleForgotPassword} className="forgot-password-link" disabled={loading}>
                        {loading && forgotPasswordMsg /* only show loading text for this action */ ? 'Processing...' : 'Forgot Password?'}
                    </button>
                </div>
                <button type="submit" className="button" disabled={loading} style={{width: '100%'}}>
                    {loading && !forgotPasswordMsg && !forgotPasswordError ? 'Logging in...' : 'Login'} {/* Only show "Logging in..." for login action */}
                </button>
            </form>
            <p style={{textAlign: 'center', marginTop: '20px', fontSize: '0.9em'}}>
                New to CineBookings? <button className="button-secondary" onClick={() => onNavigate('register')} style={{marginLeft:'5px', padding: '6px 10px', fontSize: '0.9em'}}>Create Account</button>
            </p>
        </div>
    );
};

const RegisterPage = ({ onNavigate }) => {
    const [username, setUsername] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
    const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
        try {
            // Calls backend via apiService. Role 'CUSTOMER' is default in apiService.registerUser
            const response = await apiService.registerUser(username, email, password, 'CUSTOMER');
            // apiService.registerUser now returns { message: "..." } on success
            setSuccess(response.message); // Display the success message
            setTimeout(() => onNavigate('login'), 2500);
        } catch (err) {
            setError(err.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    return (<div className="form-container"><h2>Create Account</h2><ErrorMessage message={error} /><SuccessMessage message={success} /><form onSubmit={handleSubmit}><div className="form-group"><label htmlFor="reg-username">Username:</label><input type="text" id="reg-username" value={username} onChange={(e) => setUsername(e.target.value)} required /></div><div className="form-group"><label htmlFor="reg-email">Email Address:</label><input type="email" id="reg-email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div><div className="form-group"><label htmlFor="reg-password">Password:</label><input type="password" id="reg-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div><button type="submit" className="button" disabled={loading} style={{width:'100%'}}>{loading ? 'Creating Account...' : 'Register'}</button></form><p style={{textAlign: 'center', marginTop: '20px', fontSize:'0.9em'}}>Already have an account? <button className="button-secondary" onClick={() => onNavigate('login')} style={{marginLeft:'5px', padding: '6px 10px', fontSize: '0.9em'}}>Login Here</button></p></div>);
};

const HomePage = ({ onMovieSelect, onLocationChange, selectedLocation, locations }) => { /* ... same as before ... */
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => { if (!selectedLocation) { setMovies([]); return; } setLoading(true); setError(''); apiService.getMoviesByLocation(selectedLocation) .then(setMovies) .catch(err => setError("Failed to load movies: " + err.message)) .finally(() => setLoading(false)); }, [selectedLocation]);
    return ( <div> <div className="location-selector section-bg"> <label htmlFor="location-select">Select Your City:</label> <select id="location-select" value={selectedLocation} onChange={e => onLocationChange(e.target.value)}> <option value="" disabled>-- Select Location --</option> {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)} </select> </div> <ErrorMessage message={error} /> {loading && <LoadingSpinner />} {!selectedLocation && !loading && <div className="section-bg"><p style={{textAlign: 'center'}}>Please select a location to see available movies.</p></div>} {selectedLocation && !loading && movies.length === 0 && !error && ( <div className="section-bg"><p style={{textAlign: 'center'}}>No movies currently running in {selectedLocation}. Try another city!</p></div> )} <div className="movie-grid"> {movies.map(movie => ( <div key={movie.id} className="movie-card-home" onClick={() => onMovieSelect(movie.id)}> <img src={movie.posterUrl || 'https://via.placeholder.com/180x270.png?text=No+Poster'} alt={movie.title} /> <div className="movie-card-home-details"> <h3>{movie.title}</h3> <p>{movie.genre}</p> </div> </div> ))} </div> </div> );
};
const MovieShowtimesPage = ({ movieId, location, onSelectShowtime, onNavigate, initialSelectedDate }) => { /* ... same as before ... */
    const [movie, setMovie] = useState(null); const [availableDates, setAvailableDates] = useState([]); const [selectedDate, setSelectedDate] = useState(initialSelectedDate || ''); const [theatresWithScreenings, setTheatresWithScreenings] = useState([]); const [loadingMovie, setLoadingMovie] = useState(true); const [loadingDates, setLoadingDates] = useState(false); const [loadingScreenings, setLoadingScreenings] = useState(false); const [error, setError] = useState('');
    useEffect(() => { if (!movieId) { setError("Movie ID not provided."); setLoadingMovie(false); return; } setLoadingMovie(true); setError(''); apiService.getMovieById(movieId) .then(setMovie) .catch(err => setError("Failed to load movie details: " + err.message)) .finally(() => setLoadingMovie(false)); }, [movieId]);
    useEffect(() => { if (!movie || !location) return; setLoadingDates(true); apiService.getAvailableDatesForMovieInLocation(movie.id, location) .then(dates => { setAvailableDates(dates); if (dates.length > 0 && !selectedDate) { setSelectedDate(dates[0]); } else if (dates.length === 0) { setSelectedDate(''); } }) .catch(err => setError("Failed to load available dates: " + err.message)) .finally(() => setLoadingDates(false)); }, [movie, location, selectedDate]);
    useEffect(() => { if (!movie || !location || !selectedDate) { setTheatresWithScreenings([]); return; } setLoadingScreenings(true); apiService.getScreeningsByMovieLocationDate({ movieId: movie.id, location, date: selectedDate }) .then(setTheatresWithScreenings) .catch(err => setError("Failed to load showtimes: " + err.message)) .finally(() => setLoadingScreenings(false)); }, [movie, location, selectedDate]);
    const formatDateTab = (dateStr) => { const dateObj = new Date(dateStr + 'T00:00:00Z'); return { dayOfWeek: dateObj.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' }), dateNum: dateObj.toLocaleDateString('en-IN', { day: 'numeric', timeZone: 'UTC' }), month: dateObj.toLocaleDateString('en-IN', { month: 'short', timeZone: 'UTC' }), }; };
    if (loadingMovie) return <LoadingSpinner text="Loading Movie Details..."/>; if (error && !movie) return <div className="container section-bg"><ErrorMessage message={error} /><button onClick={() => onNavigate('home')} className="button-secondary">Go Home</button></div>; if (!movie) return <div className="container section-bg"><p>Movie details could not be loaded.</p><button onClick={() => onNavigate('home')} className="button-secondary">Go Home</button></div>;
    return ( <div className="section-bg"> <button onClick={() => onNavigate('home')} className="button-secondary" style={{ marginBottom: '20px' }}>← Change Movie / Location</button> <ErrorMessage message={error} /> <div className="movie-showtimes-container"> <div className="movie-showtimes-poster"> <img src={movie.posterUrl || 'https://via.placeholder.com/220x330.png?text=No+Poster'} alt={movie.title} /> </div> <div className="movie-showtimes-info"> <h1>{movie.title}</h1> <p><strong>Genre:</strong> {movie.genre} | <strong>Language:</strong> {movie.language} | <strong>Duration:</strong> {movie.duration}</p> <p>{movie.description}</p> <div className="date-selector-horizontal"> <h4>Select Date</h4> {loadingDates && <LoadingSpinner text="Loading Dates..." />} {!loadingDates && availableDates.length === 0 && <p>No dates available for this movie in {location}.</p>} <div className="date-tabs"> {availableDates.map(date => { const { dayOfWeek, dateNum, month } = formatDateTab(date); return ( <div key={date} className={`date-tab ${selectedDate === date ? 'selected' : ''}`} onClick={() => setSelectedDate(date)}> <span className="day-of-week">{dayOfWeek}</span> <span className="date-num">{dateNum}</span> <span className="month">{month}</span> </div> ); })} </div> </div> </div> </div> {selectedDate && ( <div className="theatre-screenings-list"> <h3>Showtimes for {new Date(selectedDate + 'T00:00:00Z').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })} in {location}</h3> {loadingScreenings && <LoadingSpinner text="Loading Showtimes..."/>} {!loadingScreenings && theatresWithScreenings.length === 0 && ( <p>No shows found for {movie?.title} on this date.</p> )} {theatresWithScreenings.map(theatre => ( <div key={theatre.theatreId} className="theatre-screenings"> <h3>{theatre.theatreName}</h3> <div className="show-times"> {theatre.shows.map(show => ( <button key={show.screeningId} className="show-time-button" onClick={() => onSelectShowtime(show.screeningId, selectedDate)} > {show.time} <span>{show.screenName} - ₹{show.price}</span> </button> ))} </div> </div> ))} </div> )} </div> );
};
const SeatSelectionPage = ({ screeningId, currentUser, onNavigate, onProceedToPayment }) => { /* ... same as before ... */
    const [screeningDetails, setScreeningDetails] = useState(null); const [seats, setSeats] = useState([]); const [selectedSeatIds, setSelectedSeatIds] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
    useEffect(() => { if (!screeningId) { setError("Screening ID missing."); setLoading(false); return; } setLoading(true); setError('');  Promise.all([apiService.getScreeningDetails(screeningId), apiService.getSeatsForScreening(screeningId)]) .then(([details, seatData]) => { setScreeningDetails(details); setSeats(seatData); }) .catch(err => setError("Failed to load data: " + err.message)) .finally(() => setLoading(false));  }, [screeningId]);
    const toggleSeatSelection = (seat) => { if (seat.status === 'booked') return; setSelectedSeatIds(prev => prev.includes(seat.id) ? prev.filter(sId => sId !== seat.id) : [...prev, seat.id]); };
    const handleProceed = () => { if (!currentUser) { setError("Please login to continue."); return; } if (selectedSeatIds.length === 0) { setError("Please select at least one seat."); return; } if (!screeningDetails || typeof screeningDetails.price === 'undefined') { setError("Screening/price info missing."); return; } onProceedToPayment(screeningId, selectedSeatIds, screeningDetails.price); };
    if (loading) return <LoadingSpinner text="Loading Seats..."/>; if (error) return <div className="container section-bg"><ErrorMessage message={error} /><button onClick={() => onNavigate('home')} className="button-secondary">Go Home</button></div>; if (!screeningDetails) return <div className="container section-bg"><p>Screening details missing.</p><button onClick={() => onNavigate('home')} className="button-secondary">Go Home</button></div>;
    return ( <div className="section-bg"> <button onClick={() => onNavigate('movieShowtimes', { movieId: screeningDetails.movieId, location: screeningDetails.location, initialSelectedDate: screeningDetails.date })} className="button-secondary" style={{ marginBottom: '20px' }}>← Change Show / Date</button> <h2>Seat Selection</h2><h3>{screeningDetails.movieTitle}</h3> <p>{screeningDetails.theatreName} - {screeningDetails.screenName}</p> <p>{new Date(screeningDetails.date + 'T00:00:00Z').toLocaleDateString('en-IN', {timeZone:'UTC'})} at {screeningDetails.time} | Price: ₹{screeningDetails.price}/seat</p> <div className="seat-selector"><h4>SCREEN THIS WAY</h4><div className="seat-grid">{seats.map(seat => (<div key={seat.id} className={`seat ${seat.status} ${selectedSeatIds.includes(seat.id) ? 'selected' : ''}`} onClick={() => toggleSeatSelection(seat)} title={seat.status}>{seat.id}</div>))}</div><div className="seat-info"><p><span className="seat available"></span> Available <span className="seat selected" style={{marginLeft:'10px'}}></span> Selected <span className="seat booked" style={{marginLeft:'10px'}}></span> Booked</p></div></div> {selectedSeatIds.length > 0 && (<div className="booking-summary"><h4 style={{marginBottom:'10px'}}>Selected Seats: {selectedSeatIds.join(', ')}</h4><p>Total Tickets: {selectedSeatIds.length}</p><p><strong>Total Price: ₹{(selectedSeatIds.length * screeningDetails.price).toFixed(2)}</strong></p></div>)} <ErrorMessage message={error} /> <button onClick={handleProceed} className="button" style={{ marginTop: '25px', width: '100%', padding: '15px', fontSize: '1.1em' }} disabled={selectedSeatIds.length === 0 || !currentUser || loading}> {currentUser ? (loading ? 'Loading...' : 'Proceed to Payment') : 'Login to Book Seats'} </button> {!currentUser && <p style={{color:'#ff7782', textAlign:'center', marginTop:'10px'}}>You must be logged in to book.</p>} </div> );
};
const PaymentPage = ({ screeningId, selectedSeatIds, ticketPrice, currentUser, onNavigate, onBookingSuccess }) => { /* ... same as before, but note currentUser.phone might be undefined ... */
    const [screeningDetails, setScreeningDetails] = useState(null); const [loadingScreening, setLoadingScreening] = useState(true); const [processingPayment, setProcessingPayment] = useState(false); const [paymentError, setPaymentError] = useState(''); const [paymentSuccess, setPaymentSuccess] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card'); const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' }); const [upiId, setUpiId] = useState(''); const [wallet, setWallet] = useState('PhonePe'); const [couponCode, setCouponCode] = useState('');
    const [userName, setUserName] = useState(currentUser?.username || ''); const [userEmail, setUserEmail] = useState(currentUser?.email || '');
    const [userPhone, setUserPhone] = useState(currentUser?.phone || ''); // This might be empty if not in backend UserResponse

    const totalPrice = selectedSeatIds && typeof ticketPrice === 'number' ? selectedSeatIds.length * ticketPrice : 0;
    useEffect(() => { if (currentUser) { setUserName(currentUser.username); setUserEmail(currentUser.email); setUserPhone(currentUser.phone || ''); } }, [currentUser]); // Will update if currentUser changes
    useEffect(() => { if (!screeningId) { setPaymentError("Screening ID missing for payment page."); setLoadingScreening(false); return; } setLoadingScreening(true); apiService.getScreeningDetails(screeningId) .then(details => { if (!details || typeof details.price !== 'number') { setPaymentError("Essential screening information is missing or invalid."); setScreeningDetails(null); } else { setScreeningDetails(details); } }) .catch(err => { setPaymentError("Could not load screening details: " + err.message); }) .finally(() => setLoadingScreening(false)); }, [screeningId]);
    const handleDummyPayment = async (e) => { e.preventDefault(); console.log("PaymentPage ACTION: handleDummyPayment called."); setPaymentError(''); setPaymentSuccess(''); if (!currentUser) { setPaymentError("Please login to complete payment."); return; } if (!screeningDetails || !selectedSeatIds || selectedSeatIds.length === 0 || typeof ticketPrice !== 'number' || totalPrice <= 0) { setPaymentError("Booking details are incomplete or invalid."); return; } if (!userName || !userEmail ) { setPaymentError("Please provide your Name and Email."); return; } if (paymentMethod === 'card' && (!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) { setPaymentError("Please fill all card details."); return; } if (paymentMethod === 'upi' && !upiId) { setPaymentError("Please enter your UPI ID."); return; } setProcessingPayment(true); console.log("PaymentPage ACTION: Starting DUMMY payment processing..."); const dummyPaymentData = { method: paymentMethod, userName, userEmail, userPhone, ...(paymentMethod === 'card' && { cardName: cardDetails.name, cardNumber: cardDetails.number, expiry: cardDetails.expiry, cvv: cardDetails.cvv }), ...(paymentMethod === 'upi' && { upiId }), ...(paymentMethod === 'wallet' && { walletProvider: wallet }), };
        try { const bookingResult = await apiService.processDummyPaymentAndBookTickets( currentUser.id, screeningId, selectedSeatIds, totalPrice, dummyPaymentData, couponCode ); setPaymentSuccess(bookingResult.message + " Redirecting to your tickets..."); onBookingSuccess(bookingResult.booking); setTimeout(() => onNavigate('myTickets'), 3000); } catch (err) { console.error("PaymentPage ACTION: Dummy payment/booking failed:", err); setPaymentError(err.message || "Dummy Payment or Booking Failed. Please try again."); } finally { setProcessingPayment(false); } };
    if (loadingScreening) return <LoadingSpinner text="Loading Payment Details..."/>; if (paymentSuccess && !processingPayment) { return (<div className="container section-bg"><SuccessMessage message={paymentSuccess} /><p>You will be redirected shortly.</p><button onClick={() => onNavigate('myTickets')} className="button">View My Tickets Now</button></div>); } if (!screeningDetails && paymentError && !loadingScreening) {  return (<div className="container section-bg"><ErrorMessage message={paymentError} /><p>Please try selecting the show again.</p><button onClick={() => onNavigate('home')} className="button-secondary" style={{ marginTop:'15px' }}>Go to Movies</button></div>); }
    let displayPrice = totalPrice; if (couponCode.toUpperCase() === "SAVE10") displayPrice *= 0.9; else if (couponCode.toUpperCase() === "FLAT50") displayPrice = Math.max(0, displayPrice - 50);
    return ( <div className="form-container payment-page"> <button onClick={() => onNavigate('seatSelection', { screeningId })} className="button-secondary" style={{ marginBottom: '20px' }}>← Change Seats / Go Back</button> <h2>Complete Your Booking (Dummy Payment)</h2> <ErrorMessage message={paymentError} /> <SuccessMessage message={paymentSuccess && processingPayment ? paymentSuccess : ''} /> {screeningDetails && selectedSeatIds && selectedSeatIds.length > 0 && typeof ticketPrice === 'number' ? ( <div className="order-summary-payment"> <h3>Order Summary</h3> <p><strong>Movie:</strong> {screeningDetails.movieTitle}</p> <p><strong>Theatre:</strong> {screeningDetails.theatreName} ({screeningDetails.screenName})</p> <p><strong>Show:</strong> {new Date(screeningDetails.date + 'T00:00:00Z').toLocaleDateString('en-IN', {timeZone:'UTC'})} at {screeningDetails.time}</p> <p><strong>Seats:</strong> {selectedSeatIds.join(', ')} ({selectedSeatIds.length} tickets)</p> <p><strong>Ticket Price:</strong> ₹{ticketPrice.toFixed(2)} each</p> {couponCode && <p><i>Coupon '{couponCode}' will be applied. (Est. final: ₹{displayPrice.toFixed(2)})</i></p>} <h3>Total Amount: ₹{totalPrice.toFixed(2)}</h3> </div> ) : ( !paymentError && <LoadingSpinner text="Loading order summary..." /> )} <form onSubmit={handleDummyPayment}> <h4>Your Contact Details</h4> <div className="form-group"><label htmlFor="payment-name">Name:</label><input type="text" id="payment-name" value={userName} onChange={e => setUserName(e.target.value)} required placeholder="Full Name"/></div> <div className="form-group"><label htmlFor="payment-email">Email:</label><input type="email" id="payment-email" value={userEmail} onChange={e => setUserEmail(e.target.value)} required placeholder="email@example.com"/></div> <div className="form-group"><label htmlFor="payment-phone">Phone (Optional):</label><input type="tel" id="payment-phone" value={userPhone} onChange={e => setUserPhone(e.target.value)} placeholder="10-digit mobile number"/></div> <h4>Select Payment Method</h4> <div className="form-group payment-options"> <label><input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /> Card</label> <label><input type="radio" name="paymentMethod" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} /> UPI</label> <label><input type="radio" name="paymentMethod" value="wallet" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} /> Wallet</label> </div> {paymentMethod === 'card' && ( <div className="payment-details-form section-bg" style={{padding: '15px', marginTop:'0', marginBottom:'15px'}}> <h5>Card Details (Dummy)</h5> <div className="form-group"><label htmlFor="cardName">Name on Card:</label><input type="text" id="cardName" value={cardDetails.name} onChange={e => setCardDetails({...cardDetails, name: e.target.value})} required /></div> <div className="form-group"><label htmlFor="cardNumber">Card Number (ends with 0000 to fail):</label><input type="text" id="cardNumber" placeholder="XXXX XXXX XXXX XXXX" value={cardDetails.number} onChange={e => setCardDetails({...cardDetails, number: e.target.value})} required /></div> <div style={{display: 'flex', gap: '10px'}}> <div className="form-group" style={{flex:1}}><label htmlFor="cardExpiry">Expiry (MM/YY):</label><input type="text" id="cardExpiry" placeholder="MM/YY" value={cardDetails.expiry} onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})} required /></div> <div className="form-group" style={{flex:1}}><label htmlFor="cardCVV">CVV:</label><input type="text" id="cardCVV" placeholder="XXX" value={cardDetails.cvv} onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})} required /></div> </div> </div> )}  {paymentMethod === 'upi' && ( <div className="payment-details-form section-bg" style={{padding: '15px', marginTop:'0', marginBottom:'15px'}}> <h5>UPI ID (Dummy)</h5> <div className="form-group"><label htmlFor="upiId">Enter UPI ID (include 'fail' or 'fail@upi' to simulate failure):</label><input type="text" id="upiId" placeholder="yourname@bankupi" value={upiId} onChange={e => setUpiId(e.target.value)} required /></div> </div> )} {paymentMethod === 'wallet' && ( <div className="payment-details-form section-bg" style={{padding: '15px', marginTop:'0', marginBottom:'15px'}}> <h5>Select Wallet (Dummy)</h5> <select className="form-group" value={wallet} onChange={e => setWallet(e.target.value)} style={{width: '100%', padding:'10px', background:'#2c2c2e', color:'#f5f5f7', border:'1px solid #444'}}> <option value="PhonePe">PhonePe</option> <option value="GooglePay">Google Pay</option> <option value="Paytm">Paytm</option> </select> <p style={{textAlign: 'center', marginTop: '10px', fontSize:'0.9em'}}>This is a dummy selection.</p> </div> )} <div className="coupon-section form-group" style={{display:'flex', gap:'10px', alignItems:'center'}}> <input type="text" placeholder="Coupon (SAVE10, FLAT50, INVALID)" value={couponCode} onChange={e => setCouponCode(e.target.value)} style={{flexGrow:1}}/> </div> {currentUser && screeningDetails && !paymentSuccess && (  <button type="submit" className="button-success" style={{ width: '100%', marginTop: '20px', padding: '15px', fontSize:'1.1em' }} disabled={processingPayment || !screeningDetails || totalPrice <= 0}> {processingPayment ? 'Processing Dummy Payment...' : `Pay ₹${totalPrice.toFixed(2)} (Dummy)`} </button> )} </form> {!currentUser && <p style={{color:'#ff7782', textAlign:'center', marginTop:'15px'}}>Please login to proceed.</p>} </div> );
};
const MyTicketsPage = ({ currentUser, onNavigate }) => { /* ... same as before ... */
    const [bookings, setBookings] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
    useEffect(() => { if (!currentUser) { setError("Please log in to view tickets."); setLoading(false); return; } setLoading(true); setError('');  apiService.getUserBookings(currentUser.id) .then(data => setBookings(data.sort((a,b) => new Date(b.bookingTime) - new Date(a.bookingTime)))) .catch(err => setError("Failed to load bookings: " + err.message)) .finally(() => setLoading(false));  }, [currentUser]);
    if (loading) return <LoadingSpinner text="Loading Your Tickets..."/>; if (!currentUser && error) return <ErrorMessage message={error} />; if (!currentUser) return <div className="container section-bg"><p>Please log in to see your tickets.</p><button onClick={() => onNavigate('login')} className="button">Login</button></div>; if (error) return <div className="container section-bg"><ErrorMessage message={error} /></div>;
    return (<div className="container"><h2>My Tickets & Bookings</h2>{bookings.length === 0 ? (<div className="section-bg"><p>You have no bookings yet. <button className="button-secondary" onClick={() => onNavigate('home')}>Find a Movie</button></p></div>) : (bookings.map(booking => (<div key={booking.id} className="ticket-list-item"><h3>{booking.movieTitle}</h3><div className="screening-details"><p><strong>Theatre:</strong> {booking.theatreName} ({booking.screenName})</p><p><strong>Show:</strong> {new Date(booking.date + 'T00:00:00Z').toLocaleDateString('en-IN', {timeZone:'UTC'})} at {booking.time}</p></div><p><strong>Booking ID:</strong> {booking.id}</p><p><strong>Booked on:</strong> {new Date(booking.bookingTime).toLocaleString('en-IN', {timeZone:'Asia/Kolkata'})}</p><p><strong>Seats:</strong> {booking.seats.join(', ')}</p><p><strong>Total Paid:</strong> ₹{booking.totalAmount.toFixed(2)}</p>{booking.paymentInfo && <p><small>Payment Method: {booking.paymentInfo.method} (Ref: {booking.paymentInfo.transactionId || 'N/A'})</small></p>}<div className="ticket-codes"><strong>Your Ticket Codes:</strong><ul>{booking.ticket_codes.map(code => <li key={code}>{code}</li>)}</ul></div></div>)))}</div>);
};

function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [pageParams, setPageParams] = useState({});
    // currentUser will now be the UserResponse DTO from backend: { id, username, email, role, createdAt }
    // Note: 'phone' field is not in the backend's UserResponse currently.
    const [currentUser, setCurrentUser] = useState(null); 
    const [appMessage, setAppMessage] = useState({ text: '', type: '' });
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');

    useEffect(() => {
        apiService.getLocations().then(locs => {
            setLocations(locs);
            const storedLocation = localStorage.getItem('selectedLocation');
            if (storedLocation && locs.includes(storedLocation)) {
                setSelectedLocation(storedLocation);
            } else if (locs.length > 0) {
                setSelectedLocation(locs[0]);
                localStorage.setItem('selectedLocation', locs[0]);
            }
        });
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('ticketUser'); // Key matches apiService
        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setCurrentUser(parsedUser); // parsedUser is UserResponse from backend
                console.log("App Loaded: Found stored token and user.", parsedUser);
            } catch (e) {
                console.error("App Loaded: Error parsing stored user.", e);
                localStorage.removeItem('token');
                localStorage.removeItem('ticketUser');
            }
        }
    }, []);

    const handleLocationChange = (location) => { /* ... same as before ... */
        setSelectedLocation(location); localStorage.setItem('selectedLocation', location); if (currentPage !== 'home') handleNavigate('home');
    };
    const handleNavigate = (page, params = {}) => { /* ... same as before ... */
        setAppMessage({ text: '', type: '' }); setCurrentPage(page); if (page === 'movieShowtimes' && params.initialSelectedDate) { setPageParams(prevParams => ({ ...prevParams, ...params })); } else { setPageParams(params); } window.scrollTo(0,0);
    };
    
    // userDataFromBackend is UserResponse DTO: { id, username, email, role, createdAt }
    const handleLoginSuccess = (userDataFromBackend) => { 
        setCurrentUser(userDataFromBackend);
        // localStorage for 'ticketUser' is already set by apiService.loginUser
        setAppMessage({ text: 'Login successful! Welcome.', type: 'success' });
        const redirectParams = (pageParams.fromPage === 'payment' || pageParams.fromPage === 'seatSelection' || pageParams.fromPage === 'movieShowtimes') ? pageParams.fromParams : {};
        const redirectTo = pageParams.fromPage || 'home';
        if (redirectTo === 'movieShowtimes' && pageParams.fromParams && pageParams.fromParams.initialSelectedDate) {
            redirectParams.initialSelectedDate = pageParams.fromParams.initialSelectedDate;
        }
        handleNavigate(redirectTo, redirectParams);
    };

    const handleLogout = () => { /* ... same as before ... */
        setCurrentUser(null); localStorage.removeItem('token'); localStorage.removeItem('ticketUser'); setAppMessage({ text: 'You have been logged out.', type: 'success' }); handleNavigate('login');
    };
    const handleMovieSelect = (movieId) => { /* ... same as before ... */
        handleNavigate('movieShowtimes', { movieId, location: selectedLocation });
    };
    const handleSelectShowtime = (screeningId, currentSelectedDateFromShowtimesPage) => { /* ... same as before, using currentSelectedDateFromShowtimesPage ... */
        if (!currentUser) { setAppMessage({text: "Please login to select seats.", type: "error"}); const redirectLoginParams = { ...pageParams, initialSelectedDate: currentSelectedDateFromShowtimesPage }; handleNavigate('login', {fromPage: 'movieShowtimes', fromParams: redirectLoginParams }); return; } handleNavigate('seatSelection', { screeningId });
    };
    const handleProceedToPayment = (screeningId, selectedSeatIds, ticketPrice) => { /* ... same as before ... */
         if (!currentUser) { setAppMessage({text: "Login required for payment.", type: "error"}); handleNavigate('login', {fromPage: 'seatSelection', fromParams: pageParams}); return; } handleNavigate('payment', { screeningId, selectedSeatIds, ticketPrice });
    };
    const handleBookingSuccess = (bookingDetails) => { /* ... same as before ... */
        console.log("App: Booking successful notification received", bookingDetails);
    };

    const renderPage = () => { /* ... same as before, ensure commonNavParams handles initialSelectedDate correctly ... */
        const commonNavParams = { ...pageParams }; if (currentPage === 'movieShowtimes' && pageParams.initialSelectedDate) { commonNavParams.initialSelectedDate = pageParams.initialSelectedDate; }
        switch (currentPage) {
            case 'login': return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
            case 'register': return <RegisterPage onNavigate={handleNavigate} />;
            case 'movieShowtimes': return <MovieShowtimesPage {...commonNavParams} location={selectedLocation} onSelectShowtime={handleSelectShowtime} onNavigate={handleNavigate} />;
            case 'seatSelection': return <SeatSelectionPage {...commonNavParams} currentUser={currentUser} onNavigate={handleNavigate} onProceedToPayment={handleProceedToPayment} />;
            case 'payment': return <PaymentPage {...commonNavParams} currentUser={currentUser} onNavigate={handleNavigate} onBookingSuccess={handleBookingSuccess} />;
            case 'myTickets': return <MyTicketsPage currentUser={currentUser} onNavigate={handleNavigate} />;
            case 'home': default: return <HomePage onMovieSelect={handleMovieSelect} onLocationChange={handleLocationChange} selectedLocation={selectedLocation} locations={locations} />;
        }
    };

    return (
        <>
            <Navbar currentUser={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />
            <div className="container">
                <SuccessMessage message={appMessage.type === 'success' ? appMessage.text : ''} />
                <ErrorMessage message={appMessage.type === 'error' ? appMessage.text : ''} />
                {renderPage()}
            </div>
        </>
    );
}

export default App;