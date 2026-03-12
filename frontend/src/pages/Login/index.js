import React, { useState, useEffect, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";

import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Grid,
  Box,
  Typography,
  Container,
  InputAdornment,
  IconButton,
  Link
} from '@material-ui/core';

import { LockOutlined, Visibility, VisibilityOff } from '@material-ui/icons';

import { makeStyles } from "@material-ui/core/styles";

import { i18n } from "../../translate/i18n";

import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";


import logo from "../../assets/logo.png";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: theme.palette.type === 'dark'
      ? "#202124"
      : "linear-gradient(135deg, #F5F7FA 0%, #C3CFE2 100%)",
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    borderRadius: 16,
    boxShadow: theme.palette.type === 'dark'
      ? "0px 10px 30px rgba(0, 0, 0, 0.5)"
      : "0px 10px 30px rgba(15, 47, 107, 0.1)",
  },
  logo: {
    width: "320px",
    height: "auto",
    marginBottom: theme.spacing(4),
    filter: "drop-shadow(0px 10px 15px rgba(15, 47, 107, 0.15))",
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(2),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    padding: theme.spacing(1.5),
    fontWeight: "bold",
    borderRadius: 12,
    background: "linear-gradient(135deg, #0F2F6B 0%, #2B6CB0 100%)",
    color: "#fff",
    boxShadow: "0px 6px 15px rgba(15, 47, 107, 0.4)",
    "&:hover": {
      background: "linear-gradient(135deg, #2B6CB0 0%, #0F2F6B 100%)",
      boxShadow: "0px 8px 20px rgba(15, 47, 107, 0.6)",
    }
  },
}));

const Login = () => {
  const classes = useStyles();

  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [customLogo, setCustomLogo] = useState(logo);
  const [customFooter, setCustomFooter] = useState("");
  const [allowSignup, setAllowSignup] = useState(false);

  const { handleLogin } = useContext(AuthContext);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const { data } = await api.get("/settings/public");
        if (data && Array.isArray(data)) {
          const logoUrl = data.find((s) => s.key === "appLogoLogin")?.value;
          const footerMsg = data.find((s) => s.key === "appFooterText")?.value;
          const userCreationSetting = data.find((s) => s.key === "userCreation")?.value;
          
          if (logoUrl) setCustomLogo(logoUrl);
          if (footerMsg) setCustomFooter(footerMsg);
          if (userCreationSetting === "enabled") setAllowSignup(true);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBranding();
  }, []);

  const handleChangeInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };

  return (
    <div className={classes.root}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <img
            src={customLogo}
            alt="Logo"
            className={classes.logo}
          />
          <Typography component="h1" variant="h5" style={{ fontWeight: 700, color: "#0F2F6B", marginBottom: "24px" }}>
            {i18n.t("login.title")}
          </Typography>
          <form className={classes.form} noValidate onSubmit={handlSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label={i18n.t("login.form.email")}
              name="email"
              value={user.email}
              onChange={handleChangeInput}
              autoComplete="email"
              autoFocus
              InputProps={{
                style: { borderRadius: 12 }
              }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label={i18n.t("login.form.password")}
              id="password"
              value={user.password}
              onChange={handleChangeInput}
              autoComplete="current-password"
              type={showPassword ? 'text' : 'password'}
              InputProps={{
                style: { borderRadius: 12 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((e) => !e)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              style={{ borderRadius: 12, padding: '12px', marginTop: '24px' }}
            >
              {i18n.t("login.buttons.submit")}
            </Button>
            {/* {allowSignup && (
              <Grid container justifyContent="center" style={{ marginTop: '16px' }}>
                <Grid item>
                  <Link
                    href="#"
                    variant="body2"
                    component={RouterLink}
                    to="/signup"
                    style={{ color: "#2B6CB0", fontWeight: 600 }}
                  >
                    {i18n.t("login.buttons.register")}
                  </Link>
                </Grid>
              </Grid>
            )} */}
          </form>
        </div>
      </Container>
    </div>
  );
};


export default Login;
