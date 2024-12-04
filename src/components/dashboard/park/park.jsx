import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, doc, runTransaction } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { toast } from 'react-toastify';
import { Car } from 'lucide-react';

function Park() {
  const [parkingSlots, setParkingSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const checkSlotsAvailability = async () => {
      try {
        console.log('Starting to fetch slots...');
        const reservationStartTime = localStorage.getItem('reservationStartTime');
        const reservationEndTime = localStorage.getItem('reservationEndTime');

        console.log('Times:', { reservationStartTime, reservationEndTime });

        if (!reservationStartTime || !reservationEndTime) {
          toast.error('No reservation time found');
          setLoading(false);
          return;
        }

        const slotsCollection = collection(db, 'ParkingSlots');
        const slotsSnapshot = await getDocs(slotsCollection);

        const reservationsCollection = collection(db, 'Reservations');
        const reservationsSnapshot = await getDocs(reservationsCollection);

        const reservedSlots = reservationsSnapshot.docs
            .filter(doc => {
              const reservation = doc.data();
              return (
                  reservation.reservationStartTime <= reservationEndTime &&
                  reservation.reservationEndTime >= reservationStartTime
              );
            })
            .map(doc => doc.data().slotID);

        console.log('Reserved slots:', reservedSlots);

        const dbSlots = slotsSnapshot.docs.map(doc => {
          const slotData = doc.data();
          return {
            id: doc.id,
            isAvailable: !reservedSlots.includes(doc.id),
            type: slotData.type || 'standard',
          };
        });

        console.log('Processed slots:', dbSlots);
        setParkingSlots(dbSlots);
        setLoading(false);

      } catch (error) {
        console.error('Error in checkSlotsAvailability:', error);
        toast.error('Error checking slot availability');
        setLoading(false);
      }
    };

    checkSlotsAvailability();
  }, []);

  const handleSlotSelection = async (slotId) => {
    try {
      const reservationStartTime = localStorage.getItem('reservationStartTime');
      const reservationEndTime = localStorage.getItem('reservationEndTime');
      const parkingLot = localStorage.getItem('parkingLot');

      await runTransaction(db, async (transaction) => {
        const reservationsCollection = collection(db, 'Reservations');
        const reservationsSnapshot = await getDocs(reservationsCollection);

        const isSlotTaken = reservationsSnapshot.docs.some(doc => {
          const reservation = doc.data();
          return (
              reservation.slotID === slotId &&
              reservation.reservationStartTime <= reservationEndTime &&
              reservation.reservationEndTime >= reservationStartTime
          );
        });

        if (isSlotTaken) {
          throw new Error('Slot already taken');
        }

        const newReservationRef = doc(collection(db, 'Reservations'));
        transaction.set(newReservationRef, {
          slotID: slotId,
          reservationStartTime,
          reservationEndTime,
          parkingLot,
          userRef: doc(db, 'Users', user.uid),
          userID: user.uid,
          status: 'confirmed'
        });
      });

      localStorage.removeItem('reservationStartTime');
      localStorage.removeItem('reservationEndTime');
      localStorage.removeItem('parkingLot');

      window.location.replace("/dashboard");

    } catch (err) {
      if (err.message === 'Slot already taken') {
        toast.error('This slot has just been taken. Please select another slot.', {
          position: "bottom-center"
        });
        window.location.reload();
      } else {
        toast.error('Error making reservation. Please try again.', {
          position: "bottom-center"
        });
        console.error('Reservation error:', err);
      }
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-pulse">Loading parking slots...</div>
        </div>
    );
  }

  // Remove duplicate slots and sort them properly
  const uniqueSlots = Array.from(new Set(parkingSlots.map(slot => slot.id)))
      .map(id => parkingSlots.find(slot => slot.id === id))
      .sort((a, b) => {
        const numA = parseInt(a.id.replace('Slot', ''));
        const numB = parseInt(b.id.replace('Slot', ''));
        return numA - numB;
      });

  // Split slots into two rows (1-9 in top row, 14-23 in bottom row)
  const topRow = uniqueSlots.filter(slot => {
    const num = parseInt(slot.id.replace('Slot', ''));
    return num <= 9;
  });

  const bottomRow = uniqueSlots.filter(slot => {
    const num = parseInt(slot.id.replace('Slot', ''));
    return num >= 14;
  });

  return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-6xl mx-auto">
          {/* Legend */}
          <div className="mb-8 flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Selected</span>
            </div>
          </div>

          {/* Top row */}
          <div className="grid grid-cols-9 gap-4 mb-4">
            {topRow.map((slot) => (
                <button
                    key={slot.id}
                    onClick={() => handleSlotSelection(slot.id)}
                    disabled={!slot.isAvailable}
                    className={`
                aspect-square rounded-lg p-4
                flex flex-col items-center justify-center
                transition-all duration-200
                ${slot.isAvailable
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-gray-600'
                    }
                ${selectedSlot === slot.id ? 'bg-green-500' : ''}
                disabled:cursor-not-allowed
              `}
                >
                  <span className="text-white font-semibold">{slot.id}</span>
                  {!slot.isAvailable && (
                      <Car className="text-white mt-2" size={24} />
                  )}
                </button>
            ))}
          </div>

          {/* Driving lane */}
          <div className="text-center py-4 mb-4 bg-gray-100 rounded-lg">
            DRIVING LANE
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-9 gap-4">
            {bottomRow.map((slot) => (
                <button
                    key={slot.id}
                    onClick={() => handleSlotSelection(slot.id)}
                    disabled={!slot.isAvailable}
                    className={`
                aspect-square rounded-lg p-4
                flex flex-col items-center justify-center
                transition-all duration-200
                ${slot.isAvailable
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-gray-600'
                    }
                ${selectedSlot === slot.id ? 'bg-green-500' : ''}
                disabled:cursor-not-allowed
              `}
                >
                  <span className="text-white font-semibold">{slot.id}</span>
                  {!slot.isAvailable && (
                      <Car className="text-white mt-2" size={24} />
                  )}
                </button>
            ))}
          </div>

          {/* Selected slot info */}
          {selectedSlot && (
              <div className="mt-8 text-center">
                <div className="text-lg mb-2">
                  Selected: <span className="font-bold">{selectedSlot}</span>
                </div>
                <button
                    onClick={() => handleSlotSelection(selectedSlot)}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  Confirm Selection
                </button>
              </div>
          )}
        </div>
      </div>
  );
}

export default Park;