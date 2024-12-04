import banner from "/contact-bk.jpg";

function Contact() {
  var backgroundStyle = {
    backgroundImage: "url(" + banner + ")",
  };

  return (
    <div
      className="jumbotron jumbotron-fluid"
      id="contact"
      style={backgroundStyle}
    >
      <div className="container my-5">
        <div className="row justify-content-between">
          <div className="col-md-6 text-white">
            <h2 className="font-weight-bold">Contact Us</h2>
            <p className="my-4">
              We&apos;d love to hear from you! Whether you have a question,
              <br /> need assistance, or want to share feedback, the Save-A-Slot
              <br /> team is here to help.
            </p>
            <ul className="list-unstyled">
              <li>Email : Parking.Trans@umb.edu</li>
              <li>Phone : (617) 287-5041</li>
              <li>Office Hours: Monday to Friday, 8:30 AM - 5:00 PM </li>
              <li>Address : 100 Morrissey Blvd, Boston, MA</li>
            </ul>
          </div>
          <div className="col-md-6">
            <form>
              <div className="row">
                <div className="form-group col-md-6">
                  <label htmlFor="name">Your Name</label>
                  <input type="name" className="form-control" id="name" />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="Email">Your Email</label>
                  <input type="email" className="form-control" id="Email" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  className="form-control"
                  id="message"
                  rows="3"
                ></textarea>
              </div>
              <button
                type="submit"
                className="btn font-weight-bold atlas-cta atlas-cta-wide cta-green my-3"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
