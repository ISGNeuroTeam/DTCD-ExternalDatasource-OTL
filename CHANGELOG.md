# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [UNRELEASED]

### Added

- current username to `makejob` request params

### Removed

- login and password from default connector config

## [0.4.0]

### Added

- deletion `\n` and `\r` characters from `queryString` param

### Changed

- now checkjob uses HTTP POST request
- ot_js_connector version to `1.3.0`

## [0.3.0]

### Changed

- SDK version
- ot_js_connector version `1.2.1`

## [0.2.0]

### Added

- logs
- version of core systems for adapters

### Changed

- changed arguments of methods to accept 'queryString' from DataSourceSystem
- build process in order to make directory name with current version of plugin

## [0.1.0]

### Changed

- connector config for OTPConnectorService instance
- ot_js_connector version

### Added

- plugin init
- iterator get data from instance of plugin
