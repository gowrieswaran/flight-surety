# FlightSurety

FlightSurety is a sample application project for Udacity's Blockchain course.

## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (using HTML, CSS and JS) and server app scaffolding.

To install, download or clone the repo, then:

`npm install`
`truffle compile`

![compile](https://github.com/gowrieswaran/flight-surety/blob/master/screenshots/truffle-compile.PNG)
## Develop Client

To run truffle tests:

`truffle test ./test/flightSurety.js`

![test1](https://github.com/gowrieswaran/flight-surety/blob/master/screenshots/truffle-tests.PNG)

`truffle test ./test/oracles.js`

![test2](https://github.com/gowrieswaran/flight-surety/blob/master/screenshots/truffle-tests-oracles.PNG)

To use the dapp:

`truffle migrate`

![migrate](https://github.com/gowrieswaran/flight-surety/blob/master/screenshots/truffle-migrate.PNG)

`npm run dapp`

![dapp](https://github.com/gowrieswaran/flight-surety/blob/master/screenshots/npm-run-dapp.PNG)

To view dapp:

`http://localhost:8000`

## Develop Server

`npm run server`
`truffle test ./test/oracles.js`

## Deploy

To build dapp for prod:
`npm run dapp:prod`

Deploy the contents of the ./dapp folder


## Resources

* [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
* [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
* [Truffle Framework](http://truffleframework.com/)
* [Ganache Local Blockchain](http://truffleframework.com/ganache/)
* [Remix Solidity IDE](https://remix.ethereum.org/)
* [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
* [Ethereum Blockchain Explorer](https://etherscan.io/)
* [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)
