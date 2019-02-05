# koop-provider-s3
Koop provider for data stored in S3 files. Files can be JSON, JSON lines, or CSVs. Note that CSV source files currently result in features with empty geometries.

## Usage

### Install:
```bash
npm install @koopjs/provider-s3
```

### Register:

```js
// initialize Koop
const Koop = require('koop')
const koop = new Koop()

// register
const s3provider = require('./koop-provider-s3')
koop.register(s3provider)
```

### Configure:

The S3 provider uses the [config](http://lorenwest.github.io/node-config/) module to store configuration settings in an object with `koopProviderS3` key:

```json
{
  "koopProviderS3": {
    "bucket": "my-default-bucket", // default bucket
    "stores": {
      "json-lines": {
        "bucket": "other-bucket", // specific bucket for this store
        "serialization": {
          "JSON": {
            "Type": "LINES"
          }  
        }
      }
    }
  }
}
```

As shown above, config includes a `bucket` and a `stores` object. The top-level `bucket` is the default S3 bucket for fetching files. `stores` is a key-value lookup used by the provider to properly deserialize the S3 file. For additional information on `serialization` definitions, see the [S3 documentation](https://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectSELECTContent.html) .  You can also set a specific `bucket` value for each store that will override the default `bucket`.

### AWS
In order to use the provider (and its S3 sdk), you will need to set your AWS credentials as environment variables.  See the [AWS docs](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html) for details.

## Requests

Once the provider is registered with Koop, it will be available for all output services and will include the `:host` and `:id` route parameters.  The `:host` parameter points the provider to an entry in the `koopProviderS3.stores` config object. The `:id` parameter should be the S3 path to a S3 file (without the bucket fragment). Any forward slashes should be replaced with `::`. For example:

`/s3/:host/:id/FeatureServer/:layer/:method`

can be used as:

`/s3/json-lines/path::to::json::file.json/FeatureServer/0/query`

Using the configuration noted above, the noted request would fetch the file `path/to/json/file.json` from the bucket `other-bucket` and deserialize it assuming the `JSON LINES` format.