// React Imports
import React, { FC } from "react";

// Redux Imports
import { useSelector } from "react-redux";
import { useAppDispatch } from "../Store";
import { togglePopup } from "../Redux/popup.slice";

// Firebase Imports
import { getUser } from "../Redux/firebase";

// Material UI Imports
import {
  AppBar,
  CircularProgress,
  IconButton,
  Toolbar,
  makeStyles,
  Tooltip,
  Avatar,
} from "@material-ui/core";
import { Person } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  avatar: {
    cursor: "pointer",
  },
}));

interface NavBarProps {}

const NavBar: FC<NavBarProps> = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const user = useSelector(getUser);

  return (
    <AppBar
      elevation={2}
      color="transparent"
      position="static"
      variant="elevation"
    >
      <Toolbar>
        {!user.isLoaded ? (
          <CircularProgress />
        ) : user.isEmpty ? (
          <Tooltip title="Login">
            <IconButton
              onClick={() =>
                dispatch(togglePopup({ open: true, type: "login" }))
              }
            >
              <Person />
            </IconButton>
          </Tooltip>
        ) : (
          <Avatar
            alt={user.displayName ?? "Profile Picture"}
            src={user.photoURL ?? undefined}
            variant="circular"
            className={classes.avatar}
          />
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
