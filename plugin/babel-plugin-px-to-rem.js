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


  const SVG_PROPS = [
    "width", "height",
    "x", "y", "cx", "cy", "r", "rx", "ry",
    "x1", "x2", "y1", "y2",
    "strokeWidth", "strokeDasharray", "strokeDashoffset",
    "fontSize", "letterSpacing",
    "baselineShift", "kerning",
    "wordSpacing",
    "markerHeight", "markerWidth",
    "refX", "refY",
    "pathLength",
    "points", // For polygon and polyline
    "d" // For path
  ];

  const convertValueToRem = (value, baseFontSize) => {
    if (typeof value === 'number') {
      return value / baseFontSize;
    }
    if (typeof value === 'string' && value.endsWith('px')) {
      return parseFloat(value.replace('px', '')) / baseFontSize;
    }
    return null;
  };

  const processStyleValue = (value, baseFontSize, path) => {
    if (t.isStringLiteral(value)) {
      const remValue = convertValueToRem(value.value, baseFontSize);
      if (remValue !== null) {
        return t.stringLiteral(`${remValue}rem`);
      }
    }
    if (t.isNumericLiteral(value)) {
      return t.templateLiteral(
        [t.templateElement({ raw: '', cooked: '' }), t.templateElement({ raw: 'rem', cooked: 'rem' }, true)],
        [t.binaryExpression('/', value, t.numericLiteral(baseFontSize))]
      );
    }
    if (t.isIdentifier(value)) {
      // Add runtime conversion function that handles both number and string cases
      return t.callExpression(
        t.arrowFunctionExpression(
          [t.identifier('val')],
          t.blockStatement([
            // Return early if value is null or undefined
            t.ifStatement(
              t.binaryExpression('==', t.identifier('val'), t.nullLiteral()),
              t.returnStatement(t.identifier('val'))
            ),
            // Handle number type
            t.ifStatement(
              t.binaryExpression(
                '===',
                t.unaryExpression('typeof', t.identifier('val')),
                t.stringLiteral('number')
              ),
              t.returnStatement(
                t.templateLiteral(
                  [t.templateElement({ raw: '', cooked: '' }), t.templateElement({ raw: 'rem', cooked: 'rem' }, true)],
                  [t.binaryExpression('/', t.identifier('val'), t.numericLiteral(baseFontSize))]
                )
              )
            ),
            // Handle string type
            t.ifStatement(
              t.binaryExpression(
                '===',
                t.unaryExpression('typeof', t.identifier('val')),
                t.stringLiteral('string')
              ),
              t.blockStatement([
                // Return if already rem or em
                t.ifStatement(
                  t.logicalExpression(
                    '||',
                    t.callExpression(
                      t.memberExpression(t.identifier('val'), t.identifier('endsWith')),
                      [t.stringLiteral('rem')]
                    ),
                    t.callExpression(
                      t.memberExpression(t.identifier('val'), t.identifier('endsWith')),
                      [t.stringLiteral('em')]
                    )
                  ),
                  t.returnStatement(t.identifier('val'))
                ),
                // Convert px to rem
                t.ifStatement(
                  t.callExpression(
                    t.memberExpression(t.identifier('val'), t.identifier('endsWith')),
                    [t.stringLiteral('px')]
                  ),
                  t.returnStatement(
                    t.templateLiteral(
                      [t.templateElement({ raw: '', cooked: '' }), t.templateElement({ raw: 'rem', cooked: 'rem' }, true)],
                      [
                        t.binaryExpression(
                          '/',
                          t.callExpression(
                            t.identifier('parseFloat'),
                            [t.identifier('val')]
                          ),
                          t.numericLiteral(baseFontSize)
                        )
                      ]
                    )
                  )
                )
              ])
            ),
            // Return original value if no conversion needed
            t.returnStatement(t.identifier('val'))
          ])
        ),
        [value]
      );
    }
    return value;
  };

  return {
    visitor: {
      ObjectExpression(path, state) {
        const options = state.opts || {};
        const baseFontSize = options.baseFontSize || BASE_FONT_SIZE;
        const propertiesToConvert = options.properties || DEFAULT_PROPS;
        const includeNodeModules = options.includeNodeModules || false;
        const isConvertSvgs = options.isConvertSvgs || false;

        // Add SVG properties if isConvertSvgs is true
        const allPropertiesToConvert = isConvertSvgs 
          ? [...new Set([...propertiesToConvert, ...SVG_PROPS])]
          : propertiesToConvert;

        // Skip node_modules unless explicitly included
        if (!includeNodeModules && path.hub.file.opts.filename.includes("node_modules")) {
          return;
        }

        path.node.properties.forEach((property) => {
          if (!t.isObjectProperty(property) || !t.isIdentifier(property.key)) return;

          const key = property.key.name;

          if (!allPropertiesToConvert.includes(key)) return;

          property.value = processStyleValue(property.value, baseFontSize, path);
        });
      },
      JSXAttribute(path, state) {
        const options = state.opts || {};
        const baseFontSize = options.baseFontSize || BASE_FONT_SIZE;
        const propertiesToConvert = options.properties || DEFAULT_PROPS;
        const includeNodeModules = options.includeNodeModules || false;
        const isConvertSvgs = options.isConvertSvgs || false;

        // Add SVG properties if isConvertSvgs is true
        const allPropertiesToConvert = isConvertSvgs 
          ? [...new Set([...propertiesToConvert, ...SVG_PROPS])]
          : propertiesToConvert;

        // Skip node_modules unless explicitly included
        if (!includeNodeModules && path.hub.file.opts.filename.includes("node_modules")) {
          return;
        }

        const attrName = path.node.name.name;

        // Process style object
        if (attrName === 'style') {
          if (t.isJSXExpressionContainer(path.node.value)) {
            const expression = path.node.value.expression;
            if (t.isObjectExpression(expression)) {
              expression.properties.forEach((property) => {
                if (!t.isObjectProperty(property) || !t.isIdentifier(property.key)) return;

                const key = property.key.name;

                if (!allPropertiesToConvert.includes(key)) return;

                property.value = processStyleValue(property.value, baseFontSize, path);
              });
            }
          }
          return;
        }

        // Process SVG attributes if isConvertSvgs is true
        if (isConvertSvgs && allPropertiesToConvert.includes(attrName)) {
          // Handle direct values
          if (t.isStringLiteral(path.node.value) || t.isNumericLiteral(path.node.value)) {
            path.node.value = processStyleValue(path.node.value, baseFontSize, path);
          }
          // Handle expressions like width={width || 22}
          else if (t.isJSXExpressionContainer(path.node.value)) {
            const expr = path.node.value.expression;
            
            // Handle direct numbers/strings in expression containers
            if (t.isNumericLiteral(expr) || t.isStringLiteral(expr)) {
              path.node.value.expression = processStyleValue(expr, baseFontSize, path);
            }
            // Handle logical expressions like width={width || 22}
            else if (t.isLogicalExpression(expr)) {
              if (expr.operator === '||') {
                // Convert the right side fallback value if it's a number or string
                if (t.isNumericLiteral(expr.right) || t.isStringLiteral(expr.right)) {
                  expr.right = processStyleValue(expr.right, baseFontSize, path);
                }
              }
            }
            // Handle conditional expressions like width={isMobile ? 16 : 22}
            else if (t.isConditionalExpression(expr)) {
              if (t.isNumericLiteral(expr.consequent) || t.isStringLiteral(expr.consequent)) {
                expr.consequent = processStyleValue(expr.consequent, baseFontSize, path);
              }
              if (t.isNumericLiteral(expr.alternate) || t.isStringLiteral(expr.alternate)) {
                expr.alternate = processStyleValue(expr.alternate, baseFontSize, path);
              }
            }
          }
        }
      },
    },
  };
};

// ✅ CommonJS & ES Modules Compatibility
if (typeof exports !== "undefined") {
  module.exports = pxToRemPlugin; // CommonJS export
}

export default pxToRemPlugin; // ES Modules export
