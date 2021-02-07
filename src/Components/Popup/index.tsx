// React Imports
import React, { FC } from "react";
import { ProviderContext } from "notistack";
import { Params, useClosableSnackbar, useSearchParams } from "../../Hooks";
import AddProfilePopup from "./AddProfile";
import LoginPopup from "./Login";

// Redux Imports
import { useSelector } from "react-redux";

// Firebase Imports
import {
  ExtendedFirebaseInstance,
  FirebaseReducer,
  useFirebase,
} from "react-redux-firebase";
import { getUser } from "../../Redux/firebase";

// Material UI Imports
import { Dialog, makeStyles } from "@material-ui/core";
import {} from "@material-ui/icons";

export interface PopupProps {
  firebaseInstance: ExtendedFirebaseInstance;
  snackbar: ProviderContext;
}

const useStyles = makeStyles(() => ({
  paper: {
    overflowY: "visible",
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
  };

  const popup = createPopup(type, props, params, user);

  return (
    <Dialog
      open={popup !== null}
      onClose={() => params.delete("popup")}
      PaperProps={{ className: classes.paper }}
    >
      {popup}
    </Dialog>
  );
};

const createPopup = (
  type: string | null,
  props: PopupProps,
  params: Params,
  user: FirebaseReducer.AuthState
) => {
  switch (type) {
    case "login": {
      if (user.isLoaded && !user.isEmpty) params.delete("popup");

      return <LoginPopup {...props} />;
    }
    case "addProfile": {
      if (user.isLoaded && user.isEmpty) params.delete("popup");

      return <AddProfilePopup {...props} />;
    }
    default: {
      return null;
    }
  }
};

export default Popup;
