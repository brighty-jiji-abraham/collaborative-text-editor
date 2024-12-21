import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./SignupForm.css"; // Ensure the corresponding CSS file is updated for styling
import { FaLinkedin, FaInstagram, FaWhatsapp, FaGithub, FaTwitter } from "react-icons/fa";
import { Footer } from "../../components/Footer/Footer";
import { FaUser, FaUserAstronaut, FaEnvelope, FaLock, FaQuoteLeft, FaRegIdBadge } from "react-icons/fa6";

function SignupForm() {
  const [first_name, setFirstName] = useState("");
  const [middle_name, setMiddleName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");

  const [Username_focused, setUsernameFocused] = useState(false);
  const [password_focused, setPasswordFocused] = useState(false);
  const [email_focused, setEmailFocused] = useState(false);
  const [avatar_focused, setAvatarFocused] = useState(false);
  const [bio_focused, setBioFocused] = useState(false);
  const [first_name_focused, setFirstNameFocused] = useState(false);
  const [middle_name_focused, setMiddleNameFocused] = useState(false);
  const [last_name_focused, setLastNameFocused] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/api/user/signup",
        {
          first_name,
          middle_name,
          last_name,
          username,
          email,
          bio,
          avatar,
          password,
        }
      );
      console.log("Signup successful:", response.data);
      // After successful signup, navigate to the login page
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error during signup:", error);
      // Handle error (e.g., show error message)
    }
  };

  return (
    <>
      <div className="main-container-signup">
        <div className="signup-form-container">
          <div className="form-title">
            <h1>Signup</h1>
            <p className="message"></p>
          </div>
          <div className="form-content">
            <form onSubmit={handleSubmit}>
              <div className="form-group-signup">
                <div className="form-inputs">
                  <FaUser
                    className={`form-icon ${
                      first_name_focused ||
                      middle_name_focused ||
                      last_name_focused
                        ? "focused"
                        : ""
                    }`}
                  />
                  <div className="name-fields">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      onChange={(e) => setFirstName(e.target.value)}
                      onFocus={() => setFirstNameFocused(true)}
                      onBlur={() => setFirstNameFocused(false)}
                      value={first_name}
                      required
                    />
                    <input
                      type="text"
                      name="middleName"
                      placeholder="Middle Name"
                      onChange={(e) => setMiddleName(e.target.value)}
                      onFocus={() => setMiddleNameFocused(true)}
                      onBlur={() => setMiddleNameFocused(false)}
                      value={middle_name}
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      onChange={(e) => setLastName(e.target.value)}
                      onFocus={() => setLastNameFocused(true)}
                      onBlur={() => setLastNameFocused(false)}
                      value={last_name}
                    />
                  </div>
                </div>
                <div className="form-inputs">
                  <FaEnvelope
                    className={`form-icon ${email_focused ? "focused" : ""}`}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    value={email}
                    required
                  />
                </div>
                <div className="form-inputs">
                  <FaUserAstronaut
                    className={`form-icon ${Username_focused ? "focused" : ""}`}
                  />
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setUsernameFocused(true)}
                    onBlur={() => setUsernameFocused(false)}
                    value={username}
                    required
                  />
                </div>
                <div className="form-inputs">
                  <FaLock
                    className={`form-icon ${password_focused ? "focused" : ""}`}
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="password"
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    value={password}
                    required
                  />
                </div>
                <div className="form-inputs">
                  <FaQuoteLeft
                    className={`form-icon ${bio_focused ? "focused" : ""}`}
                  />
                  <textarea
                    name="bio"
                    placeholder="Bio"
                    onChange={(e) => setBio(e.target.value)}
                    onFocus={() => setBioFocused(true)}
                    onBlur={() => setBioFocused(false)}
                    value={bio}
                  />
                </div>
                <div className="form-inputs">
                  <FaRegIdBadge
                    className={`form-icon ${avatar_focused ? "focused" : ""}`}
                  />
                  <input
                    type="text"
                    name="avatar"
                    placeholder="Avatar URL"
                    onChange={(e) => setAvatar(e.target.value)}
                    onFocus={() => setAvatarFocused(true)}
                    onBlur={() => setAvatarFocused(false)}
                    value={avatar}
                  />
                </div>
              </div>
              <button type="submit">Sign Up</button>
            </form>
          </div>

          <div className="Login">
            Already have an account? <a href="/login">Login</a>
          </div>

          <div className="social-media-buttons">
            <a href="https://twitter.com/B_J_A_008" target="_blank" rel="noopener noreferrer" >
              <FaTwitter className="social-icon" />
            </a>
            <a href="https://www.linkedin.com/in/brightyjijiabraham/" target="_blank" rel="noopener noreferrer">
              <FaLinkedin className="social-icon" />
            </a>
            <a href="https://www.instagram.com/brighty.jiji.abraham/" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="social-icon" />
            </a>
            <a href="https://wa.me/+919207863690" target="_blank" rel="noopener noreferrer">
              <FaWhatsapp className="social-icon" />
            </a>
            <a href="https://github.com/Brighty-Jiji-Abraham" target="_blank" rel="noopener noreferrer">
              <FaGithub className="social-icon" />
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default SignupForm;
