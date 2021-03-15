import { writable, Writable } from "svelte-local-storage-store";
import { defaultIdentity } from "./defaultIdentity";
import { SharedIdentityFields } from "./types";

export const localstorageSharedFields: Writable<SharedIdentityFields> = writable(
  "identity",
  defaultIdentity.shared
);
