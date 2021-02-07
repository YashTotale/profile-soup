// React Imports
import React, { FC } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ProviderContext } from "notistack";
import Badge from "../../Badge";
import { useSearchParams } from "../../../Hooks";
import InputField from "./InputField";

// Firebase Imports
import {
  ExtendedFirestoreInstance,
  FirebaseReducer,
} from "react-redux-firebase";
import { getProfileTypesArr } from "../../../Redux/firebase";

// Material UI Imports
import {
  Button,
  makeStyles,
  Tooltip,
  Typography,
  IconButton,
} from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";

const useDefaultProfilesStyles = makeStyles((theme) => ({
  heading: {
    position: "relative",
    margin: theme.spacing(2, 0, 0.5, 0),
    width: "85%",
    textAlign: "center",
    wordBreak: "break-word",
  },
  backArrow: {
    position: "absolute",
    top: "50%",
    left: "-13%",
    transform: "translate(0%,-50%)",
    padding: theme.spacing(1),
  },
  form: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  textField: {
    margin: theme.spacing(1, 0),
  },
  defaultProfiles: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    margin: theme.spacing(1, 0),
  },
}));

interface DefaultProfilesProps {
  firestore: ExtendedFirestoreInstance;
  user: FirebaseReducer.AuthState;
  snackbar: ProviderContext;
  profileTypes: ReturnType<typeof getProfileTypesArr>;
}

const DefaultProfiles: FC<DefaultProfilesProps> = ({
  firestore,
  user,
  snackbar,
  profileTypes,
}) => {
  const params = useSearchParams();
  const classes = useDefaultProfilesStyles();
  const { register, errors, watch, reset, handleSubmit } = useForm<
    Record<string, string>
  >();
  const createProfile = params.get("createProfile");

  const found = profileTypes.find(({ name }) => name === createProfile);

  if (found) {
    const vars = found.baseURL.match(/__([^__]*)__/g);
    const format = (str: string) => str.replace(new RegExp("_", "g"), "");

    if (vars === null) return null;

    return (
      <>
        <Typography className={classes.heading} variant="h5">
          <Tooltip title="View all Default Profiles">
            <IconButton
              className={classes.backArrow}
              onClick={() => params.delete("createProfile")}
            >
              <ArrowBack fontSize="small" />
            </IconButton>
          </Tooltip>
          Add Your {createProfile} Profile
        </Typography>
        <form
          className={classes.form}
          onSubmit={handleSubmit((d) => {
            const link = Object.entries(d).reduce(
              (link, [key, value]) =>
                link.replace(new RegExp(`__${key}__`, "g"), value),
              found.baseURL
            );

            const newProfile: Partial<typeof found> & {
              link: string;
              from: string;
            } = {
              ...found,
              from: found.id,
              link,
            };

            delete newProfile.baseURL;
            delete newProfile.id;

            firestore
              .collection(`users/${user.uid}/defaultProfiles`)
              .add(newProfile)
              .then(() => {
                reset();
                snackbar.enqueueSnackbar(
                  `Added '${newProfile.name}' Profile!`,
                  { variant: "success" }
                );
                params.delete("popup");
                params.delete("profileTab");
                params.delete("createProfile");
              })
              .catch((e) => {
                snackbar.enqueueSnackbar(`An error occurred: ${e}`);
              });
          })}
        >
          {vars.map((variable, i) => {
            return (
              <InputField
                key={i}
                name={format(variable)}
                errors={errors}
                register={register}
                minChars={2}
              />
            );
          })}
          <Badge
            {...found}
            link={vars.reduce(
              (link, variable) =>
                link.replace(
                  new RegExp(variable, "g"),
                  watch(format(variable), "")
                ),
              found.baseURL
            )}
          />
          <Button
            size="small"
            variant="contained"
            color="primary"
            type="submit"
            className={classes.addButton}
          >
            Add
          </Button>
        </form>
      </>
    );
  }

  return (
    <>
      <Typography variant="h5" className={classes.heading}>
        Add a Default Profile
      </Typography>
      <div className={classes.defaultProfiles}>
        {profileTypes.map((profile) => (
          <Link
            key={profile.id}
            to={() => {
              params.set("createProfile", profile.name, false);
              return {
                search: params.toString(),
              };
            }}
          >
            <Badge {...profile} />
          </Link>
        ))}
      </div>
    </>
  );
};

export default DefaultProfiles;
