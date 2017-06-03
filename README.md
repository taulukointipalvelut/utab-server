# utab-server
utab server written in node js

## Documentation

The documentation is available at [here](https://taulukointipalvelut.github.io/utab-server/)
You can briefly see the methods supported in resource URLs at [here](MEMO.md)

## Attention

1. MongoDB has a connection limit. You must configure it up to 1000 or more to run your server safely.

## Usage

1. Clone this repository. `$ git clone --recursive https://github.com/taulukointipalvelut/utab-server`

1. Move to repository folder. `$ cd utab-server`

1. Install node dependencies. `$ npm install`

1. Start MongoDB. `$ mongod`

1. Run app. `$ node app`
