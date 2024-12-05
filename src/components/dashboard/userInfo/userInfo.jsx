import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/firebase";
import { Search } from "lucide-react";
import {
  getDoc,
  getDocs,
  doc,
  where,
  collection,
  query,
} from "firebase/firestore";

const UserInfo = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [carDetails, setCarDetails] = useState(null);
  const [currentResDetails, setCurrentResDetails] = useState([]);
  const [pastResDetails, setPastResDetails] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("all");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  const fetchUserDetails = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("Current User:", user);

        // Get the user information
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        } else {
          console.log("No such document!");
        }

        const userDocRef = doc(db, "Users", user.uid);

        //Get the Car details
        const docRef1 = collection(db, "Vehicles");
        const carInfo = query(docRef1, where("userRef", "==", userDocRef));
        const docSnap1 = await getDocs(carInfo);

        if (!docSnap1.empty) {
          const carData = docSnap1.docs[0].data();
          setCarDetails(carData);
        }

        //Showing the reservation of user
        const reservation = collection(db, "Reservations");
        const reservationSnap = query(
            reservation,
            where("userRef", "==", userDocRef)
        );
        const resSnap = await getDocs(reservationSnap);

        if (!resSnap.empty) {
          const allReservations = resSnap.docs.map((doc) => doc.data());

          // Separate current and past reservations
          const now = new Date();
          const current = [];
          const past = [];

          allReservations.forEach(reservation => {
            const endTime = new Date(reservation.reservationEndTime);
            if (endTime < now) {
              past.push(reservation);
            } else {
              current.push(reservation);
            }
          });

          // Sort current reservations by closest to now
          current.sort((a, b) => {
            const timeA = new Date(a.reservationStartTime);
            const timeB = new Date(b.reservationStartTime);
            return timeA - timeB;
          });

          // Sort past reservations by most recent first
          past.sort((a, b) => {
            const timeA = new Date(a.reservationEndTime);
            const timeB = new Date(b.reservationEndTime);
            return timeB - timeA;
          });

          setCurrentResDetails(current);
          setPastResDetails(past);
        }
      } else {
        console.log("No user signed in!");
        window.location.replace("/");
      }
    });
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const filterReservations = (reservations) => {
    return reservations.filter(reservation => {
      const searchFields = [
        reservation.parkingLot,
        reservation.slotID,
        formatDate(reservation.reservationStartTime),
        formatDate(reservation.reservationEndTime)
      ].map(field => field.toLowerCase());

      return searchFields.some(field => field.includes(searchTerm.toLowerCase()));
    });
  };

  const ReservationList = ({ reservations, title, isPast = false }) => {
    const filteredReservations = filterReservations(reservations);

    return (
        <div className={`mt-6 ${isPast ? 'opacity-75' : ''}`}>
          <h3 className="text-xl font-bold mb-4">{title}:</h3>
          {filteredReservations.length > 0 ? (
              filteredReservations.map((reservation, index) => (
                  <div
                      key={index}
                      className={`mb-4 p-4 rounded-lg ${
                          isPast
                              ? 'bg-gray-700 border-gray-600'
                              : 'bg-blue-900 border-blue-700'
                      } border`}
                  >
                    <p className="font-bold text-lg mb-2">Reservation {index + 1}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-gray-300">Start Time:</p>
                        <p className="font-medium">{formatDate(reservation.reservationStartTime)}</p>
                      </div>
                      <div>
                        <p className="text-gray-300">End Time:</p>
                        <p className="font-medium">{formatDate(reservation.reservationEndTime)}</p>
                      </div>
                      <div>
                        <p className="text-gray-300">Parking Lot:</p>
                        <p className="font-medium">{reservation.parkingLot || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-gray-300">Parking Slot:</p>
                        <p className="font-medium">{reservation.slotID || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
              ))
          ) : (
              <p className="text-gray-400">No {title.toLowerCase()} found.</p>
          )}
        </div>
    );
  };

  return (
      <div className="container jumbotron-fluid py-2">
        <h1 className="text-md-left font-weight-bold my-5">
          Welcome, {userDetails?.firstName}!
        </h1>
        <div className="container">
          <div className="container box text-white">
            <p>Surname: {userDetails?.lastName}</p>
            <p>Your email: {userDetails?.email}</p>
            <p className="font-weight-bold">Your Vehicle:</p>
            <p>&emsp;&emsp;Make: {carDetails?.carMake || "Not specified"}</p>
            <p>&emsp;&emsp;Model: {carDetails?.carModel || "Not specified"}</p>
            <p>&emsp;&emsp;Year: {carDetails?.carYear || "Not specified"}</p>
          </div>

          <div>
            <div className="text-center">
              <Link to={"/dashboard/time"}>
                <button
                    type="submit"
                    className="btn my-4 font-weight-bold atlas-cta cta-blue"
                >
                  &emsp;&emsp;&emsp;&emsp;Make a
                  Reservation&emsp;&emsp;&emsp;&emsp;
                </button>
              </Link>
            </div>
          </div>

          <div className="container box text-white">
            {/* Search and Filter Section */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <input
                      type="text"
                      placeholder="Search reservations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
                <select
                    value={filterOption}
                    onChange={(e) => setFilterOption(e.target.value)}
                    className="px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Reservations</option>
                  <option value="current">Current Only</option>
                  <option value="past">Past Only</option>
                </select>
              </div>
            </div>

            {/* Reservations Display */}
            {filterOption !== 'past' && (
                <ReservationList
                    reservations={currentResDetails}
                    title="Current & Upcoming Reservations"
                />
            )}
            {filterOption !== 'current' && (
                <ReservationList
                    reservations={pastResDetails}
                    title="Past Reservations"
                    isPast={true}
                />
            )}
          </div>
        </div>
      </div>
  );
};

export default UserInfo;