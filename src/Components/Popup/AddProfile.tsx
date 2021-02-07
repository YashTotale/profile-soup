// React Imports
import React, { FC, useMemo } from "react";
import { Link } from "react-router-dom";
import { Controller, useForm, UseFormMethods } from "react-hook-form";
import Select, {
  components,
  MenuListComponentProps,
  OptionProps,
} from "react-select";
import { FixedSizeList } from "react-window";
import SVG from "react-inlinesvg";
import simpleIcons, { SimpleIcon } from "simple-icons";
import { PopupProps } from "./index";
import Badge, { BadgeData } from "../Badge";
import { useClosableSnackbar, useSearchParams } from "../../Hooks";

// Redux Imports
import { useSelector } from "react-redux";

// Firebase Imports
import {
  ExtendedFirestoreInstance,
  FirebaseReducer,
  useFirestore,
} from "react-redux-firebase";
import { getProfileTypesArr, getUser } from "../../Redux/firebase";

// Material UI Imports
import {
  Button,
  capitalize,
  CircularProgress,
  DialogContent,
  DialogTitle,
  makeStyles,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  IconButton,
} from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import { ProviderContext } from "notistack";

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
  const classes = useStyles();
  const firestore = useFirestore();
  const user = useSelector(getUser);
  const params = useSearchParams();
  const snackbar = useClosableSnackbar();
  const profileTypes = useSelector(getProfileTypesArr);

  const wrapper = (children: JSX.Element) => (
    <>
      <DialogTitle className={classes.title}>Add a New Profile</DialogTitle>
      <DialogContent className={classes.content}>{children}</DialogContent>
    </>
  );

  if (profileTypes === undefined) return wrapper(<CircularProgress />);

  const icons = Object.keys(simpleIcons).map(simpleIcons.get);

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
      {profileTab === "custom" && (
        <CustomProfile
          user={user}
          firestore={firestore}
          snackbar={snackbar}
          icons={icons}
        />
      )}
      {profileTab === "default" && (
        <DefaultProfiles
          user={user}
          firestore={firestore}
          snackbar={snackbar}
          profileTypes={profileTypes}
        />
      )}
    </>
  );
};

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

            const newProfile: Partial<typeof found> & { link: string } = {
              ...found,
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

const useCustomProfileStyles = makeStyles((theme) => ({
  heading: {
    margin: theme.spacing(2, 0, 0.5, 0),
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
  colorDiv: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    margin: theme.spacing(1, 0),
  },
  iconSelect: {
    width: "100%",
    margin: theme.spacing(1, 0),
  },
  colorInput: {
    margin: theme.spacing(0, 0, 0, 1),
  },
  optionDiv: {
    display: "flex",
    alignItems: "center",
  },
  optionIcon: {
    width: "1.5rem",
    height: "1.5rem",
    margin: theme.spacing(0, 1, 0, 0),
  },
  optionIconLoading: {
    width: "0.5rem",
    height: "0.5rem",
    margin: theme.spacing(0, 1, 0, 0),
  },
  badge: {
    margin: theme.spacing(1, 0),
  },
  createButton: {
    margin: theme.spacing(1, 0),
  },
}));

interface CustomProfileProps {
  firestore: ExtendedFirestoreInstance;
  user: FirebaseReducer.AuthState;
  snackbar: ProviderContext;
  icons: SimpleIcon[];
}

type FormData = Omit<BadgeData, "icon"> & {
  icon: { label: string; value: string; svg: string } | null;
};

const CustomProfile: FC<CustomProfileProps> = ({
  firestore,
  user,
  snackbar,
  icons,
}) => {
  const params = useSearchParams();
  const {
    register,
    handleSubmit,
    errors,
    control,
    watch,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      icon: null,
    },
  });
  const classes = useCustomProfileStyles();
  const options = useMemo(
    () =>
      icons.map((icon) => {
        return {
          value: icon.title.toLowerCase().replace(" ", "-"),
          label: icon.title,
          svg: icon.svg,
        };
      }),
    [icons]
  );

  return (
    <>
      <Typography variant="h5" className={classes.heading}>
        Create a Custom Profile
      </Typography>
      <form
        onSubmit={handleSubmit((d) => {
          const newProfile = {
            ...d,
            icon: d.icon === null ? null : d.icon.label,
          };

          firestore
            .collection(`users/${user.uid}/customProfiles`)
            .add(newProfile)
            .then(() => {
              reset();
              snackbar.enqueueSnackbar(`Created new profile '${d.name}'!`, {
                variant: "success",
              });
              params.delete("popup");
              params.delete("profileTab");
            })
            .catch((e) => {
              snackbar.enqueueSnackbar(`An error occurred: ${e}`);
            });
        })}
        className={classes.form}
      >
        <InputField
          name="name"
          register={register}
          errors={errors}
          minChars={2}
        />
        <InputField
          name="link"
          register={register}
          errors={errors}
          minChars={6}
        />
        <Controller
          name="icon"
          render={({ onChange, onBlur, value }) => (
            <Select
              onBlur={onBlur}
              onChange={onChange}
              value={value}
              placeholder="Icon"
              options={options}
              components={{ Option, MenuList }}
              className={classes.iconSelect}
              isClearable
            />
          )}
          control={control}
        />
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
          icon={watch("icon")?.label ?? null}
          className={classes.badge}
        />
        <Button
          size="small"
          variant="contained"
          color="primary"
          type="submit"
          className={classes.createButton}
        >
          Create
        </Button>
      </form>
    </>
  );
};

const MenuList: FC<MenuListComponentProps<any, false, any>> = ({
  options,
  children,
  maxHeight,
  getValue,
}) => {
  const height = 50;
  const [value] = getValue();
  const initialOffset = options.indexOf(value) * height;

  return (
    <FixedSizeList
      height={maxHeight}
      itemCount={Array.isArray(children) ? children.length : 1}
      itemSize={height}
      initialScrollOffset={initialOffset}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {Array.isArray(children) ? children[index] : children}
        </div>
      )}
    </FixedSizeList>
  );
};

const Option: FC<OptionProps<any, false, any>> = (props) => {
  const classes = useCustomProfileStyles();

  return (
    <components.Option {...props}>
      <div className={classes.optionDiv}>
        <SVG
          src={props.data.svg}
          className={classes.optionIcon}
          loader={<CircularProgress className={classes.optionIconLoading} />}
        />
        {props.label}
      </div>
    </components.Option>
  );
};

const useInputFieldStyles = makeStyles((theme) => ({
  inputField: {
    margin: theme.spacing(1, 0),
  },
}));

interface InputFieldProps {
  name: string;
  errors: UseFormMethods["errors"];
  register: UseFormMethods["register"];
  minChars?: number;
  required?: boolean;
}

const InputField: FC<InputFieldProps> = ({
  name,
  errors,
  register,
  minChars = 2,
  required = true,
}) => {
  const classes = useInputFieldStyles();
  const capitalized = capitalize(name);
  return (
    <TextField
      name={name}
      label={capitalized}
      variant="outlined"
      size="small"
      inputRef={register({
        required: required ? `${capitalized} is required` : undefined,
        minLength: {
          message: `${capitalized} must be at least ${minChars} characters`,
          value: minChars,
        },
      })}
      error={!!errors[name]}
      helperText={errors[name]?.message}
      fullWidth
      className={classes.inputField}
    ></TextField>
  );
};

export default AddProfilePopup;
