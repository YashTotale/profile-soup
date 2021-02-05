import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../Store";

export type PopupType = "login" | "addProfile" | null;

export interface PopupState {
  open: boolean;
  type: PopupType;
}

export const initialPopupState: PopupState = {
  open: false,
  type: null,
};

const popupSlice = createSlice({
  name: "popup",
  initialState: initialPopupState,
  reducers: {
    togglePopup: (
      state,
      action: PayloadAction<PopupState | boolean | undefined>
    ) => {
      if (action.payload === undefined) return { ...state, open: !state.open };
      if (typeof action.payload === "boolean")
        return { ...state, open: action.payload };
      return {
        ...action.payload,
      };
    },
  },
});

// Actions
export const { togglePopup } = popupSlice.actions;

// Selectors
export const getPopupOpen = (state: RootState) => state.popup.open;
export const getPopupType = (state: RootState) => state.popup.type;

// Reducer
export const popupReducer = popupSlice.reducer;

export default popupSlice;
