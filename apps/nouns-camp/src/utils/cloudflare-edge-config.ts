import { getCloudflareContext } from "@opennextjs/cloudflare";

const DEFAULT_BINDING_NAME = "EDGE_CONFIG";
const GET_OPTIONS = { type: "json" } as const;

type KVNamespaceGetOptions = {
  type?: "text" | "json" | "arrayBuffer" | "stream";
  cacheTtl?: number;
};

type CloudflareKVNamespace = {
  get<T>(key: string, type: "json"): Promise<T | null>;
  get<T>(key: string, options?: KVNamespaceGetOptions): Promise<T | null>;
};

async function resolveNamespace(): Promise<CloudflareKVNamespace> {
  const { env } = await getCloudflareContext({ async: true });
  if (!env) {
    throw new Error("Cloudflare environment bindings are not available in the current context.");
  }

  const bindingName = process.env.CLOUDFLARE_EDGE_CONFIG_BINDING ?? DEFAULT_BINDING_NAME;
  const candidate = env[bindingName];

  if (!candidate || typeof (candidate as CloudflareKVNamespace).get !== "function") {
    throw new Error(`Cloudflare KV binding \"${bindingName}\" is not available in the current context.`);
  }

  return candidate as CloudflareKVNamespace;
}

export async function get<T = unknown>(key: string): Promise<T | undefined> {
  const namespace = await resolveNamespace();
  const value = await namespace.get<T>(key, GET_OPTIONS);
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

const defaultExport = { get };
export default defaultExport;
