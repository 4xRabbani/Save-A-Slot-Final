import appStoreBadge from "/appstore.png";
import playStoreBadge from "/playstore.png";

const DownloadButtons = () => {
  return (
    <div>
      {/* App Store Button */}
      <a href="https://apps.apple.com/" target="_blank" rel="noopener noreferrer">
        <img src={appStoreBadge} alt="Download on the App Store" style={{ height: '55px' }} />
      </a>

      {/* Google Play Button */}
      <a href="https://play.google.com/store/apps" target="_blank" rel="noopener noreferrer">
        <img src={playStoreBadge} alt="Get it on Google Play" style={{ height: '80px' }} />
      </a>
    </div>
  );
};

function Footer() {

  return (
    <div className="jumbotron jumbotron-fluid py-2" id="copyright">
      <div className="container my-5">
        <div className="row justify-content-between">
          <div className="col-md-6 text-white align-self-center text-center text-md-left my-2">
            Copyright © 2024.
          </div>
        

        </div>
          <div className="align-self-center text-center text-md-left my-2">
            <a href="/privacy">
              Privacy Policy
            </a>
          </div>
          <div className="align-self-center text-center text-md-left my-2">
            <a href="/terms">
              Terms &amp; Services
            </a>
          </div>
          <div className="align-self-center text-center text-md-left my-2 ">
            <DownloadButtons />
          </div>
      </div>
    </div>
  );
}

export default Footer;
