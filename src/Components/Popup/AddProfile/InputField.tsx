// React Imports
import React, { FC } from "react";
import { UseFormMethods } from "react-hook-form";

// Material UI Imports
import { capitalize, makeStyles, TextField } from "@material-ui/core";

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

export default InputField;
