import Image from "next/image";

const Page = () => {
  return (
    <>
      <div className="container">
        <div className="innerwrap">
          <section className="section1 clearfix">
            <div>
              <div className="row grid clearfix">
                <div className="col2 first">
                  {/* <Image
                    src=""
                    alt="David Beckham"
                    width={300}
                    height={300}
                  /> */}
                  <h1>Dr. David Beckham</h1>
                  <p>
                    Welcome to the PABS family
                  </p>
                </div>
                <div className="col2 last">
                  <div className="grid clearfix">
                    <div className="col3 first">
                      <h1>694</h1>
                      <span>Total Appointments</span>
                    </div>
                    <div className="col3">
                      <h1>452</h1>
                      <span>Upcoming Appointments</span>
                    </div>
                    <div className="col3 last">
                      <h1>1207</h1>
                      <span>Past Appointments</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="row clearfix">
                <ul className="row2tab clearfix">
                  <li key="posts">
                    <i className="fa fa-list-alt"></i> My posts{" "}
                  </li>
                  <li key="likes">
                    <i className="fa fa-heart"></i> My likes{" "}
                  </li>
                  <li key="following">
                    <i className="fa fa-check"></i> Following{" "}
                  </li>
                  <li key="suggestions">
                    <i className="fa fa-thumbs-o-up"></i> Suggestions{" "}
                  </li>
                </ul>
              </div> */}
            </div>
            {/* <span className="smalltri">
              <i className="fa fa-star"></i>
            </span> */}
          </section>
          <section className="section2 clearfix">
            <div className="grid">
              <div className="col3 first">
                {/* <div className="postcont">
                  <Image
                    src=""
                    alt="David Beckham"
                    width={300}
                    height={300}
                  />
                </div> */}
                <div className="profileinfo">
                  <Image
                    src=""
                    alt="David Beckham"
                    width={50}
                    height={50}
                  />
                  <p>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text
                  </p>
                  {/* <span>
                    Read more <i className="fa fa-angle-right"></i>
                  </span> */}
                </div>
              </div>
              {/* Repeat similar corrections for other columns */}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Page;
