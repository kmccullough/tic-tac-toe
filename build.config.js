module.exports = {
  test: {
    specSuffix: 'spec',
    clean: 'test/dist/**/*.js',
    src: '@(src|test)/**/[^_]*.[spec].js',
    dist: 'test/dist',
  },
};
