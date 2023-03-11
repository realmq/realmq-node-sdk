# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2023-03-11
### Added
- Add support for client id postfixes to allow multiple connections per token.
- Add new config option `getClientIdPostfix` to customize the default.

## [0.1.0] - 2018-06-29
### Changed
- Adapt new api url. #3
- Adapt new persisted messages format. #3

### Added
- Added support for retrieving authenticated user and token `realmq.me.token.retrieve()` and `realmq.me.user.retrieve()`.

[0.2.0]: https://github.com/realmq/realmq-node-sdk/compare/0.1.0...0.2.0
[0.1.0]: https://github.com/realmq/realmq-node-sdk/compare/0.1.0-alpha3...0.1.0
