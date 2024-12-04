import feature from "/feature-1.png";

function Feature() {
  return (
    <div className="jumbotron jumbotron-fluid feature" id="feature-first">
      <div className="container my-5">
        <div className="row justify-content-between text-center text-md-left">
          <div
            data-aos="fade-right"
            data-aos-duration="1000"
            data-aos-once="true"
            className="col-md-6"
          >
            <h2 className="font-weight-bold">We are here to simplify your journey</h2>
            <p className="my-4">
              With Save-A-Slot, you can reserve a parking slot for your 
              <br /> desired time and be at peace knowing your slot is ready for you when you arrive. Whether you’re starting your day early or arriving for a late afternoon session, Save-A-Slot ensures you’ll always have a spot waiting just for you.
            </p>
          </div>
          <div
            data-aos="fade-left"
            data-aos-duration="1000"
            data-aos-once="true"
            className="col-md-6 align-self-center"
          >
            <img
              src={feature}
              alt="Take a look inside"
              className="mx-auto d-block"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feature;
