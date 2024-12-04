import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/firebase";
import {
  getDoc,
  getDocs,
  doc,
  where,
  collection,
  query,
} from "firebase/firestore";

const UserInfo = () => {
  // Correct state declaration
  const [userDetails, setUserDetails] = useState(null);
  const [carDetails, setCarDetails] = useState(null);
  const [resDetails, setResDetails] = useState([]);

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

        // reconstruct userDocRef
        const userDocRef = doc(db, "Users", user.uid);

        //Get the Car details
        const docRef1 = collection(db, "Vehicles");
        const carInfo = query(docRef1, where("userRef", "==", userDocRef));
        const docSnap1 = await getDocs(carInfo);
        console.log("Doc Snap 1 size", docSnap1.size);

        if (!docSnap1.empty) {
          // Simplify fetching first car document
          const carData = docSnap1.docs[0].data();
          console.log("Vehicle Document Data:", carData);
          setCarDetails(carData);
        } else {
          console.log("No such document!");
        }

        //Showing the reservation of user
        const reservation = collection(db, "Reservations");
        const reservationSnap = query(
          reservation,
          where("userRef", "==", userDocRef)
        );
        const resSnap = await getDocs(reservationSnap);
        console.log("Reservation Documents Count:", resSnap.size);
        console.log("Debug Reservation Query:", {
          userRef: userDocRef,
          userRefPath: userDocRef.path,
          userRefType: typeof userDocRef,
          userRefId: userDocRef.id,
          reservationQueryRef: reservationSnap,
        });

        console.log("Reservation Documents Count:", resSnap.size);
        console.log(
          "Reservation Documents:",
          resSnap.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }))
        );

        if (!resSnap.empty) {
          // Map through all reservation documents
          const allReservations = resSnap.docs.map((doc) => doc.data());
          console.log("All Reservations:", allReservations);
          setResDetails(allReservations);
        } else {
          console.log("No reservations found!");
        }
      } else {
        console.log("No user signed in!");
        // Redirect to the login page if the user is not logged in
        window.location.replace("/");
      }
    });
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <div className="container jumbotron-fluid py-2">
      <h1 className=" text-md-left font-weight-bold my-5">
        Welcome, {userDetails?.firstName}!
      </h1>
      <div className="container">
        <div className="container box text-white">
          <p>Surname: {userDetails?.lastName}</p>
          <p>Your email: {userDetails?.email}</p>
          <p className="font-weight-bold ">Your Vehicle:</p>
          <p>&emsp;&emsp;Make: {carDetails?.carMake || "Not specified"}</p>
          <p>&emsp;&emsp;Model: {carDetails?.carModel || "Not specified"}</p>
          <p>&emsp;&emsp;Year: {carDetails?.carYear || "Not specified"}</p>

          <br />
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
          <h3>Your Reservations:</h3>
          {resDetails && resDetails.length > 0 ? (
              [...resDetails]
                  .sort((a, b) => {
                    const now = new Date();
                    const timeA = new Date(a.reservationStartTime);
                    const timeB = new Date(b.reservationStartTime);

                    // Calculate time difference from now
                    const diffA = Math.abs(timeA - now);
                    const diffB = Math.abs(timeB - now);

                    return diffA - diffB; // Closest time first
                  })
                  .map((reservation, index) => (
                      <div key={index}>
                        <p>Reservation {index + 1}:</p>
                        <p>
                          Start Time:{" "}
                          {reservation.reservationStartTime || "Not specified"}
                        </p>
                        <p>
                          End Time: {reservation.reservationEndTime || "Not specified"}
                        </p>
                        <p>Parking Lot: {reservation.parkingLot || "Not specified"}</p>
                        <p>Parking Slot: {reservation.slotID || "Not specified"}</p>
                      </div>
            ))
          ) : (
            <p>No reservations found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
