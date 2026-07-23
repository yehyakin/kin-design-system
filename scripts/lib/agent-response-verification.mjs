import { expectedAgentResponses, responsePathsThatMustBeAbsent } from "./agent-pages.mjs";

export async function inspectAgentResponses({
  root,
  baseUrl,
  fetchImpl = fetch,
}) {
  const failures = [];
  const limitations = [];
  const { responses } = expectedAgentResponses(root);
  for (const [publicPath, expected] of responses) {
    const response = await fetchImpl(new URL(publicPath, baseUrl), {
      headers: { accept: expected.mediaType.split(";")[0] },
      redirect: "manual",
      cache: "no-store",
    });
    if (response.status !== 200) {
      failures.push(`${publicPath}: expected HTTP 200, received ${response.status}`);
      continue;
    }
    const actual = Buffer.from(await response.arrayBuffer());
    if (!actual.equals(expected.bytes)) failures.push(`${publicPath}: response bytes differ from ${expected.source}`);
    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    const expectedMediaType = expected.mediaType.split(";")[0].trim().toLowerCase();
    const actualMediaType = contentType.split(";")[0].trim();
    if (
      expectedMediaType === "text/markdown"
      && new Set(["text/plain", "application/octet-stream"]).has(actualMediaType)
    ) {
      limitations.push(`${publicPath}: host returned ${contentType || "no content-type"} instead of text/markdown; exact raw bytes were verified`);
    } else if (
      expectedMediaType === "application/schema+json"
      && actualMediaType === "application/json"
    ) {
      limitations.push(`${publicPath}: host returned application/json instead of application/schema+json; exact JSON Schema bytes were verified`);
    } else if (actualMediaType !== expectedMediaType) {
      failures.push(`${publicPath}: expected ${expectedMediaType}, received ${contentType || "no content-type"}`);
    }
  }
  for (const publicPath of responsePathsThatMustBeAbsent(root)) {
    const response = await fetchImpl(new URL(publicPath, baseUrl), {
      redirect: "manual",
      cache: "no-store",
    });
    if (response.status !== 404) failures.push(`${publicPath}: unpublished Agent path must return 404, received ${response.status}`);
  }
  return { failures, limitations, checked: responses.size };
}
