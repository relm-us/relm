import sanitizeHtml from "sanitize-html";

const defaultOptions = {
  // prettier-ignore
  allowedTags: [ "a" ],
  disallowedTagsMode: "discard",
  allowedAttributes: { a: ["href", "target"] },
  // URL schemes we permit
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: ["href"],
  allowProtocolRelative: false,
  enforceHtmlBoundary: false,
};

export function cleanLink(url) {
  const html: string = sanitizeHtml(`<a href="${url}"></a>`, defaultOptions);
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.firstChild as HTMLAnchorElement).href;
}
