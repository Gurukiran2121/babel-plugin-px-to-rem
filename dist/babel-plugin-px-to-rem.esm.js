var pxToRemPlugin = function pxToRemPlugin(_ref) {
  var t = _ref.types;
  var BASE_FONT_SIZE = 16;
  var DEFAULT_PROPS = ["width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft", "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "top", "right", "bottom", "left", "border", "borderWidth", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "borderRadius", "outlineWidth", "lineHeight", "letterSpacing", "fontSize", "columnGap", "rowGap", "gap", "inset", "insetBlock", "insetInline", "objectPosition", "backgroundPosition", "backgroundSize", "boxShadow", "textShadow", "transform"];
  return {
    visitor: {
      ObjectExpression: function ObjectExpression(path, state) {
        var options = state.opts || {};
        var baseFontSize = options.baseFontSize || BASE_FONT_SIZE;
        var propertiesToConvert = options.properties || DEFAULT_PROPS;
        path.node.properties.forEach(function (property) {
          if (!t.isObjectProperty(property) || !t.isIdentifier(property.key)) return;
          var key = property.key.name;
          if (!propertiesToConvert.includes(key)) return;
          if (t.isStringLiteral(property.value) && property.value.value.endsWith("px")) {
            var pxValue = parseFloat(property.value.value.replace("px", ""));
            var remValue = pxValue / baseFontSize;
            property.value = t.stringLiteral("".concat(remValue, "rem"));
          }
          if (t.isNumericLiteral(property.value)) {
            var _remValue = property.value.value / baseFontSize;
            property.value = t.stringLiteral("".concat(_remValue, "rem"));
          }
          if (key === "transform" && t.isStringLiteral(property.value)) {
            var transformed = property.value.value.replace(/(\d+)px/g, function (match, p1) {
              return "".concat(parseFloat(p1) / baseFontSize, "rem");
            });
            property.value = t.stringLiteral(transformed);
          }
          if ((key === "boxShadow" || key === "textShadow") && t.isStringLiteral(property.value)) {
            var _transformed = property.value.value.replace(/(\d+)px/g, function (match, p1) {
              return "".concat(parseFloat(p1) / baseFontSize, "rem");
            });
            property.value = t.stringLiteral(_transformed);
          }
        });
      }
    }
  };
};

// Export in both CommonJS & ES Modules
if (typeof module !== "undefined") {
  module.exports = pxToRemPlugin; // CommonJS export
}
 // ES Modules export

export { pxToRemPlugin as default };
