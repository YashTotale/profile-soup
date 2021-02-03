// React Imports
import React, { FC } from "react";
import { useClosableSnackbar } from "../Hooks";

// Redux Imports
import { useSelector } from "react-redux";
import { AppDispatch, useAppDispatch } from "../Store";
import { getPopupOpen, getPopupType, togglePopup } from "../Redux/popup.slice";

// Firebase Imports
import firebase from "firebase/app";
import { ExtendedFirebaseInstance, useFirebase } from "react-redux-firebase";
import { StyledFirebaseAuth } from "react-firebaseui";
import { getUser } from "../Redux/firebase";

// Material UI Imports
import {
  Dialog,
  DialogActions,
  DialogTitle,
  makeStyles,
} from "@material-ui/core";
import {} from "@material-ui/icons";
import { ProviderContext } from "notistack";

const useStyles = makeStyles((theme) => ({
  // Styles
}));

const Popup: FC = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const firebaseInstance = useFirebase();
  const user = useSelector(getUser);
  const snackbar = useClosableSnackbar();

  const open = useSelector(getPopupOpen);
  const type = useSelector(getPopupType);

  switch (type) {
    case "login": {
      if (!user.isEmpty && open) dispatch(togglePopup(false));

      return (
        <LoginPopup
          open={open}
          dispatch={dispatch}
          firebaseInstance={firebaseInstance}
          snackbar={snackbar}
        />
      );
    }
  }
};

interface PopupProps {
  open: boolean;
  dispatch: AppDispatch;
  firebaseInstance: ExtendedFirebaseInstance;
  snackbar: ProviderContext;
}

const LoginPopup: FC<PopupProps> = ({
  open,
  dispatch,
  firebaseInstance,
  snackbar,
}) => {
  return (
    <Dialog open={open} onClose={() => dispatch(togglePopup(false))}>
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
    </Dialog>
  );
};

export default Popup;
