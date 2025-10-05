/* global KVNamespace */
import { getCloudflareContext } from "@opennextjs/cloudflare";

const DEFAULT_BINDING_NAME = "KV";
const GET_TYPE = "json" as const;

async function resolveNamespace(): Promise<KVNamespace> {
  const { env } = await getCloudflareContext({ async: true });
  if (!env) {
    throw new Error(
      "Cloudflare environment bindings are not available in the current context.",
    );
  }

  const bindingName =
    process.env.CLOUDFLARE_EDGE_CONFIG_BINDING ?? DEFAULT_BINDING_NAME;
  const runtimeEnv = env as unknown as Record<string, unknown>;
  const candidate = runtimeEnv[bindingName];

  if (!isKVNamespace(candidate)) {
    throw new Error(
      `Cloudflare KV binding '${bindingName}' is not available in the current context.`,
    );
  }

  return candidate;
}

export async function get<T = unknown>(key: string): Promise<T | undefined> {
  const namespace = await resolveNamespace();
  const value = await namespace.get<T>(key, GET_TYPE);
  if (value === null || value === undefined) {
    return undefined;
  }
  return deepFreeze(value);
}

function deepFreeze<T>(value: T): T {
  deepFreezeInternal(value, new WeakSet());
  return value;
}

function deepFreezeInternal(value: unknown, seen: WeakSet<object>): void {
  if (value === null || typeof value !== "object") {
    return;
  }

  const objectValue = value as Record<PropertyKey, unknown>;
  const record = objectValue as unknown as object;

  if (seen.has(record)) {
    return;
  }

  seen.add(record);

  for (const key of Reflect.ownKeys(objectValue)) {
    deepFreezeInternal(objectValue[key], seen);
  }

  Object.freeze(objectValue);
}

function isKVNamespace(value: unknown): value is KVNamespace {
  return (
    value != null &&
    typeof value === "object" &&
    typeof (value as KVNamespace).get === "function"
  );
}

const defaultExport = { get };
export default defaultExport;
