import DisplayDocument from "../DisplayDocument.jsx";
import { Link } from "react-router-dom";

function Reservation() {
  return (
    <div className="jumbotron-fluid py-2">
      <div className="container justify-content-between text-center">
        <h3>Your Reservation is Booked</h3>
      </div>
      <div className="container justify-content-between">
        <DisplayDocument
          collectionName="Reservations"
          documentId="Placeholder"
        />
      </div>
      <div className="text-center">
        <Link to={"/dashboard"}>
          <button
            type="submit"
            className="btn my-4 font-weight-bold atlas-cta cta-blue"
          >
            &emsp;&emsp;&emsp;&emsp;Return to Dashboard&emsp;&emsp;&emsp;&emsp;
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Reservation;
