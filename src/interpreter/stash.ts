import { Stack } from "../utils";
import { FunctionDesignator, TemporaryObject } from "./object";

export type StashItem = TemporaryObject | FunctionDesignator;

export const isTemporaryObject = (i: StashItem): i is TemporaryObject =>
  i instanceof TemporaryObject;

export const isFunctionDesignator = (i: StashItem): i is FunctionDesignator =>
  i instanceof FunctionDesignator;

export class Stash extends Stack<StashItem> {}
