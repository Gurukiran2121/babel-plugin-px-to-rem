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

        // Skip node_modules unless explicitly included
        if (!includeNodeModules && path.hub.file.opts.filename.includes("node_modules")) {
          return;
        }

        path.node.properties.forEach((property) => {
          if (!t.isObjectProperty(property) || !t.isIdentifier(property.key)) return;

          const key = property.key.name;

          if (!propertiesToConvert.includes(key)) return;

          property.value = processStyleValue(property.value, baseFontSize, path);
        });
      },
      JSXAttribute(path, state) {
        const options = state.opts || {};
        const baseFontSize = options.baseFontSize || BASE_FONT_SIZE;
        const propertiesToConvert = options.properties || DEFAULT_PROPS;
        const includeNodeModules = options.includeNodeModules || false;

        // Skip node_modules unless explicitly included
        if (!includeNodeModules && path.hub.file.opts.filename.includes("node_modules")) {
          return;
        }

        if (path.node.name.name !== 'style') return;

        if (t.isJSXExpressionContainer(path.node.value)) {
          const expression = path.node.value.expression;
          if (t.isObjectExpression(expression)) {
            expression.properties.forEach((property) => {
              if (!t.isObjectProperty(property) || !t.isIdentifier(property.key)) return;

              const key = property.key.name;

              if (!propertiesToConvert.includes(key)) return;

              property.value = processStyleValue(property.value, baseFontSize, path);
            });
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
