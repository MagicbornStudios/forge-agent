/**
 * PostCSS plugin: hoist all @import url(...) rules to the top of the file.
 * CSS requires @import to precede other rules; dependencies (e.g. @twick/studio)
 * may inject @import url() after Tailwind output, causing parse errors.
 */
module.exports = function hoistImportUrl() {
  return {
    postcssPlugin: 'postcss-hoist-import-url',
    Once(root) {
      const urlImports = [];
      root.each((node) => {
        if (node.type === 'atrule' && node.name === 'import' && /^\s*url\s*\(/i.test(node.params)) {
          urlImports.push(node);
        }
      });
      if (urlImports.length === 0) return;
      urlImports.forEach((node) => node.remove());
      // Prepend at start (prepend is reverse order, so iterate backwards)
      for (let i = urlImports.length - 1; i >= 0; i--) {
        root.prepend(urlImports[i]);
      }
    },
  };
};
module.exports.postcss = true;
