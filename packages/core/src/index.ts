import { coreTypes, XrplDefinitionsBase } from "xahau-binary-codec";

export type { XrplDefinitionsBase } from "xahau-binary-codec";
export { buildHookTx } from "./buildHookTx";
export type { EncodedValue, EncodedValues } from "./txJsonToEncodedValues";
export { txJsonToEncodedValues } from "./txJsonToEncodedValues";

/** Build definitions from a `server_definitions` response (with or without the `{ result }` wrapper). */
export function definitionsFromJson(json: unknown): XrplDefinitionsBase {
  const res = json as any;
  const defJson =
    Object.keys(res).length === 1 && res.result ? res.result : res;
  return new XrplDefinitionsBase(defJson, coreTypes);
}
