import logo from "/logo.png";
import banner from "/banner-bk.jpg";
import SignIn from "../../shared/SignIn";

function Header() {
  var backgroundStyle = {
    backgroundImage: "url(" + banner + ")",
  };

  return (
    <div
      className="jumbotron jumbotron-fluid background"
      id="banner"
      style={backgroundStyle}
    >
      <div className="container text-center text-md-left">
        <header>
          <div className="container row justify-content-between">
            <div className="col-2">
              <a 
              href="https://www.umb.edu/#"
              >
              <img src={logo} alt="logo" />
              </a>
            </div>
            <div className="col-6 text-right">
              <a
                href="/login"
                className="btn my-4 font-weight-bold atlas-cta cta-green lead"
                onClick={SignIn}
              >
                Sign in
              </a>
            </div>
          </div>
        </header>
        <h1
          data-aos="fade"
          data-aos-easing="linear"
          data-aos-duration="1000"
          data-aos-once="true"
          className="display-3 text-white font-weight-bold my-5"
        >
          A New Way
          <br />
          To Find Parking
        </h1>
        <p
          data-aos="fade"
          data-aos-easing="linear"
          data-aos-duration="1000"
          data-aos-once="true"
          className="lead text-white my-4 text-shadow font-weight-bold"
        >
          At Save-A-Slot, we&apos;re all about making parking simple and
          stress-free.
          <br /> Our goal is to save you time and hassle by giving you the power
          to reserve a parking spot ahead of time.
          <br /> No more circling around looking for spaces—just park and go.
        </p>
      </div>
    </div>
  );
}

export default Header;
