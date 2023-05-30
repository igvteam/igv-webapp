#!/usr/bin/env node

/*
  Replace the IGV dependency with the latest in the main branch.  This script is used for creating test builds
 */

const fs = require("fs")
const packageJSON = require("../package.json")

packageJSON["devDependencies"]["igv"] = "github:igvteam/igv.js"

fs.writeFileSync("package.json", JSON.stringify(packageJSON))