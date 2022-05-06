// TODO: is DOMPurify any smaller/faster?
import sanitizeHtml from "sanitize-html";

// TODO: is https://www.npmjs.com/package/autolinker more secure?
import anchorme from "anchorme";

const defaultOptions = {
  // prettier-ignore
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "div", "hr", "li", "ol",
    "p", "pre", "ul", "a", "b", "br","code", "em", "i", "small", "span", "u",
    "strong", "sub", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "tr",
    "img"
  ],
  disallowedTagsMode: "discard",
  allowedAttributes: {
    a: ["href", "name", "target"],
    img: ["src"],
    div: ["style"]
  },
  // Lots of these won't come up by default because we don't allow them
  selfClosing: ["img", "br", "hr", "area"],
  // URL schemes we permit
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  allowedSchemesAppliedToAttributes: ["href", "src", "cite"],
  allowProtocolRelative: true,
  enforceHtmlBoundary: false,
};

export function cleanHtml(html) {
  const cleanText = sanitizeHtml(html, defaultOptions);
  return anchorme({
    input: cleanText,
    options: {
      truncate: 30,
      middleTruncation: true,
      attributes: {
        target: "_blank",
      },
    },
  });
}
