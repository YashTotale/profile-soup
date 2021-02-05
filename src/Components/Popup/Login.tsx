// React Imports
import React, { FC } from "react";
import { PopupProps } from "./index";

// Redux Imports

// Firebase Imports
import firebase from "firebase/app";
import { StyledFirebaseAuth } from "react-firebaseui";

// Material UI Imports
import { DialogActions, DialogTitle } from "@material-ui/core";
import {} from "@material-ui/icons";

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

export default LoginPopup;
