const npm = require("./npm-helper.js");
const chalk = require("chalk");


npm.on("log", (message) => message.level !== 'silly' && thirdyPartyLog("npm", message.message));
npm.install("chalk");

function thirdyPartyLog(partyName, message) {
  var chalkStyle = chalk.white;

  switch (partyName) {
    case "npm":
      chalkStyle = chalk.red;
      break;
  }
  console.log(`${chalkStyle(partyName)}:`, message);
}
