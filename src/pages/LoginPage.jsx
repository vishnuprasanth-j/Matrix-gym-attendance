import { useState } from "react";
import "../styles/LoginPage.css";
import { db,signInUser } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate,useParams } from "react-router-dom";

const LoginPage = () => {
  const {type}=useParams()
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    branch: "",
    role: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.role == "trainer") {
      if(type!="members"){
        setError("Access Denied: You do not have permission to view this page.")
        return;
      }
      if (!formData.branch) {
        setError("Please select a branch.");
        return;
      }
    }

    try {
      if (formData.role == "trainer") {
        const user = await getUserByEmail(formData.email);
        if (!user) {
          setError("User not found.");
          return;
        }
        if (user.branch !== formData.branch) {
          setError("User does not belong to the selected branch.");
          return;
        }
      }

      await signInUser(
        formData.email,
        formData.password
      );
      if(formData.role=="trainer"){
        navigate(`/Members/${formData.branch}`,{ replace: true });
      }else{
        navigate(`/Dashboard`);
      }

      setError("");
    } catch (error) {
      setError("Invalid email or password.");
      console.error("Authentication error:", error);
    }
  };

  const getUserByEmail = async (email) => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userData = querySnapshot.docs
        .map((doc) => doc.data())
        .find((data) => data.email === email);
      return userData;
    } catch (error) {
      console.error("Error getting user by email:", error);
      throw error;
    }
  };

  return (
    <section className="login-container">
      <div className="container login-form">
        <div className="title">Login</div>
        <form onSubmit={handleSubmit}>
          <div className="user_details">
            <div className="input_pox">
              <span className="details">Email</span>
              <input
                type="text"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input_pox">
              <span className="details">Password</span>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="input_pox">
              <span className="details">Role</span>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="form-input"
              >
                <option value="">Select Role</option>
                <option value="trainer">Trainer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {formData.role == "trainer" && (
              <div className="input_pox">
                <span className="details">Branch</span>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select Branch</option>
                  <option value="branch1">Branch 1(Jaycees)</option>
                  <option value="branch2">Branch 2()</option>
                </select>
              </div>
            )}
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-button">
            Login
          </button>
        </form>
      </div>
    </section>
  );
};

export default LoginPage;
