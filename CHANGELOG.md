# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [1.1.2] - 2020-08-12
### Fixed
* Use of `path` for creating s3 route failed on Windows. Rolled own path joiner.

## [1.1.1] - 2019-02-26
### Added
* Add `metadata.geometryType` to translated GeoJSON
* Add caching if `ttl` found in the config

## [1.1.0] - 2019-02-26
### Added
* Default geometry translations for point data

## [1.0.1] - 2019-02-19
### Fixed
* Path to package.json in index.js

## [1.0.0] - 2019-02-19
Initial release of a S3 provider.

### Added
* Code, tests and travis build.

[1.1.2]: https://github.com/koopjs/koop-provider-s3-select/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/koopjs/koop-provider-s3-select/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/koopjs/koop-provider-s3-select/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/koopjs/koop-provider-s3-select/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/koopjs/koop-provider-s3-select.git/releases/tag/v1.0.0