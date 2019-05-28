export default {
  entry: 'dist/index.js',
  dest: 'dist/bundles/i18n-extended.umd.js',
  sourceMap: false,
  format: 'umd',
  moduleName: 'i18n-extended',
  globals: {
    '@angular/core': 'ng.core',
  }
}