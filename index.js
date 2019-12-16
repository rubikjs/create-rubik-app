const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const download = require('download-git-repo')
const shell = require('shelljs')
const rm = require('rimraf').sync
const argv = require('yargs').argv
const { log } = require('./utils')
const repo = {
  pure: 'rubikjs/rubik-pure-scaffold',
  vue: 'rubikjs/rubik-vue-scaffold',
  react: 'rubikjs/rubik-react-scaffold',
  library: 'rubikjs/rubik-library-scaffold',
  electron: 'rubikjs/rubik-electron-scaffold',
  'ant-design-pro-vue': 'rubikjs/rubik-ant-design-pro-vue'
}

const appName = argv._[0]

process.on('exit', (code) => {
  if (code === 2) {
    removeRootDir()
  }
})

process.on('SIGINT', function () {
  process.exit(2)
})

if (!appName) {
  log.error('Please pass a app name.')
  process.exit(1)
}
const root = path.resolve(process.cwd(), appName)

if (fs.existsSync(root)){
  log.error('The dir is exist, please choose another name.')
  process.exit(1)
}
makeRootDir()
parseRepo()

function makeRootDir () {
  fs.mkdirSync(root)
}
function removeRootDir () {
  rm(root)
}
function parseRepo () {
  if (argv.repo) { // 自定义参库
    downloadRepo(`direct:${argv.repo}`, true)
    return
  }
  if (argv.type) { // 指定类型
    if (repo[argv.type]) {
      downloadRepo(repo[argv.type])
      return
    }
    log.error(`Invalid type!(${Object.keys(repo).join('|')})`)
    process.exit(2)
  }
  selectOfficialRepo()
}

function selectOfficialRepo () {
  inquirer
  .prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Choose the type.',
      choices: Object.keys(repo)
    }
  ])
  .then(answers => {
    downloadRepo(repo[answers.type])
  })
}


function downloadRepo (url, clone = false) {
  log.info('Try to download the repo...')
  download(url, root, { clone: clone }, (err) => {
    if (err) {
      log.error(err.message)
      process.exit(2)
      return
    }
    if (clone) {
      rm(path.resolve(root, './.git'))
    }
    log.info('Download completed.')
    toInstallPkg()
  })
}

function toInstallPkg () {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Choose the package management type to install the dependencies',
        choices: [
          'npm',
          'yarn',
          'cancel(install manually)'
        ],
        default: 'yarn'
      }
    ])
    .then(answers => {
      switch (answers.type) {
        case 'yarn':
          shell.exec('yarn', {
            cwd: root
          })
          break
        case 'npm':
          shell.exec('npm i', {
            cwd: root
          })
          break
        default:
          break
      }
    })
}
