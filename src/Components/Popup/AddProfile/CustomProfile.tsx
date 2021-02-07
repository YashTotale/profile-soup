// React Imports
import React, { FC, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import Select, {
  components,
  MenuListComponentProps,
  OptionProps,
} from "react-select";
import { FixedSizeList } from "react-window";
import SVG from "react-inlinesvg";
import simpleIcons from "simple-icons";
import Badge, { BadgeData } from "../../Badge";
import { useSearchParams } from "../../../Hooks";
import InputField from "./InputField";

// Firebase Imports
import {
  ExtendedFirestoreInstance,
  FirebaseReducer,
} from "react-redux-firebase";

// Material UI Imports
import {
  Button,
  CircularProgress,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { ProviderContext } from "notistack";

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
}

type FormData = Omit<BadgeData, "icon"> & {
  icon: { label: string; value: string; svg: string } | null;
};

const CustomProfile: FC<CustomProfileProps> = ({
  firestore,
  user,
  snackbar,
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
      Object.keys(simpleIcons).map((iconName) => {
        const icon = simpleIcons.get(iconName);
        return {
          value: icon.title.toLowerCase().replace(" ", "-"),
          label: icon.title,
          svg: icon.svg,
        };
      }),
    []
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

export default CustomProfile;
