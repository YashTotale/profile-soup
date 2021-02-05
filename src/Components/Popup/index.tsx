// React Imports
import React, { FC } from "react";
import { ProviderContext } from "notistack";
import { useClosableSnackbar, useSearchParams } from "../../Hooks";
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
import { Dialog } from "@material-ui/core";
import {} from "@material-ui/icons";

export interface PopupProps {
  firebaseInstance: ExtendedFirebaseInstance;
  snackbar: ProviderContext;
  params: ReturnType<typeof useSearchParams>;
}

const Popup: FC = () => {
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

export default Popup;
