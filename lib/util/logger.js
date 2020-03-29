const color = {
  white: '\x1b[37m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  Cyan: '\x1b[36m',
  green: '\x1b[32m',
};

const logger = {
  log(...args) {
    console.log(color.white, args.join(' '));
  },
  info(...args) {
    console.log(color.blue, args.join(' '));
  },
  warn(...args) {
    console.log(color.yellow, args.join(' '));
  },
  error(...args) {
    console.log(color.red, args.join(' '));
    process.exit();
  },
  success(...args) {
    console.log(color.green, args.join(' '));
    process.exit();
  },
};

module.exports = logger;
