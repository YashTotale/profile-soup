// React Imports
import React, { FC, Ref, useRef } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ProviderContext } from "notistack";
import Badge from "../../Badge";
import { useSearchParams } from "../../../Hooks";
import InputField from "./InputField";

// Redux Imports
import { useSelector } from "react-redux";

// Firebase Imports
import {
  ExtendedFirestoreInstance,
  FirebaseReducer,
} from "react-redux-firebase";
import { CreatedProfileType } from "../../../Store";
import {
  getDefaultProfilesArr,
  getExistingDefaultProfilesArr,
} from "../../../Redux/firebase";

// Material UI Imports
import {
  Button,
  makeStyles,
  Tooltip,
  Typography,
  IconButton,
  CircularProgress,
} from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
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
  defaultProfiles: ReturnType<typeof getDefaultProfilesArr>;
}

const DefaultProfiles: FC<DefaultProfilesProps> = ({
  firestore,
  user,
  snackbar,
  defaultProfiles,
}) => {
  const params = useSearchParams();
  const classes = useStyles();
  const added: Ref<string[]> = useRef([]);
  const existingDefaultProfiles = useSelector(getExistingDefaultProfilesArr);

  const { register, errors, watch, reset, handleSubmit } = useForm<
    Record<string, string>
  >();

  if (existingDefaultProfiles === undefined)
    return (
      <>
        <Title creating={false} />
        <CircularProgress />
      </>
    );

  const checkIfExists = (profile: typeof defaultProfiles[number]) =>
    existingDefaultProfiles.find((existing) => existing.from === profile.id);

  const createProfile = params.get("createProfile");

  const found = defaultProfiles.find(({ name }) => name === createProfile);

  if (found) {
    if (checkIfExists(found)) params.delete("createProfile");

    const vars = found.baseURL.match(/__([^__]*)__/g);
    const format = (str: string) => str.replace(new RegExp("_", "g"), "");
    const addToFirestore = (newProfile: CreatedProfileType) => {
      if (
        added.current &&
        !added.current.find((existing) => existing === newProfile.name)
      ) {
        added.current.push(newProfile.name);
        firestore
          .collection(`users/${user.uid}/defaultProfiles`)
          .add(newProfile)
          .then(() => {
            reset();
            snackbar.enqueueSnackbar(`Added '${newProfile.name}' Profile!`, {
              variant: "success",
            });
            params.delete("popup");
            params.delete("profileTab");
            params.delete("createProfile");
          })
          .catch((e) => {
            added.current?.splice(added.current?.indexOf(newProfile.name), 1);
            snackbar.enqueueSnackbar(`An error occurred: ${e}`);
          });
      }
    };

    if (vars === null) {
      const newProfile: Partial<typeof found> & CreatedProfileType = {
        ...found,
        link: found.baseURL,
        from: found.id,
      };
      delete newProfile.baseURL;
      delete newProfile.id;

      addToFirestore(newProfile);

      return null;
    }

    return (
      <>
        <Title creating={false} />
        <form
          className={classes.form}
          onSubmit={handleSubmit((d) => {
            const link = Object.entries(d).reduce(
              (link, [key, value]) =>
                link.replace(new RegExp(`__${key}__`, "g"), value),
              found.baseURL
            );

            const newProfile: Partial<typeof found> & CreatedProfileType = {
              ...found,
              from: found.id,
              link,
            };

            delete newProfile.baseURL;
            delete newProfile.id;

            addToFirestore(newProfile);
          })}
        >
          {vars.map((variable, i) => (
            <InputField
              key={i}
              name={format(variable)}
              errors={errors}
              register={register}
              minChars={2}
            />
          ))}
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

  const available = defaultProfiles.filter(
    (profile) => !checkIfExists(profile)
  );

  return (
    <>
      <Title creating={false} />
      <div className={classes.defaultProfiles}>
        {available.length ? (
          available.map((profile) => (
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
          ))
        ) : (
          <Typography>
            You have created all existing default profiles.
          </Typography>
        )}
      </div>
    </>
  );
};

interface TitleProps {
  creating: boolean;
}

const Title: FC<TitleProps> = ({ creating }) => {
  const params = useSearchParams();
  const classes = useStyles();
  const createProfile = params.get("createProfile");

  return !creating ? (
    <Typography variant="h5" className={classes.heading}>
      Add a Default Profile
    </Typography>
  ) : (
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
  );
};

export default DefaultProfiles;
