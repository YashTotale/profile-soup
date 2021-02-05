import { useHistory, useLocation } from "react-router-dom";

export type KnownParams = "popup" | "profileTab";

const useSearchParams = () => {
  const { search } = useLocation();
  const history = useHistory();

  class Params extends URLSearchParams {
    set(name: KnownParams, value: string) {
      super.set(name, value);
      history.push({ search: super.toString() });
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
