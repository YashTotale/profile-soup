// React Imports
import React, { FC } from "react";
import { useSearchParams } from "../Hooks";

// Redux Imports
import { useSelector } from "react-redux";

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
import { AddCircleOutlineSharp, Person } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  toolbar: {
    justifyContent: "flex-end",
  },
  addProfile: {
    margin: theme.spacing(0, 2),
    fontSize: "1.7rem",
  },
  avatar: {
    cursor: "pointer",
  },
}));

const NavBar: FC = () => {
  const classes = useStyles();
  const user = useSelector(getUser);

  const params = useSearchParams();

  return (
    <AppBar
      elevation={2}
      color="transparent"
      position="static"
      variant="elevation"
    >
      <Toolbar className={classes.toolbar}>
        <Tooltip title="Add Profile">
          <IconButton
            onClick={() => params.set("popup", "addProfile")}
            className={classes.addProfile}
          >
            <AddCircleOutlineSharp fontSize="inherit" />
          </IconButton>
        </Tooltip>
        {!user.isLoaded ? (
          <CircularProgress />
        ) : user.isEmpty ? (
          <Tooltip title="Login">
            <IconButton onClick={() => params.set("popup", "login")}>
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
