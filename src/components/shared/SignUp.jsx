import { useState } from "react";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "/logo.png";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [carMake, setCarMake] = useState("");
  const [carYear, setCarYear] = useState("");
  const [carModel, setCarModel] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      // Create a new user with email and password
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;

      // Set user profile in Firestore database
      if (user) {
        const userDocRef = doc(db, "Users", user.uid);
        await setDoc(doc(db, "Users", user.uid), {
          firstName: firstName,
          lastName: lastName,
          email: user.email,
        });
        await setDoc(doc(db, "Vehicles", user.uid), {
          carMake: carMake,
          carModel: carModel,
          carYear: carYear,
          userRef: userDocRef,
        });
      }
      //redirects to dashboard
      window.location.replace("/dashboard");

      toast.success("Account successfully created", {
        position: "top-right",
      });
    } catch (err) {
      // Show error message to the user
      toast.success(err.message, {
        position: "top-right",
      });
      console.log(err.code);
    }
  };

  return (
    <><div className="jumbotron-fluid py-2 container">
      <header>
        <div className="container row justify-content-between">
          <div className="col-2">
            <img src={logo} alt="logo" />
          </div>
        </div>
      </header>
    </div>
    <div className="jumbotron-fluid py-2">
        <div className="container">
          <form onSubmit={handleSignUp}>
            <h2 className="container text-md-left font-weight-bold my-5">
              Register
            </h2>
            <div className="box text-white">
              <div className="form-group col-md-6">
                <label>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  className="form-control" />
              </div>

              <div className="form-group col-md-6">
                <label>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  className="form-control" />
              </div>
              <div className="form-group col-md-6">
                <label>Car Make</label>
                <input
                  type="text"
                  value={carMake}
                  onChange={(e) => setCarMake(e.target.value)}
                  placeholder="Enter your Car Make"
                  className="form-control" />
              </div>

              <div className="form-group col-md-6">
                <label>Car Model</label>
                <input
                  type="text"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  placeholder="Enter your Car Model"
                  className="form-control" />
              </div>

              <div className="form-group col-md-6">
                <label>Car Model Year</label>
                <input
                  type="number"
                  value={carYear}
                  onChange={(e) => setCarYear(e.target.value)}
                  placeholder="Enter your Car Model Year"
                  className="form-control" />
              </div>

              <div className="form-group col-md-6">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="form-control" />
              </div>

              <div className="form-group col-md-6">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-control" />
              </div>
            </div>

            <div className="container row justify-content-between">
              <button
                type="submit"
                className="btn my-4 font-weight-bold atlas-cta cta-green"
              >
                Create Account
              </button>

              <h5 className="col-6 align-self-center text-right">
                <Link to={"/login"} className="">
                  Return to Login...
                </Link>
              </h5>
            </div>
          </form>
        </div>
      </div></>
  );
};

export default SignUp;
