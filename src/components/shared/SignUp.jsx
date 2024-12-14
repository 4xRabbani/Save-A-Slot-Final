import react, { useState, useEffect } from 'react';
import Papa from 'papaparse';
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
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [yearData, setYearData] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  // Generate year options from 1999 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(currentYear - 1991), (val, index) => currentYear - index);

  // Function to fetch and parse CSV
  const fetchCSV = async (filepath) => {
    try {
      const response = await fetch(filepath);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filepath}`);
      }
      const text = await response.text();

      return new Promise((resolve, reject) => {
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            resolve(results.data.filter(row => row.make && row.model));
          },
          error: (error) => {
            reject(error);
          }
        });
      });
    } catch (error) {
      throw new Error(`Error fetching CSV: ${error.message}`);
    }
  };

  // Fetch data when year changes
  useEffect(() => {
    const fetchYearData = async () => {
      if (!carYear) {
        setMakes([]);
        setModels([]);
        setYearData(null);
        return;
      }

      setLoading(true);
      try {
        const data = await fetchCSV(`/vehicles/${carYear}.csv`);
        setYearData(data);

        // Extract unique makes using lowercase 'make'
        const uniqueMakes = [...new Set(data.map(row => row.make))]
            .filter(make => make)
            .sort()
            .map((make, index) => ({
              Make_ID: index + 1,
              Make_Name: make
            }));

        setMakes(uniqueMakes);
        setCarMake(""); // Reset make selection
        setCarModel(""); // Reset model selection
      } catch (error) {
        console.error('Error fetching year data:', error);
        toast.error(`Error loading data for year ${carYear}`);
        setYearData(null);
        setMakes([]);
        setModels([]);
      }
      setLoading(false);
    };

    fetchYearData();
  }, [carYear]);

  // Update models when make changes
  useEffect(() => {
    if (!carMake || !yearData) {
      setModels([]);
      return;
    }

    // Filter models using lowercase 'make' and 'model'
    const filteredModels = yearData
        .filter(row => row.make === carMake)
        .map((row, index) => ({
          Model_ID: index + 1,
          Model_Name: row.model
        }))
        .filter((model, index, self) =>
            index === self.findIndex(m => m.Model_Name === model.Model_Name)
        )
        .sort((a, b) => a.Model_Name.localeCompare(b.Model_Name));

    setModels(filteredModels);
    setCarModel(""); // Reset model selection when make changes
  }, [carMake, yearData]);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    // Handle successful password confirmation here
    console.log('Password confirmed successfully');

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;

      if (user) {
        const userDocRef = doc(db, "Users", user.uid);
        await setDoc(doc(db, "Users", user.uid), {
          firstName,
          lastName,
          email: user.email,
        });
        await setDoc(doc(db, "Vehicles", user.uid), {
          carMake,
          carModel,
          carYear,
          userRef: userDocRef,
        });
      }

      window.location.replace("/dashboard");
      toast.success("Account successfully created", {
        position: "top-right",
      });
    } catch (err) {
      toast.error(err.message, {
        position: "top-right",
      });
      console.log(err.code);
    }
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
      <>
        <div className="jumbotron-fluid py-2 container">
          <header>
            <div className="container row justify-content-between">
              <div className="col-4">
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
                      className="form-control"
                      required
                  />
                </div>

                <div className="form-group col-md-6">
                  <label>Last Name</label>
                  <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                      className="form-control"
                      required
                  />
                </div>

                <div className="form-group col-md-6">
                  <label>Car Year</label>
                  <select
                      value={carYear}
                      onChange={(e) => setCarYear(e.target.value)}
                      className="form-control"
                      required
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                    ))}
                  </select>
                </div>

                <div className="form-group col-md-6">
                  <label>Car Make</label>
                  <select
                      value={carMake}
                      onChange={(e) => setCarMake(e.target.value)}
                      className="form-control"
                      required
                      disabled={!carYear || loading}
                  >
                    <option value="">Select Make</option>
                    {makes.map((make) => (
                        <option key={make.Make_ID} value={make.Make_Name}>
                          {make.Make_Name}
                        </option>
                    ))}
                  </select>
                </div>

                <div className="form-group col-md-6">
                  <label>Car Model</label>
                  <select
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      className="form-control"
                      required
                      disabled={!carMake || loading}
                  >
                    <option value="">Select Model</option>
                    {models.map((model) => (
                        <option key={model.Model_ID} value={model.Model_Name}>
                          {model.Model_Name}
                        </option>
                    ))}
                  </select>
                </div>

                <div className="form-group col-md-6">
                  <label>Email</label>
                  <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="form-control"
                      required
                  />
                </div>

                <div className="form-group col-md-6">
                  <label>Password</label>
                  <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="form-control"
                      required
                  />
                </div>

                <div>
                  <label htmlFor="password">Password:</label>
                  <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={handlePasswordChange}
                  />
                  <button type="button" onClick={toggleShowPassword}>
                    {showPassword ? 'Hide Password' : 'Show Password'}
                  </button>
                </div>

                <div className="form-group col-md-6">
                  <label>Password</label>
                  <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="form-control"
                      required
                  />
                </div>

                {error && (
                    <div className="text-red-500 text-sm mb-4">
                      {error}
                    </div>)}

              </div>

              <div className="container row justify-content-between">
                <button
                    type="submit"
                    className="btn my-4 font-weight-bold atlas-cta cta-green"
                    disabled={loading}
                >
                  Create Account
                </button>

                <h5 className="col-6 align-self-center text-right">
                  <Link to="/login" className="">
                    Return to Login...
                  </Link>
                </h5>
              </div>
            </form>
          </div>
        </div>
      </>
  );
};

export default SignUp;
