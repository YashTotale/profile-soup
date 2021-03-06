// React Imports
import React, { FC } from "react";
import { PopupProps } from "../index";
import { useClosableSnackbar, useSearchParams } from "../../../Hooks";
import DefaultProfiles from "./DefaultProfiles";
import CustomProfile from "./CustomProfile";

// Redux Imports
import { useSelector } from "react-redux";

// Firebase Imports
import { useFirestore, useFirestoreConnect } from "react-redux-firebase";
import { getDefaultProfilesArr, getUser } from "../../../Redux/firebase";

// Material UI Imports
import {
  CircularProgress,
  DialogContent,
  DialogTitle,
  makeStyles,
  Tab,
  Tabs,
} from "@material-ui/core";

const useStyles = makeStyles(() => ({
  content: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },
  title: {
    paddingBottom: 0,
    textAlign: "center",
  },
}));

type ProfileTab = "custom" | "default";

const PROFILE_TABS: ProfileTab[] = ["default", "custom"];

const AddProfilePopup: FC<PopupProps> = () => {
  const user = useSelector(getUser);

  useFirestoreConnect({ collection: "defaultProfiles" });

  const classes = useStyles();
  const firestore = useFirestore();
  const params = useSearchParams();
  const snackbar = useClosableSnackbar();
  const defaultProfiles = useSelector(getDefaultProfilesArr);

  const wrapper = (children: JSX.Element) => (
    <>
      <DialogTitle className={classes.title}>Add a New Profile</DialogTitle>
      <DialogContent className={classes.content}>{children}</DialogContent>
    </>
  );

  if (defaultProfiles === undefined) return wrapper(<CircularProgress />);

  const profileTab = params.get("profileTab") as ProfileTab;

  // Checking if profileTab is a valid ProfileTab and if not, replace with a valid one
  if (!PROFILE_TABS.includes(profileTab)) {
    params.set("profileTab", defaultProfiles.length ? "default" : "custom");
  }

  // Checking if the tab is set to 'default' but no default types are available
  if (!defaultProfiles.length && profileTab === "default") {
    params.set("profileTab", "custom");
  }

  return wrapper(
    <>
      <Tabs
        value={profileTab}
        onChange={(e, val) => params.set("profileTab", val)}
      >
        <Tab
          label="Default"
          value={"default" as ProfileTab}
          disabled={!defaultProfiles.length}
        ></Tab>
        <Tab label="Custom" value={"custom" as ProfileTab}></Tab>
      </Tabs>
      {profileTab === "custom" && (
        <CustomProfile user={user} firestore={firestore} snackbar={snackbar} />
      )}
      {profileTab === "default" && (
        <DefaultProfiles
          user={user}
          firestore={firestore}
          snackbar={snackbar}
          defaultProfiles={defaultProfiles}
        />
      )}
    </>
  );
};

export default AddProfilePopup;
