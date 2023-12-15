import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLogin } from "../../hooks/useLogin";
import "./Home.css";
import NavSignUp from "../../components/NavBars/NavSignUp";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isLoading, userError, authError } = useLogin();

  async function handleSubmit(event) {
    event.preventDefault();
    await login(email, password);
  }

  useEffect(() => {
    return () => {};
  }, []);

  let statusComponent = null;
  if (authError != null) {
    statusComponent = (
      <div>Error while trying to login: {authError.toString()}</div>
    );
  } else if (userError != null) {
    statusComponent = (
      <div>Error while trying to fetch user info: {userError.toString()}</div>
    );
  } else if (isLoading) {
    statusComponent = <div>Connecting....</div>;
  }

  return (
    <div className="login-container anim">
      <div className="login">
        <h1>Log in</h1>
        <form className="log-in-form" onSubmit={handleSubmit}>
          <input
            className="input-login"
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          ></input>
          <input
            className="input-login"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          ></input>
          <div className="button-group">
            <button className="btn-login">Log in</button>
            <Link className="log-in-link" to="/user/signUp">
              Sign Up
            </Link>
          </div>
          <Link to="/user/recovery" className="link-style">
            Forgot password
          </Link>
        </form>
        {statusComponent}
      </div>
      <div className="content-container">
        <h1 className="title-content">HackYourFuture Graduation Project</h1>
        <p className="content-text">This is bla bla bla</p>
      </div>
    </div>
  );
}

const Home = () => {
  return (
    <div className="container">
      <NavSignUp />
      <Login />
    </div>
  );
};

export { Login, Home };
