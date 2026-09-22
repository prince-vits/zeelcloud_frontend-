// Central registry for all Zustand stores to enable a global reset during account switching
type ResetFunction = () => void;

const storeResets: ResetFunction[] = [];

export const registerStoreReset = (resetFn: ResetFunction) => {
  storeResets.push(resetFn);
};

export const resetAllStores = () => {
  storeResets.forEach((reset) => reset());
};
