const chalk = require('chalk')
const pkg = require('./package')
const logPrefix = `[${pkg.name}]`

const log = {
  info (text) {
    console.log(`${logPrefix}${chalk.green(text)}`)
  },
  error (text) {
    console.log(`${logPrefix}${chalk.red(text)}`)
  }
}

module.exports = {
  log
}
