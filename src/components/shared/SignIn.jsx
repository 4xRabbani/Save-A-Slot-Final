import { signInWithEmailAndPassword } from "@firebase/auth";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "../../firebase/firebase";
import logo from "/logo.png";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Redirect to home page after successful login
      window.location.replace("/dashboard");

      toast.success("User Registration Successfully!!!", {
        position: "top-center",
      });
      console.log("User Successfully Logged In");
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
          <form onSubmit={handleSubmit}>
            <h2 className="container text-md-left font-weight-bold my-5">Login</h2>

            <div className="box text-white">
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
            <br />
            <div className="container row justify-content-between">
              <button type="submit" className="btn my-4 font-weight-bold atlas-cta cta-green">Login</button>
              <h5 className="col-6 align-self-center text-right">
                <Link to={"/register"} className="">
                  Register here...
                </Link>
              </h5>
            </div>
          </form>
        </div>
      </div></>
  );
};

export default SignIn;
