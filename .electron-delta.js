// .electron-delta.js
const DeltaBuilder = require("@electron-delta/builder");
const path = require("path");

const options = {
  productIconPath: path.join(`${__dirname}/icons-img`, "hr.ico"),
  productName: "hr",

  getPreviousReleases: async () => {
    return [
      {
        version: "1.0.0",
        url: "https://github.com/mohfrea/hr-frontend-mh/releases/download/v1.0.0/hr-setup-1.0.0.exe",
      },
    ];
  },
  sign: async (filePath) => {
    // sign each delta executable
  },
};

exports.default = async function (context) {
  const deltaInstallerFiles = await DeltaBuilder.build({
    context,
    options,
  });
  return deltaInstallerFiles;
};
