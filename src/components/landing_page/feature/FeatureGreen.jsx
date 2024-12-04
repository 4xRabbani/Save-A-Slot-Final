import feature2 from "/feature-2.png";

function FeatureGreen() {
  return (
    <div className="jumbotron jumbotron-fluid feature" id="feature-last">
      <div className="container">
        <div className="row justify-content-between text-center text-md-left">
          <div
            data-aos="fade-left"
            data-aos-duration="1000"
            data-aos-once="true"
            className="col-md-6 flex-md-last"
          >
            <h2 className="font-weight-bold">Improved Parking at UMB</h2>
            <p className="my-4">
            Save-A-Slot elevates parking convenience for the UMB   
              <br /> community, offering a seamless, stress-free experience for   
              <br /> students and staff alike. No more last-minute scrambles or 
              <br /> circling the lot—our easy-to-use reservation system allows 
              <br /> you to secure your parking space ahead of time, giving you
              <br /> peace of mind before heading to class.
            </p>
          </div>
          <div
            data-aos="fade-right"
            data-aos-duration="1000"
            data-aos-once="true"
            className="col-md-6 align-self-center flex-md-first"
          >
            <img
              src={feature2}
              alt="Safe and reliable"
              className="mx-auto d-block"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeatureGreen;
