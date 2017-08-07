const template = require('babel-template')
const syntax = require('babel-plugin-syntax-dynamic-import');
const t = require('babel-types');

const TYPE_IMPORT = 'Import';

const buildImport = template(`
  ({
    then: f => {
      const req = require(SOURCE);
      addImport(SOURCE);
      f(req);
      return Promise.resolve(req);
    },
  })
`);

module.exports = () => ({
  inherits: syntax,

  visitor: {
    CallExpression(path) {
      if (path.node.callee.type === TYPE_IMPORT) {
        const importArgument = path.node.arguments[0];
        const newImport = buildImport({
          SOURCE: path.node.arguments//(t.isStringLiteral(importArgument) || t.isTemplateLiteral(importArgument))
            // ? path.node.arguments
            // : t.templateLiteral([t.templateElement({ raw: '', cooked: '' }), t.templateElement({ raw: '', cooked: '' }, true)], path.node.arguments),
        });
        path.replaceWith(newImport);
      }
    },
  },
});
