function PriceTable() {
  return (
    <div className="container my-5 py-2" id="price-table">
      <hr />
      <h2 className="text-center font-weight-bold d-block">
        Purchase a Parking Permit
      </h2>
      <div className="row">
        <div
          data-aos="fade-right"
          data-aos-delay="200"
          data-aos-duration="1000"
          data-aos-once="true"
          className="col-md-4 text-center py-4 mt-5"
        >

        </div>
        <div
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-once="true"
          className="col-md-4 text-center py-4 mt-5 rounded"
          id="price-table__premium"
        >
          <h4 className="my-4"></h4>
          <h6 className="py-4">
            In order to reserve a spot with Save-A-Slot, you must have a parking permit with UMB. Please visit the UMB Parking Portal to Purchase one.
          </h6>
          <a href="https://umb.t2hosted.com/Account/Portal" className="btn my-4 font-weight-bold atlas-cta cta-green">
            Purchase
          </a>
        </div>
        <div
          data-aos="fade-left"
          data-aos-delay="200"
          data-aos-duration="1000"
          data-aos-once="true"
          className=" text-center py-4 mt-5"
        >

        </div>
      </div>
    </div>
  );
}

export default PriceTable;
