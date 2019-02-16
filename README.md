# koop-provider-s3-select
Koop provider for fetching data stored S3 with S3 Select. Files can be JSON, JSON lines, or CSVs. Note that CSV source files currently result in features with empty geometries.

## Usage

### Install

```bash
npm install @koopjs/provider-s3-select
```

### Register

```js
// initialize Koop
const Koop = require('koop')
const koop = new Koop()

// register
const s3SelectProvider = require('@koopjs/koop-provider-s3-select')
koop.register(s3SelectProvider)
```

### Configuration

The S3 Select provider uses the [config](http://lorenwest.github.io/node-config/) module to store configuration settings in an object scoped to the `koopProviderS3Select` key.  The following JSON provides an example configuration:

```json
{
  "koopProviderS3Select": {
    "s3Path": "my-default-bucket", // default path
    "stores": {
      "my-store-key": {
        "s3Path": "my-other-bucket/a-folder", // specific path for this store
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

| key | type | description | required |
| -- | -- | -- | -- |
| `s3Path` | String | Default path-prefix that will be prepended to all requested files. Begins with the S3 bucket name and may include any sub-directory path. | No |
| `stores` | Object |key-value lookup used by the provider to fetch specific configuration information for a request. Each key in `stores` defines a valid value of the `:host` route parameter | Yes |
| `stores[<key>].s3Path`| String | Path-prefix that will be prepended to all file requests when `:host` is equal to `<key>` | No |
| `stores[<key>].serialization`| Object | S3 input serialization object. Informs S3 how files requested with a give `:host` value should be deserialized. See [S3 documentation](https://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectSELECTContent.html).| No |

As noted above, `s3Path` is always optional, but if set,it should begin with the S3 bucket name and include any sub-directory path along which you want to restrict requests for fetching files. If `s3Path` is not set, the full S3 path to the file, including the bucket name, needs to be included in the request's `:id` parameter.  

### AWS Credentials

In order to use the provider (and its S3 sdk), you will need to set your AWS credentials as environment variables.  See the [AWS docs](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html) for details.

### Request Parameters
Once the provider is registered with Koop, it will be available for all output services and will include the `:host` and `:id` route parameters.

| parameter | type | desription |
| -- | -- | -- |
| `:host` | String | Points the provider to an entry in the `koopProviderS3Select.stores` config object. |
| `:id` | String | The S3 path to a S3 file, with adjustments for any path prefix set in configuration with `s3Path`. Any forward slashes in the path should be replaced with `::` to avoid routing errors. |

The Koop output service provides an example of the usage of these parameters.  The pattern for the query service is:

`/s3/:host/:id/FeatureServer/:layer/:method`

An example request using this pattern is below:

`/s3/json-lines/path::to::json::file.json/FeatureServer/0/query`

In the above request, `json-lines` is the `:host` parameter and refers to a key in the configurations `stores` object. `path::to::json::file.json` is the `:id` parameter and is a partial path to an S3 file with all `/` replaced with `::`. Using the `s3Path` from the `json-lines` entry of the configuration object, the noted request would fetch the file with the following path `/my-other-bucket/a-folder/path/to/json/file.json`.