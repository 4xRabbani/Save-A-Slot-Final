import ThreeBlock1 from "/smart-protect-1.jpg";
import ThreeBlock2 from "/smart-protect-2.jpg";
import ThreeBlock3 from "/smart-protect-3.jpg";

function ThreeBlock() {
  return (
    <div className="container">
      <h2 className="text-center font-weight-bold my-5">Process for Parking</h2>
      <div className="row">
        <div
          data-aos="fade-up"
          data-aos-delay="0"
          data-aos-duration="1000"
          data-aos-once="true"
          className="col-md-4 text-center"
        >
          <img src={ThreeBlock1} alt="Find Your Spot" className="mx-auto" />
          <h4>Find Your Spot</h4>
          <p>
            Select a parking spot on the website using our model.
          </p>
        </div>
        <div
          data-aos="fade-up"
          data-aos-delay="200"
          data-aos-duration="1000"
          data-aos-once="true"
          className="col-md-4 text-center"
        >
          <img src={ThreeBlock2} alt="Pick Your Time" className="mx-auto" />
          <h4>Pick Your Time</h4>
          <p>
            Select the time slot you wish to have your parking spot reserved.
          </p>
        </div>
        <div
          data-aos="fade-up"
          data-aos-delay="400"
          data-aos-duration="1000"
          data-aos-once="true"
          className="col-md-4 text-center"
        >
          <img src={ThreeBlock3} alt="Arrive and Park" className="mx-auto" />
          <h4>Arrive and Park</h4>
          <p>Park in your reserved spot as soon as you arrive.</p>
        </div>
      </div>
    </div>
  );
}

export default ThreeBlock;
