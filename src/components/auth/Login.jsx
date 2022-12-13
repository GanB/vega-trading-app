import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import "./Login.css";

export const Login = () => {
  const navigate = useNavigate();
  const [email, set] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    return fetch(`http://localhost:8088/users?email=${email}`)
      .then((res) => res.json())
      .then((foundUsers) => {
        if (foundUsers.length === 1) {
          const user = foundUsers[0];
          sessionStorage.setItem(
            "app_user",
            JSON.stringify({
              id: user.id,
              isRegisteredUser: true,
              fullName: user.fullName,
            })
          );

          navigate("/home");
        } else {
          window.alert("Invalid login");
        }
      });
  };

  const guestUserHandler = () => {
    sessionStorage.clear();
    sessionStorage.setItem(
      "app_user",
      JSON.stringify({ isRegisteredUser: false, fullName: "" })
    );
    navigate(`/home`);
  };

  return (
    <main className="container--login">
      <h1 className="app__title">Vega Trade</h1>
      <section className="form--login">
        <form onSubmit={handleLogin}>
          <h2>Log On</h2>

          <fieldset>
            <TextField
              type="email"
              required
              id="outlined-required"
              label="Email"
              className="form-control"
              onChange={(evt) => set(evt.target.value)}
              defaultValue={email}
            />
            {/* <label htmlFor="inputEmail"> Email address </label>
            <input
              type="email"
              value={email}
              onChange={(evt) => set(evt.target.value)}
              className="form-control"
              placeholder="Email address"
              required
              autoFocus
            /> */}
          </fieldset>
          <fieldset>
            {/* <button type="submit">Sign in</button> */}
            <Button type="submit" variant="contained">
              Log on
            </Button>
          </fieldset>
        </form>

        <section className="nav__links__container">
          <Stack spacing={2} direction="row">
            <Button
              className="link--register"
              variant="contained"
              onClick={() => navigate(`/register`)}
            >
              Open an account
            </Button>
            <Button
              className="link--guest--user"
              variant="outlined"
              onClick={guestUserHandler}
            >
              Continue Without Signing In
            </Button>
          </Stack>
          {/* <Link to="/register">Open an account</Link> */}
        </section>
        <section className="link--guest--user">
          {/* <Link to="/" onClick={guestUserHandler}>
            Continue Without Signing In
          </Link> */}
        </section>
      </section>
    </main>
  );
};
