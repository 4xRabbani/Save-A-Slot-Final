import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { auth, db } from "../../../firebase/firebase";
import { Dropdown } from 'react-bootstrap';
import { Search, ChevronDown, ChevronUp, Calendar, Clock, MapPin, LogOut, Edit, Settings } from "lucide-react";
import {
    getDoc,
    getDocs,
    doc,
    where,
    collection,
    query,
    updateDoc,
} from "firebase/firestore";
import WeatherWidget from './WeatherWidget';
import { Button } from "react-bootstrap";
import { signOut } from "firebase/auth";
import "./userInfo.css"
import Papa from 'papaparse';

const UserInfo = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [carDetails, setCarDetails] = useState(null);
    const [currentResDetails, setCurrentResDetails] = useState([]);
    const [pastResDetails, setPastResDetails] = useState([]);
    const [archivedResDetails, setArchivedResDetails] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterOption, setFilterOption] = useState("all");
    const [isArchiveExpanded, setIsArchiveExpanded] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingVehicle, setIsEditingVehicle] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [yearData, setYearData] = useState(null);
    const currentYear = new Date().getFullYear();
    const years = Array.from(new Array(currentYear - 1991), (val, index) => currentYear - index);

    const [editedProfile, setEditedProfile] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });

    const [editedVehicle, setEditedVehicle] = useState({
        carMake: '',
        carModel: '',
        carYear: ''
    });

    // Format date for display
    const formatDate = useCallback((dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error(`Error formatting date: ${dateString}`, error);
            return 'Invalid date';
        }
    }, []);

    // Format date for search functionality
    const formatDateForSearch = useCallback((dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }).toLowerCase();
        } catch (error) {
            console.error(`Error formatting date for search: ${dateString}`, error);
            return '';
        }
    }, []);

    // Filter reservations based on search term
    const filterReservations = useCallback((reservations) => {
        if (!searchTerm.trim()) return reservations;

        const searchLower = searchTerm.toLowerCase();

        const isDateMatch = (dateStr) => {
            const formattedDate = formatDateForSearch(dateStr);
            const searchDate = searchLower.replace(/[/.-]/g, '');

            return (
                formattedDate.includes(searchLower) ||
                dateStr.toLowerCase().includes(searchLower) ||
                formattedDate.replace(/[/.-]/g, '').includes(searchDate)
            );
        };

        const isSlotMatch = (slotInfo) => {
            const slotLower = slotInfo.toLowerCase();
            return (
                slotLower.includes(searchLower) ||
                slotLower.replace(/[- ]/g, '').includes(searchLower.replace(/[- ]/g, ''))
            );
        };

        return reservations.filter(reservation => (
            reservation.parkingLot.toLowerCase().includes(searchLower) ||
            isSlotMatch(reservation.slotID) ||
            isDateMatch(reservation.reservationStartTime) ||
            isDateMatch(reservation.reservationEndTime) ||
            formatDate(reservation.reservationStartTime).toLowerCase().includes(searchLower) ||
            formatDate(reservation.reservationEndTime).toLowerCase().includes(searchLower)
        ));
    }, [searchTerm, formatDate, formatDateForSearch]);

    // Categorize reservations into current, past, and archived
    const categorizeReservations = useCallback((reservations) => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const categorized = reservations.reduce((acc, reservation) => {
            const endTime = new Date(reservation.reservationEndTime);

            if (endTime > now) {
                acc.current.push(reservation);
            } else if (endTime > weekAgo) {
                acc.past.push(reservation);
            } else {
                acc.archived.push(reservation);
            }
            return acc;
        }, { current: [], past: [], archived: [] });

        // Sort all categories
        const sortByDate = (a, b) => new Date(a.reservationStartTime) - new Date(b.reservationStartTime);
        categorized.current.sort(sortByDate);
        categorized.past.sort((a, b) => new Date(b.reservationEndTime) - new Date(a.reservationEndTime));
        categorized.archived.sort((a, b) => new Date(b.reservationEndTime) - new Date(a.reservationEndTime));

        setCurrentResDetails(categorized.current);
        setPastResDetails(categorized.past);
        setArchivedResDetails(categorized.archived);
    }, []);

    // Fetch user details and related data
    const fetchUserDetails = async (user) => {
        try {
            const userDocRef = doc(db, "Users", user.uid);

            // Use Promise.all to fetch data concurrently
            const [userDoc, vehiclesSnapshot, reservationsSnapshot] = await Promise.all([
                getDoc(userDocRef),
                getDocs(query(collection(db, "Vehicles"), where("userRef", "==", userDocRef))),
                getDocs(query(collection(db, "Reservations"), where("userRef", "==", userDocRef)))
            ]);

            if (userDoc.exists()) {
                setUserDetails(userDoc.data());
            }

            if (!vehiclesSnapshot.empty) {
                setCarDetails(vehiclesSnapshot.docs[0].data());
            }

            if (!reservationsSnapshot.empty) {
                const allReservations = reservationsSnapshot.docs.map(doc => doc.data());
                categorizeReservations(allReservations);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            // Add appropriate error handling/user feedback here
        }
    };

    // Format reservation date and time
    const formatReservationDateTime = useCallback((dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
            }
            const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' });
            const time = date.toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            return `${dayOfWeek} ${time}`;
        } catch (error) {
            console.error(`Error formatting reservation datetime: ${dateString}`, error);
            return 'Invalid date';
        }
    }, []);

    // Get active reservation details
    const getActiveReservation = useCallback(() => {
        if (!currentResDetails.length) return null;

        const now = new Date();
        const activeRes = currentResDetails.find(res => {
            const startTime = new Date(res.reservationStartTime);
            const endTime = new Date(res.reservationEndTime);
            return startTime <= now && endTime >= now;
        });

        if (activeRes) {
            return {
                startTime: formatReservationDateTime(activeRes.reservationStartTime),
                endTime: formatReservationDateTime(activeRes.reservationEndTime),
                location: activeRes.parkingLot,
                slot: activeRes.slotID
            };
        }

        // If no active reservation, return the next upcoming one
        const nextRes = currentResDetails[0];
        if (nextRes) {
            return {
                startTime: formatReservationDateTime(nextRes.reservationStartTime),
                endTime: formatReservationDateTime(nextRes.reservationEndTime),
                location: nextRes.parkingLot,
                slot: nextRes.slotID,
                isUpcoming: true
            };
        }

        return null;
    }, [currentResDetails, formatReservationDateTime]);

    // Handle profile editing
    const handleEditProfile = () => {
        setEditedProfile({
            firstName: userDetails?.firstName || '',
            lastName: userDetails?.lastName || '',
            email: userDetails?.email || ''
        });
        setIsEditingProfile(true);
    };

    // Handle vehicle editing
    const handleEditVehicle = () => {
        setEditedVehicle({
            carMake: carDetails?.carMake || '',
            carModel: carDetails?.carModel || '',
            carYear: carDetails?.carYear || ''
        });
        setIsEditingVehicle(true);
    };

    // Save profile changes
    const handleSaveProfile = async () => {
        try {
            if (!auth.currentUser) {
                throw new Error('No authenticated user');
            }

            const userRef = doc(db, "Users", auth.currentUser.uid);
            await updateDoc(userRef, editedProfile);

            setUserDetails(prev => ({...prev, ...editedProfile}));
            setIsEditingProfile(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            // Add appropriate error feedback to user here
        }
    };

    // Save vehicle changes
    const handleSaveVehicle = async () => {
        try {
            const vehicleQuery = query(
                collection(db, "Vehicles"),
                where("userRef", "==", doc(db, "Users", auth.currentUser.uid))
            );
            const vehicleSnapshot = await getDocs(vehicleQuery);

            if (!vehicleSnapshot.empty) {
                const vehicleDoc = vehicleSnapshot.docs[0];
                await updateDoc(doc(db, "Vehicles", vehicleDoc.id), {
                    carMake: editedVehicle.carMake,
                    carModel: editedVehicle.carModel,
                    carYear: editedVehicle.carYear
                });
                setCarDetails(prev => ({...prev, ...editedVehicle}));
                toast.success("Vehicle information updated successfully");
            }
            setIsEditingVehicle(false);
        } catch (error) {
            console.error("Error updating vehicle: ", error);
            toast.error("Failed to update vehicle information");
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Error signing out:", error);
            // Add appropriate error feedback to user here
        }
    };

    // Handle reservation click
    const handleReservationClick = () => {
        const reservationsSection = document.getElementById('reservations-section');
        if (reservationsSection) {
            reservationsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Set up auth listener and cleanup
    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    await fetchUserDetails(user);
                } catch (error) {
                    console.error("Error fetching user details:", error);
                    // Add appropriate error handling/user feedback here
                }
            } else {
                navigate('/');
            }
        });

        return () => unsubscribeAuth();
    }, [navigate]);

    // Handle clicks outside dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeReservation = getActiveReservation();

    const fetchCSV = async (filepath) => {
        try {
            const response = await fetch(filepath);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${filepath}`);
            }
            const text = await response.text();

            return new Promise((resolve, reject) => {
                Papa.parse(text, {
                    header: true,
                    complete: (results) => {
                        resolve(results.data.filter(row => row.make && row.model));
                    },
                    error: (error) => {
                        reject(error);
                    }
                });
            });
        } catch (error) {
            throw new Error(`Error fetching CSV: ${error.message}`);
        }
    };

// Add these useEffects for handling year and make changes
    useEffect(() => {
        const fetchYearData = async () => {
            if (!editedVehicle.carYear) {
                setMakes([]);
                setModels([]);
                setYearData(null);
                return;
            }

            setLoading(true);
            try {
                const data = await fetchCSV(`/vehicles/${editedVehicle.carYear}.csv`);
                setYearData(data);

                const uniqueMakes = [...new Set(data.map(row => row.make))]
                    .filter(make => make)
                    .sort()
                    .map((make, index) => ({
                        Make_ID: index + 1,
                        Make_Name: make
                    }));

                setMakes(uniqueMakes);
                if (!editedVehicle.carMake) {
                    setEditedVehicle(prev => ({ ...prev, carModel: '' }));
                }
            } catch (error) {
                console.error('Error fetching year data:', error);
                toast.error(`Error loading data for year ${editedVehicle.carYear}`);
                setYearData(null);
                setMakes([]);
                setModels([]);
            }
            setLoading(false);
        };

        fetchYearData();
    }, [editedVehicle.carYear]);

    useEffect(() => {
        if (!editedVehicle.carMake || !yearData) {
            setModels([]);
            return;
        }

        const filteredModels = yearData
            .filter(row => row.make === editedVehicle.carMake)
            .map((row, index) => ({
                Model_ID: index + 1,
                Model_Name: row.model
            }))
            .filter((model, index, self) =>
                index === self.findIndex(m => m.Model_Name === model.Model_Name)
            )
            .sort((a, b) => a.Model_Name.localeCompare(b.Model_Name));

        setModels(filteredModels);
        if (!models.find(m => m.Model_Name === editedVehicle.carModel)) {
            setEditedVehicle(prev => ({ ...prev, carModel: '' }));
        }
    }, [editedVehicle.carMake, yearData]);



    return (
        <div className="container py-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 my-2">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold">
                        Welcome, {userDetails?.firstName}!
                    </h1>

                    <Dropdown show={showDropdown} onToggle={setShowDropdown} ref={dropdownRef}>
                        <Dropdown.Toggle
                            variant="link"
                            id="account-dropdown"
                            className="p-0 text-secondary opacity-60"
                            style={{
                                border: 'none',
                                boxShadow: 'none',
                                background: 'transparent',
                                marginTop: '-10px',
                                color: '#6c757d'
                            }}
                        >
                            <Settings size={24} />
                        </Dropdown.Toggle>

                        <Dropdown.Menu
                            style={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #2d3748',
                                borderRadius: '0.5rem',
                                minWidth: '200px',
                                marginTop: '0.5rem'
                            }}
                        >
                            <Dropdown.Item
                                onClick={handleEditProfile}
                                className="text-white d-flex align-items-center gap-2 py-2 px-3"
                                style={{ backgroundColor: 'transparent', transition: 'background-color 0.2s' }}
                                onMouseEnter={e => e.target.style.backgroundColor = '#2d3748'}
                                onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                            >
                                <i className="bi bi-person-circle"></i>
                                Edit Profile
                            </Dropdown.Item>

                            <Dropdown.Item
                                onClick={handleEditVehicle}
                                className="text-white d-flex align-items-center gap-2 py-2 px-3"
                                style={{ backgroundColor: 'transparent', transition: 'background-color 0.2s' }}
                                onMouseEnter={e => e.target.style.backgroundColor = '#2d3748'}
                                onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                            >
                                <i className="bi bi-car-front"></i>
                                Edit Vehicle
                            </Dropdown.Item>

                            <Dropdown.Divider style={{ borderColor: '#2d3748' }} />

                            <Dropdown.Item
                                onClick={handleLogout}
                                className="text-danger d-flex align-items-center gap-2 py-2 px-3"
                                style={{ backgroundColor: 'transparent', transition: 'background-color 0.2s' }}
                                onMouseEnter={e => e.target.style.backgroundColor = '#2d3748'}
                                onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                            >
                                <i className="bi bi-box-arrow-right"></i>
                                Logout
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>

                {activeReservation ? (
                    <Button
                        variant="outline"
                        onClick={handleReservationClick}
                        className="bg-slate-700 text-white hover:bg-slate-600 px-4 sm:px-6 py-2 rounded-full relative w-full sm:w-auto border-0"
                    >
                        <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mt-[1px]"/>
                            <span className="text-sm sm:text-base whitespace-nowrap">
                                Active : {activeReservation.startTime} - {activeReservation.slot}
                            </span>
                        </div>
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        className="bg-slate-800 text-white hover:bg-slate-700 rounded-full px-6 sm:px-8 py-3 text-sm sm:text-base w-full sm:w-auto border-0"
                    >
                        No Active Reservations
                    </Button>
                )}
            </div>

            {/* Modal for editing profile */}
            {isEditingProfile && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ backgroundColor: '#1e293b' }}>
                            <div className="modal-header border-0">
                                <h5 className="modal-title text-white">Edit Profile</h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    aria-label="Close"
                                    onClick={() => setIsEditingProfile(false)}
                                />
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="form-group mb-3">
                                        <label className="text-white mb-2">First Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editedProfile.firstName}
                                            onChange={(e) => setEditedProfile(prev => ({...prev, firstName: e.target.value}))}
                                            style={{
                                                backgroundColor: '#2d3748',
                                                border: '1px solid #4b5563',
                                                color: 'white'
                                            }}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="text-white mb-2">Last Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editedProfile.lastName}
                                            onChange={(e) => setEditedProfile(prev => ({...prev, lastName: e.target.value}))}
                                            style={{
                                                backgroundColor: '#2d3748',
                                                border: '1px solid #4b5563',
                                                color: 'white'
                                            }}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="text-white mb-2">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={editedProfile.email}
                                            disabled
                                            style={{
                                                backgroundColor: '#1f2937',
                                                border: '1px solid #4b5563',
                                                color: '#9ca3af',
                                                cursor: 'not-allowed'
                                            }}
                                        />
                                        <small className="text-muted">Email cannot be changed</small>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer border-0">
                                <button
                                    type="button"
                                    className="btn btn-secondary px-4"
                                    onClick={() => setIsEditingProfile(false)}
                                    style={{
                                        backgroundColor: '#4b5563',
                                        border: 'none'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary px-4"
                                    onClick={handleSaveProfile}
                                    style={{
                                        backgroundColor: '#3b82f6',
                                        border: 'none'
                                    }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for editing vehicle */}
            {isEditingVehicle && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ backgroundColor: '#1e293b' }}>
                            <div className="modal-header border-0">
                                <h5 className="modal-title text-white">Edit Vehicle</h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    aria-label="Close"
                                    onClick={() => setIsEditingVehicle(false)}
                                />
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="form-group mb-3">
                                        <label className="text-white mb-2">Year</label>
                                        <select
                                            className="form-control"
                                            value={editedVehicle.carYear}
                                            onChange={(e) => setEditedVehicle(prev => ({
                                                ...prev,
                                                carYear: e.target.value,
                                                carMake: '',
                                                carModel: ''
                                            }))}
                                            style={{
                                                backgroundColor: '#2d3748',
                                                border: '1px solid #4b5563',
                                                color: 'white'
                                            }}
                                        >
                                            <option value="">Select Year</option>
                                            {years.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="text-white mb-2">Make</label>
                                        <select
                                            className="form-control"
                                            value={editedVehicle.carMake}
                                            onChange={(e) => setEditedVehicle(prev => ({
                                                ...prev,
                                                carMake: e.target.value,
                                                carModel: ''
                                            }))}
                                            disabled={!editedVehicle.carYear}
                                            style={{
                                                backgroundColor: '#2d3748',
                                                border: '1px solid #4b5563',
                                                color: 'white'
                                            }}
                                        >
                                            <option value="">Select Make</option>
                                            {makes.map(make => (
                                                <option key={make.Make_ID} value={make.Make_Name}>
                                                    {make.Make_Name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="text-white mb-2">Model</label>
                                        <select
                                            className="form-control"
                                            value={editedVehicle.carModel}
                                            onChange={(e) => setEditedVehicle(prev => ({
                                                ...prev,
                                                carModel: e.target.value
                                            }))}
                                            disabled={!editedVehicle.carMake}
                                            style={{
                                                backgroundColor: '#2d3748',
                                                border: '1px solid #4b5563',
                                                color: 'white'
                                            }}
                                        >
                                            <option value="">Select Model</option>
                                            {models.map(model => (
                                                <option key={model.Model_ID} value={model.Model_Name}>
                                                    {model.Model_Name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer border-0">
                                <button
                                    type="button"
                                    className="btn btn-secondary px-4"
                                    onClick={() => setIsEditingVehicle(false)}
                                    style={{
                                        backgroundColor: '#4b5563',
                                        border: 'none'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary px-4"
                                    onClick={handleSaveVehicle}
                                    disabled={!editedVehicle.carYear || !editedVehicle.carMake || !editedVehicle.carModel}
                                    style={{
                                        backgroundColor: '#3b82f6',
                                        border: 'none'
                                    }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Shared Card Container */}
            <div style={{
                padding: '1.5rem',
                backgroundColor: '#1e293b',
                borderRadius: '0.5rem',
                color: 'white',
                width: '100%',
                marginBottom: '1rem'
            }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: User & Vehicle Info */}
                    <div>
                        <div className="mb-6">
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <u><i className="bi bi-person-circle me-2"></i>
                                    Personal Information</u>
                            </h3>
                            <div style={{marginLeft: '1.75rem'}}>
                                <p>First Name: {userDetails?.firstName}</p>
                                <p>Last Name: {userDetails?.lastName}</p>
                                <p>Email Address: {userDetails?.email}</p>
                            </div>
                        </div>

                        <div>
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <u><i className="bi bi-car-front me-2"></i>
                                    Your Vehicle</u>
                            </h3>
                            <div style={{marginLeft: '1.75rem'}}>
                                <p>Make: {carDetails?.carMake || "Not specified"}</p>
                                <p>Model: {carDetails?.carModel || "Not specified"}</p>
                                <p>Year: {carDetails?.carYear || "Not specified"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Weather Widget */}
                    <div>
                        <WeatherWidget/>
                    </div>
                </div>
            </div>

            {/* Reservation Button */}
            <Link to="/dashboard/time" className="block mb-6">
                <button style={{
                    width: '100%',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <i className="bi bi-car-front me-2"></i>
                    Make a Reservation
                </button>
            </Link>

            {/* Reservations Section */}
            <div id="reservations-section" className="container p-4"
                 style={{backgroundColor: '#1B2641', borderRadius: '12px'}}>
                {/* Search and Filter */}
                <div className="d-flex align-items-center gap-3 pb-4"
                     style={{backgroundColor: '#1B2641', padding: '20px'}}>
                    <i className="bi bi-search"
                       style={{
                           color: '#6B7280',
                           fontSize: '20px',
                           marginRight: '-40px',
                           zIndex: '1'
                       }}
                    ></i>
                    <input
                        type="text"
                        placeholder="Search by date, slot, or location"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            flex: '1',
                            minWidth: '150px',
                            padding: '12px 20px 12px 50px',
                            fontSize: '16px',
                            backgroundColor: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#6B7280'
                        }}
                    />
                    <select
                        value={filterOption}
                        onChange={(e) => setFilterOption(e.target.value)}
                        style={{
                            maxWidth: '200px',
                            padding: '12px 40px 12px 20px',
                            fontSize: '16px',
                            backgroundColor: 'rgba(44, 52, 68, 0.8)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 15px center',
                            backgroundSize: '16px'
                        }}
                    >
                        <option value="all">All Reservations</option>
                        <option value="current">Current Only</option>
                        <option value="past">Past Only</option>
                    </select>
                </div>

                {/* Reservations Title */}
                <div className="d-flex align-items-center mb-4">
                    <i className="bi bi-calendar-check me-2 text-white"></i>
                    <u style={{color: "white"}}><h2 className="text-white m-0">Your Reservations</h2></u>
                </div>

                {/* Current Reservations */}
                {filterOption !== 'past' && (
                    <div className="mb-4">
                        <h3 className="text-white mb-3">Current & Upcoming Reservations:</h3>
                        {filterReservations(currentResDetails).length > 0 ? (
                            filterReservations(currentResDetails).map((reservation, index) => (
                                <div key={index}
                                     className="mb-3 p-4"
                                     style={{backgroundColor: '#0077FF', borderRadius: '8px', color: 'white'}}>
                                    {/*<h4>Reservation {index + 1}</h4>*/}
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <h4><i className="bi bi-clock me-2"></i>
                                                Start: {formatDate(reservation.reservationStartTime)}</h4>
                                        </div>
                                        <div className="col-md-6">
                                            <i className="bi bi-clock-fill me-2"></i>
                                            End: {formatDate(reservation.reservationEndTime)}
                                        </div>
                                        <div className="col-md-6">
                                            <i className="bi bi-geo-alt me-2"></i>
                                            Location: {reservation.parkingLot || "Not specified"}
                                        </div>
                                        <div className="col-md-6">
                                            <i className="bi bi-p-square me-2"></i>
                                            Slot: {reservation.slotID || "Not specified"}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-white opacity-30">
                                {searchTerm ? "No matching current reservations found." : "No current reservations found."}
                            </p>
                        )}
                    </div>
                )}

                {/* Past Reservations */}
                {filterOption !== 'current' && (
                    <div className="mb-4">
                        <h3 className="text-white mb-3">Past Reservations:</h3>
                        {filterReservations(pastResDetails).length > 0 ? (
                            filterReservations(pastResDetails).map((reservation, index) => (
                                <div key={index}
                                     className="mb-3 p-4"
                                     style={{backgroundColor: '#4a5568', borderRadius: '8px', color: 'white'}}>
                                    {/*<h4>Reservation {index + 1}</h4>*/}
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <i className="bi bi-clock me-2"></i>
                                            Start: {formatDate(reservation.reservationStartTime)}
                                        </div>
                                        <div className="col-md-6">
                                            <i className="bi bi-clock-fill me-2"></i>
                                            End: {formatDate(reservation.reservationEndTime)}
                                        </div>
                                        <div className="col-md-6">
                                            <i className="bi bi-geo-alt me-2"></i>
                                            Location: {reservation.parkingLot || "Not specified"}
                                        </div>
                                        <div className="col-md-6">
                                            <i className="bi bi-p-square me-2"></i>
                                            Slot: {reservation.slotID || "Not specified"}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-white opacity-30">
                                {searchTerm ? "No matching past reservations found." : "No past reservations found."}
                            </p>
                        )}
                    </div>
                )}

                {/* Archived Reservations */}
                {filterOption !== 'current' && (
                    <div className="mt-4">
                        <button
                            onClick={() => setIsArchiveExpanded(!isArchiveExpanded)}
                            className="w-100 d-flex justify-content-between align-items-center p-3"
                            style={{
                                backgroundColor: '#2d3748',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <span className="fw-bold">Archived Reservations (Older than 1 week)</span>
                            <i className={`bi bi-chevron-${isArchiveExpanded ? 'up' : 'down'}`}></i>
                        </button>

                        {isArchiveExpanded && (
                            <div className="mt-3">
                                {filterReservations(archivedResDetails).length > 0 ? (
                                    filterReservations(archivedResDetails).map((reservation, index) => (
                                        <div key={index}
                                             className="mb-3 p-4"
                                             style={{
                                                 backgroundColor: '#2d3748',
                                                 borderRadius: '8px',
                                                 color: 'white'
                                             }}>
                                            {/*<h4>Reservation {index + 1}</h4>*/}
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <i className="bi bi-clock me-2"></i>
                                                    Start: {formatDate(reservation.reservationStartTime)}
                                                </div>
                                                <div className="col-md-6">
                                                    <i className="bi bi-clock-fill me-2"></i>
                                                    End: {formatDate(reservation.reservationEndTime)}
                                                </div>
                                                <div className="col-md-6">
                                                    <i className="bi bi-geo-alt me-2"></i>
                                                    Location: {reservation.parkingLot || "Not specified"}
                                                </div>
                                                <div className="col-md-6">
                                                    <i className="bi bi-p-square me-2"></i>
                                                    Slot: {reservation.slotID || "Not specified"}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-white opacity-30">
                                        {searchTerm ? "No matching archived reservations found." : "No archived reservations found."}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserInfo;