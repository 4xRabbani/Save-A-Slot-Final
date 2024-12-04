import feature from "/feature-1.png";

function Review() {
  return (
    <div className="jumbotron jumbotron-fluid feature" id="review">
      <div className="container my-5">
        <div className="row justify-content-between text-center text-md-left">
          <div
            data-aos="fade-right"
            data-aos-duration="1000"
            data-aos-once="true"
            className="col-md-6"
          >
            <h2 className="font-weight-bold"></h2>
            <p className="my-4">
              "Indicators for whether a lot is full or not are innacurate
              <br /> and caused me to be late to class."
            </p>
            <p className="font-weight-bold my-4 text-md-left">
            &emsp;&emsp;- UMB Student on Previous Parking Situation
            </p>
          </div>
          <div
            data-aos="fade-left"
            data-aos-duration="1000"
            data-aos-once="true"
            className="col-md-6 align-self-center"
          >
            <p className="my-4">
              "We don't know if a spot will open up once we leave the lot,
              <br /> so we must wait for a spot, looking around for any cars to leave."
            </p>
            <p className="font-weight-bold my-4 text-md-left">
            &emsp;&emsp;- UMB Student on Previous Parking Situation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Review;
