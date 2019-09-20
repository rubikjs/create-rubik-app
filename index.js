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
  library: 'rubikjs/rubik-library-scaffold'
}

const appName = argv._[0]
if (!appName) {
  log.error('Please pass a app name.')
  shell.exit(1)
}
const root = path.resolve(process.cwd(), appName)

if (fs.existsSync(root)){
  log.error('The dir is exist, please choose another name.')
  shell.exit(1)
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
    removeRootDir()
    shell.exit(1)
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
      choices: [
        'pure',
        'vue',
        'react',
        'library'
      ]
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
      removeRootDir()
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