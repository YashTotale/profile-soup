// React Imports
import React, { FC } from "react";
import { useForm } from "react-hook-form";
import { PopupProps } from "./index";

// Redux Imports
import { useSelector } from "react-redux";

// Firebase Imports
import { useFirestore, useFirestoreConnect } from "react-redux-firebase";
import { getProfileTypesArr } from "../../Redux/firebase";

// Material UI Imports
import {
  Button,
  CircularProgress,
  DialogContent,
  DialogTitle,
  makeStyles,
  Tab,
  Tabs,
  TextField,
} from "@material-ui/core";
import {} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  content: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    paddingBottom: 0,
  },
}));

type ProfileTab = "custom" | "default";

const PROFILE_TABS: ProfileTab[] = ["default", "custom"];

const AddProfilePopup: FC<PopupProps> = ({ params }) => {
  useFirestoreConnect({ collection: "profileTypes" });

  const classes = useStyles();
  const profileTypes = useSelector(getProfileTypesArr);

  const wrapper = (children: JSX.Element) => (
    <>
      <DialogTitle className={classes.title}>Add a New Profile</DialogTitle>
      <DialogContent className={classes.content}>{children}</DialogContent>
    </>
  );

  if (profileTypes === undefined) return wrapper(<CircularProgress />);

  const profileTab = params.get("profileTab") as ProfileTab;

  // Checking if profileTab is a valid ProfileTab and if not, replace with a valid one
  if (!PROFILE_TABS.includes(profileTab)) {
    params.set("profileTab", profileTypes.length ? "default" : "custom");
  }

  // Checking if the tab is set to 'default' but no default types are available
  if (!profileTypes.length && profileTab === "default") {
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
          value="default"
          disabled={!profileTypes.length}
        ></Tab>
        <Tab label="Custom" value="custom"></Tab>
      </Tabs>
      {profileTab === "custom" && <CustomProfile />}
    </>
  );
};

const useCustomProfileStyles = makeStyles((theme) => ({
  form: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  textField: {
    margin: theme.spacing(1, 0),
  },
}));

const CustomProfile: FC = () => {
  const classes = useCustomProfileStyles();
  const firestore = useFirestore();
  const { register, handleSubmit, errors } = useForm();

  console.log(errors);

  return (
    <form
      onSubmit={handleSubmit((d) =>
        firestore.collection("profileTypes").add(d)
      )}
      className={classes.form}
    >
      <TextField
        name="name"
        label="Name"
        variant="outlined"
        size="small"
        inputRef={register({
          required: "Name is required",
          minLength: {
            message: "Name must be at least 2 characters",
            value: 2,
          },
        })}
        error={!!errors.name}
        helperText={errors.name?.message}
        fullWidth
        className={classes.textField}
      ></TextField>
      <Button variant="contained" color="primary" type="submit">
        Create New Profile
      </Button>
    </form>
  );
};

export default AddProfilePopup;
