function valueType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (Number.isInteger(value)) return "integer";
  return typeof value;
}

function matchesType(value, expected) {
  const types = Array.isArray(expected) ? expected : [expected];
  const actual = valueType(value);
  return types.some((type) => type === actual || (type === "number" && actual === "integer") || (type === "object" && actual === "object"));
}

function resolveReference(schema, rootSchema) {
  if (!schema.$ref) return schema;
  if (!schema.$ref.startsWith("#/$defs/")) throw new Error(`Unsupported Schema reference: ${schema.$ref}`);
  const name = schema.$ref.slice("#/$defs/".length);
  const resolved = rootSchema.$defs?.[name];
  if (!resolved) throw new Error(`Unknown Schema reference: ${schema.$ref}`);
  return resolved;
}

export function validateSchemaValue(value, schema, { rootSchema = schema, path = "$" } = {}) {
  const findings = [];
  const resolved = resolveReference(schema, rootSchema);

  if (resolved.allOf) {
    for (const candidate of resolved.allOf) {
      findings.push(...validateSchemaValue(value, candidate, { rootSchema, path }));
    }
  }

  if (resolved.oneOf) {
    const matches = resolved.oneOf.filter((candidate) => validateSchemaValue(value, candidate, { rootSchema, path }).length === 0);
    if (matches.length !== 1) findings.push(`${path}: must match exactly one oneOf branch`);
  }

  if (resolved.const !== undefined && !Object.is(value, resolved.const)) findings.push(`${path}: must equal ${JSON.stringify(resolved.const)}`);
  if (resolved.enum && !resolved.enum.some((candidate) => Object.is(value, candidate))) findings.push(`${path}: must be one of ${resolved.enum.join(", ")}`);
  if (resolved.type && !matchesType(value, resolved.type)) {
    findings.push(`${path}: expected ${Array.isArray(resolved.type) ? resolved.type.join(" or ") : resolved.type}, received ${valueType(value)}`);
    return findings;
  }

  if (typeof value === "string") {
    if (resolved.minLength !== undefined && value.length < resolved.minLength) findings.push(`${path}: string is shorter than ${resolved.minLength}`);
    if (resolved.maxLength !== undefined && value.length > resolved.maxLength) findings.push(`${path}: string is longer than ${resolved.maxLength}`);
    if (resolved.pattern && !new RegExp(resolved.pattern, "u").test(value)) findings.push(`${path}: string does not match ${resolved.pattern}`);
  }

  if (Array.isArray(value)) {
    if (resolved.minItems !== undefined && value.length < resolved.minItems) findings.push(`${path}: array has fewer than ${resolved.minItems} items`);
    if (resolved.maxItems !== undefined && value.length > resolved.maxItems) findings.push(`${path}: array has more than ${resolved.maxItems} items`);
    if (resolved.uniqueItems) {
      const serialized = value.map((item) => JSON.stringify(item));
      if (new Set(serialized).size !== serialized.length) findings.push(`${path}: array items must be unique`);
    }
    if (resolved.items) value.forEach((item, index) => findings.push(...validateSchemaValue(item, resolved.items, { rootSchema, path: `${path}[${index}]` })));
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const key of resolved.required ?? []) {
      if (!Object.hasOwn(value, key)) findings.push(`${path}: missing required property '${key}'`);
    }
    const properties = resolved.properties ?? {};
    for (const [key, child] of Object.entries(value)) {
      if (properties[key]) findings.push(...validateSchemaValue(child, properties[key], { rootSchema, path: `${path}.${key}` }));
      else if (resolved.additionalProperties === false) findings.push(`${path}: unknown property '${key}'`);
      else if (resolved.additionalProperties && typeof resolved.additionalProperties === "object") {
        findings.push(...validateSchemaValue(child, resolved.additionalProperties, { rootSchema, path: `${path}.${key}` }));
      }
    }
    if (resolved.minProperties !== undefined && Object.keys(value).length < resolved.minProperties) findings.push(`${path}: object has fewer than ${resolved.minProperties} properties`);
  }

  return findings;
}
