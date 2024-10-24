module.exports = {
  root: true,
  extends: ["universe/native", "universe/web", "prettier"],
  ignorePatterns: ["build"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
  },
};
