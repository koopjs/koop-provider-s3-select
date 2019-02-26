// clean shutdown on `cntrl + c`
process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))

// Initialize Koop
const Koop = require('koop')
const koop = new Koop()

const config = require('config')

koop.register(require('./index'))

// Set port for configuration or fall back to default
const port = config.port || 8080
koop.server.listen(8080, () => console.log(`Koop listening on port 8080!`))

const message = `

Koop S3 Select Provider listening on ${port}
Press control + c to exit
`
console.log(message)
