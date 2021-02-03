import { RootState } from "../Store";

export const getUser = (state: RootState) => state.firebase.auth;
