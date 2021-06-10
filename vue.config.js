module.exports = {
  devServer: {
    proxy: "https://www.ecb.europa.eu",
  },
};
// Just a quick solution for dealing with the CORS policy error
