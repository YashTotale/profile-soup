// React Imports
import React, { FC } from "react";
import { useForm } from "react-hook-form";
import { PopupProps } from "./index";
import Badge, { BadgeData } from "../Badge";

// Redux Imports
import { useSelector } from "react-redux";

// Firebase Imports
import { useFirestore } from "react-redux-firebase";
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
  Typography,
} from "@material-ui/core";
import {} from "@material-ui/icons";

const useStyles = makeStyles(() => ({
  content: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    paddingBottom: 0,
    textAlign: "center",
  },
}));

type ProfileTab = "custom" | "default";

const PROFILE_TABS: ProfileTab[] = ["default", "custom"];

const AddProfilePopup: FC<PopupProps> = ({ params }) => {
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
          value={"default" as ProfileTab}
          disabled={!profileTypes.length}
        ></Tab>
        <Tab label="Custom" value={"custom" as ProfileTab}></Tab>
      </Tabs>
      {profileTab === "custom" && <CustomProfile />}
      {profileTab === "default" && (
        <div>
          {profileTypes.map(({ name, id }) => (
            <h3 key={id}>{name}</h3>
          ))}
        </div>
      )}
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
  colorDiv: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    margin: theme.spacing(1, 0),
  },
  colorInput: {
    margin: theme.spacing(0, 0, 0, 1),
  },
  badge: {
    margin: theme.spacing(1, 0),
  },
}));

const CustomProfile: FC = () => {
  const firestore = useFirestore();
  const { register, handleSubmit, errors, watch } = useForm<BadgeData>();
  const classes = useCustomProfileStyles();

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
      <TextField
        name="link"
        label="Link"
        variant="outlined"
        size="small"
        inputRef={register({
          required: "Link is required",
          minLength: {
            message: "Link must be at least 6 characters",
            value: 6,
          },
        })}
        error={!!errors.link}
        helperText={errors.link?.message}
        fullWidth
        className={classes.textField}
      ></TextField>
      <div className={classes.colorDiv}>
        <Typography variant="body1">Color:</Typography>
        <input
          name="color"
          type="color"
          className={classes.colorInput}
          defaultValue="#5DADE2"
          ref={register({ required: "Color is required" })}
        ></input>
      </div>
      <Badge
        name={watch("name")}
        color={watch("color")}
        link={watch("link")}
        className={classes.badge}
      />
      <Button variant="contained" color="primary" type="submit">
        Create New Profile
      </Button>
    </form>
  );
};

export default AddProfilePopup;
