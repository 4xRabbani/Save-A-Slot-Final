import { useState } from "react";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";

function Time() {
  const [reservationStartTime, setReservationStartTime] = useState("");
  const [reservationEndTime, setReservationEndTime] = useState("");
  const [parkingLot, setParkingLot] = useState("West Garage");
  const auth = getAuth();
  const user = auth.currentUser;

  const handleTimeSelection = (e) => {
    e.preventDefault();

    try {
      localStorage.setItem("reservationStartTime", reservationStartTime);
      localStorage.setItem("reservationEndTime", reservationEndTime);
      localStorage.setItem("parkingLot", parkingLot);

      window.location.replace("/dashboard/park");
    } catch (err) {
      toast.error(err.message, {
        position: "bottom-center",
      });
      console.log(err.code);
    }
  };

  return (
      <div className="container jumbotron-fluid py-2">
        <h2 className=" text-md-left font-weight-bold my-5">
          Place Your Next Parking Reservation
        </h2>
        <div className="container">
          <form onSubmit={handleTimeSelection}>
            <div className="form-group col-md-6">
              <label htmlFor="garage" className="col-form-label-lg">
                Garage
              </label>

              <select
                  name="garage"
                  id="garage"
                  className="form-control"
                  value={parkingLot}
                  onChange={(e) => setParkingLot(e.target.value)}
              >
                <option value="West Garage">West Garage</option>
              </select>
            </div>

            <br />
            <div className="box text-white">
              <div className="form-group col-md-6 ">
                <label htmlFor="startTime" className="col-form-label-lg">
                  Start Time
                </label>
                <input
                    className="form-control"
                    type="DateTime-local"
                    value={reservationStartTime}
                    onChange={(e) => setReservationStartTime(e.target.value)}
                    id="time"
                    name="startTime"
                    required
                />
              </div>

              <div className="form-group col-md-6">
                <label htmlFor="endTime" className="col-form-label-lg">
                  End Time
                </label>
                <input
                    className="form-control"
                    type="DateTime-local"
                    value={reservationEndTime}
                    onChange={(e) => setReservationEndTime(e.target.value)}
                    id="time"
                    name="endTime"
                    required
                />
              </div>
            </div>
            <br />
            <br />
            <div className="text-center">
              <button
                  type="submit"
                  className="btn my-4 font-weight-bold atlas-cta cta-blue"
              >
                &emsp;&emsp;&emsp;&emsp;Choose Parking
                Spot&emsp;&emsp;&emsp;&emsp;
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}

export default Time;
