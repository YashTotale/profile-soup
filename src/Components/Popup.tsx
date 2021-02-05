// React Imports
import React, { FC } from "react";
import { Link as RouterLink } from "react-router-dom";
import { ProviderContext } from "notistack";
import { useClosableSnackbar, useSearchParams } from "../Hooks";

// Redux Imports
import { useSelector } from "react-redux";

// Firebase Imports
import firebase from "firebase/app";
import {
  ExtendedFirebaseInstance,
  FirebaseReducer,
  useFirebase,
  useFirestoreConnect,
} from "react-redux-firebase";
import { StyledFirebaseAuth } from "react-firebaseui";
import { getProfileTypesArr, getUser } from "../Redux/firebase";

// Material UI Imports
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Tab,
  Tabs,
} from "@material-ui/core";
import {} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  addProfileContent: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
}));

const Popup: FC = () => {
  const classes = useStyles();
  const firebaseInstance = useFirebase();
  const user = useSelector(getUser);

  const params = useSearchParams();
  const type = params.get("popup");

  const snackbar = useClosableSnackbar();

  const props: PopupProps = {
    firebaseInstance,
    snackbar,
    params,
  };

  const popup = createPopup(type, props, user);

  return (
    <Dialog open={popup !== null} onClose={() => params.delete("popup")}>
      {popup}
    </Dialog>
  );
};

const createPopup = (
  type: string | null,
  props: PopupProps,
  user: FirebaseReducer.AuthState
) => {
  switch (type) {
    case "login": {
      if (user.isLoaded && !user.isEmpty) props.params.delete("popup");

      return <LoginPopup {...props} />;
    }
    case "addProfile": {
      if (user.isLoaded && user.isEmpty) props.params.delete("popup");

      return <AddProfilePopup {...props} />;
    }
    default: {
      return null;
    }
  }
};

interface PopupProps {
  firebaseInstance: ExtendedFirebaseInstance;
  snackbar: ProviderContext;
  params: ReturnType<typeof useSearchParams>;
}

const LoginPopup: FC<PopupProps> = ({ firebaseInstance, snackbar, params }) => {
  return (
    <>
      <DialogTitle>
        Sign in with Google to start creating your Profile Soup!
      </DialogTitle>
      <DialogActions>
        <StyledFirebaseAuth
          firebaseAuth={firebaseInstance.auth()}
          uiConfig={{
            signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
            signInFlow: "popup",
            callbacks: {
              signInSuccessWithAuthResult(result) {
                const isNew = result.additionalUserInfo.isNewUser;
                if (isNew) {
                  const name = result.additionalUserInfo.profile.name;
                  snackbar.enqueueSnackbar(
                    `Welcome to Profile Soup, ${name}!`,
                    {
                      variant: "default",
                      autoHideDuration: 6000,
                    }
                  );
                }
                return true;
              },
              async signInFailure(err) {
                snackbar.enqueueSnackbar(err.toString(), {
                  variant: "error",
                  autoHideDuration: 4000,
                });
              },
            },
          }}
        />
      </DialogActions>
    </>
  );
};

const AddProfilePopup: FC<PopupProps> = ({ params }) => {
  useFirestoreConnect({ collection: "profileTypes" });

  const classes = useStyles();
  const profileTypes = useSelector(getProfileTypesArr);

  const profileTab = params.get("profileTab");

  return (
    <>
      <DialogTitle>Add a New Profile</DialogTitle>
      <DialogContent className={classes.addProfileContent}>
        {profileTypes === undefined ? (
          <CircularProgress />
        ) : (
          <Tabs
            value={profileTab ?? (profileTypes.length ? "default" : "custom")}
            onChange={(e, val) => params.set("profileTab", val)}
          >
            <Tab
              label="Default"
              value="default"
              disabled={!profileTypes.length}
            ></Tab>
            <Tab label="Custom" value="custom"></Tab>
          </Tabs>
        )}
      </DialogContent>
    </>
  );
};

export default Popup;
