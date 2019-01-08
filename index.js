const path = require('path')
const net = require('net')

const args = require('gar')(process.argv.slice(2))

const commonAbstractorFactory = require(path.join(__dirname, 'commonAbstractorFactory.js'))

