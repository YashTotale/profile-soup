import { useHistory, useLocation } from "react-router-dom";

export type KnownParams = "popup" | "profileTab" | "createProfile";

export interface Params extends URLSearchParams {
  set(name: KnownParams, value: string, update?: boolean): void;
  delete(name: KnownParams): void;
  get(name: KnownParams): string | null;
}

const useSearchParams = (): Params => {
  const { search } = useLocation();
  const history = useHistory();

  class Params extends URLSearchParams {
    set(name: KnownParams, value: string, update = true) {
      super.set(name, value);
      if (update) history.push({ search: super.toString() });
    }
    delete(name: KnownParams) {
      super.delete(name);
      history.push({ search: super.toString() });
    }
    get(name: KnownParams) {
      return super.get(name);
    }
  }

  const searchParams = new Params(search);

  return searchParams;
};

export default useSearchParams;
