const pxToRemPlugin = ({ types: t }) => {
  const BASE_FONT_SIZE = 16;
  const DEFAULT_PROPS = [
    "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight",
    "margin", "marginTop", "marginRight", "marginBottom", "marginLeft",
    "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
    "top", "right", "bottom", "left",
    "border", "borderWidth", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
    "borderRadius", "outlineWidth",
    "lineHeight", "letterSpacing",
    "fontSize",
    "columnGap", "rowGap", "gap",
    "inset", "insetBlock", "insetInline",
    "objectPosition", "backgroundPosition", "backgroundSize",
    "boxShadow", "textShadow",
    "transform"
  ];

  return {
    visitor: {
      ObjectExpression(path, state) {
        const options = state.opts || {};
        const baseFontSize = options.baseFontSize || BASE_FONT_SIZE;
        const propertiesToConvert = options.properties || DEFAULT_PROPS;

        path.node.properties.forEach((property) => {
          if (!t.isObjectProperty(property) || !t.isIdentifier(property.key)) return;

          const key = property.key.name;

          if (!propertiesToConvert.includes(key)) return;

          if (t.isStringLiteral(property.value) && property.value.value.endsWith("px")) {
            const pxValue = parseFloat(property.value.value.replace("px", ""));
            const remValue = pxValue / baseFontSize;
            property.value = t.stringLiteral(`${remValue}rem`);
          }

          if (t.isNumericLiteral(property.value)) {
            const remValue = property.value.value / baseFontSize;
            property.value = t.stringLiteral(`${remValue}rem`);
          }

          if (key === "transform" && t.isStringLiteral(property.value)) {
            const transformed = property.value.value.replace(/([\d.]+)px/g, (match, p1) => {
              return `${parseFloat(p1) / baseFontSize}rem`;
            });
            property.value = t.stringLiteral(transformed);
          }

          if ((key === "boxShadow" || key === "textShadow") && t.isStringLiteral(property.value)) {
            const transformed = property.value.value.replace(/([\d.]+)px/g, (match, p1) => {
              return `${parseFloat(p1) / baseFontSize}rem`;
            });
            property.value = t.stringLiteral(transformed);
          }
        });
      },
    },
  };
};

// ✅ CommonJS & ES Modules Compatibility
if (typeof exports !== "undefined") {
  module.exports = pxToRemPlugin; // CommonJS export
}

export default pxToRemPlugin; // ES Modules export
