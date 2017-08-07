import treeWalker from 'react-tree-walker';

export default async function (app) {
  const visitor = (element, instance, context) => {
    if (instance && typeof instance.prerender === 'function') {
      return instance.prerender();
    }
    return true;
  }
  return treeWalker(app, visitor, {});
}
