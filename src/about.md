# About

---

## License

The MIT License (MIT)

Copyright (c) 2016-2019 Ryan Wynn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Contributing

The Monstache project welcomes, and depends, on contributions from developers and
users in the open source community. Contributions can be made in a number of
ways, a few examples are:

- Code patches via pull requests
- [Documentation](https://github.com/rwynn/monstache-site) improvements
- [Bug reports](https://github.com/rwynn/monstache/issues) and patch reviews

### Reporting an Issue

Please include as much detail as you can. Let us know your platform, Monstache
version, MongoDB version, and Elasticsearch version.

### Testing the Development Version

If you want to just install and try out the latest development version of
Monstache you can do so with the following commands. This can be useful if you
want to provide feedback for a new feature or want to confirm if a bug you
have encountered is fixed in the git master. You will need at least golang `1.11`
which includes native go modules support.

```bash
cd ~/build # somewhere outside your $GOPATH
git clone https://github.com/rwynn/monstache.git
cd monstache
git checkout <branch-to-build>
go install
# the resulting monstache binary will be in $GOPATH/bin
```

### Running the tests

To run the tests without Docker, you will need to have local mongod and elasticsearch servers running.  
Then you will need to start a monstache process in one terminal or in the background.

```bash
monstache -verbose
```

Finally in another terminal you can run the tests by issuing the following commands 

```bash
cd monstache
go test -v
```

!!! warning

	Running the Monstache tests will perform modifications to the `test.test` namespace in 
	MongoDB and will index documents in the `test.test` index in Elasticsearch.  If you have
	data that you need to keep on your local servers, make a back up before running the tests.

!!! note

	If you don't want to setup MongoDB and Elasticsearch on your machine another option for running the tests
	is via Docker. After cloning the monstache repo you can cd into the `docker/test` directory and run 
	`run-tests.sh`.  You will need recent versions of `docker` and `docker-compose` to run the tests this way.
	Services for MongoDB and Elasticsearch will be started and the tests run on any changes you have made to the 
	source code.

### Submitting Pull Requests

Once you are happy with your changes or you are ready for some feedback, push
it to your fork and send a pull request. For a change to be accepted it will
most likely need to have tests and documentation if it is a new feature.

## Release Notes

See github.com for the most recent release notes.

### [monstache v4.16.1](https://github.com/rwynn/monstache/releases/tag/v4.16.1)

* Fix bug in mongoX509Settings validate (issue #198)
* Fix issue stopping monstache when using legacy oplog tailing (non change-stream) of a sharded cluster
* Upgrade golang on release builds to 1.12.1
* Upgrade docker images to use Alpine 3.9.2

### [monstache v3.23.1](https://github.com/rwynn/monstache/releases/tag/v3.23.1)

* Fix bug in mongoX509Settings validate (issue #198)
* Fix issue stopping monstache when using legacy oplog tailing (non change-stream) of a sharded cluster
* Upgrade golang on release builds to 1.12.1
* Upgrade docker images to use Alpine 3.9.2

### [monstache v4.16.0 (4tsb)](https://github.com/rwynn/monstache/releases/tag/v4.16.0)

* Add a new integer setting `direct-read-concur` which, when set, limits the number of concurrent direct reads that will be performed.  E.g. if you have `direct-read-namespaces` set to 23 namespaces and `direct-read-concur` set to 2, then monstache will read and sync namespace 1 and 2 concurrently and wait for both to finish before starting 3 and 4 - and so on.  
* Add the ability to disable direct read collection splitting by setting `direct-read-split-max` to -1.  By default, monstache will split each direct read collection up to 9 times and read each segment in a separate go routine.  If you don't want to split collections at all then set `direct-read-split-max` to -1. 

### [monstache v3.23.0 (4tsb)](https://github.com/rwynn/monstache/releases/tag/v3.23.0)

* Add a new integer setting `direct-read-concur` which, when set, limits the number of concurrent direct reads that will be performed.  E.g. if you have `direct-read-namespaces` set to 23 namespaces and `direct-read-concur` set to 2, then monstache will read and sync namespace 1 and 2 concurrently and wait for both to finish before starting 3 and 4 - and so on.  
* Add the ability to disable direct read collection splitting by setting `direct-read-split-max` to -1.  By default, monstache will split each direct read collection up to 9 times and read each segment in a separate go routine.  If you don't want to split collections at all then set `direct-read-split-max` to -1. 

### [monstache v4.15.2](https://github.com/rwynn/monstache/releases/tag/v4.15.2)

* Fix issue using monstache with GoCenter

### [monstache v3.22.2](https://github.com/rwynn/monstache/releases/tag/v3.22.2)

* Fix issue using monstache with GoCenter

### [monstache v4.15.1](https://github.com/rwynn/monstache/releases/tag/v4.15.1)

* Upgrade golang to 1.12
* Fix a panic under some conditions when processing the result of a golang plugin `Map` function

### [monstache v3.22.1](https://github.com/rwynn/monstache/releases/tag/v3.22.1)

* Upgrade golang to 1.12
* Fix a panic under some conditions when processing the result of a golang plugin `Map` function

### [monstache v4.15.0](https://github.com/rwynn/monstache/releases/tag/v4.15.0)

* This release adds the ability for MongoDB 4+ users to open change streams against entire
  databases or entire deployments.  See the documentation for the `change-stream-namespaces`
  option for details.

* The `resume`, `resume-from-timestamp`, `replay`, and `cluster-name` options can now be used
  in conjunction with `change-stream-namespaces` if you have MongoDB 4 or greater.

* Improved support for connecting directly to shards when authorization is required on the connection.
  This is only applicable if you are not using change streams and you are connecting to a sharded 
  MongoDB deployment. In that case Monstache needs to discover and connect directly to shards. In this
  case it will reuse the login info from the initial connection to the `mongos` server when connecting to
  the shards.

### [monstache v3.22.0](https://github.com/rwynn/monstache/releases/tag/v3.22.0)

* This release adds the ability for MongoDB 4+ users to open change streams against entire
  databases or entire deployments.  See the documentation for the `change-stream-namespaces`
  option for details.

* The `resume`, `resume-from-timestamp`, `replay`, and `cluster-name` options can now be used
  in conjunction with `change-stream-namespaces` if you have MongoDB 4 or greater.

* Improved support for connecting directly to shards when authorization is required on the connection.
  This is only applicable if you are not using change streams and you are connecting to a sharded 
  MongoDB deployment. In that case Monstache needs to discover and connect directly to shards. In this
  case it will reuse the login info from the initial connection to the `mongos` server when connecting to
  the shards.

### [monstache v4.14.2](https://github.com/rwynn/monstache/releases/tag/v4.14.2)

* Change stream performance improvements

### [monstache v3.21.2](https://github.com/rwynn/monstache/releases/tag/v3.21.2)

* Change stream performance improvements

### [monstache v4.14.1](https://github.com/rwynn/monstache/releases/tag/v4.14.1)

* Fix for regression in previous release where the MongoDB initial connection timeout
  was not being honored
* Added a new setting `relate-buffer` which is the maximum number of relate events to
  allow in queue before skipping the relate and printing an error.  This was added to
  prevent the scenario where a large number of relate events stall the pipeline.  The
  default number of relates to allow in queue is 1000.

### [monstache v3.21.1](https://github.com/rwynn/monstache/releases/tag/v3.21.1)

* Fix for regression in previous release where the MongoDB initial connection timeout
  was not being honored
* Added a new setting `relate-buffer` which is the maximum number of relate events to
  allow in queue before skipping the relate and printing an error.  This was added to
  prevent the scenario where a large number of relate events stall the pipeline.  The
  default number of relates to allow in queue is 1000.

### [monstache v4.14.0](https://github.com/rwynn/monstache/releases/tag/v4.14.0)

* Performance and reliability improvements
* Fix for issue #168 by adding new TOML only configs elasticsearch-healthcheck-timeout-startup and 
  elasticsearch-healthcheck-timeout. These are in seconds.
* Fix a panic occurring when an empty array was returned from a pipeline javascript function.
* Default read/write timeouts changed to 30s, up from 7s.

### [monstache v3.21.0](https://github.com/rwynn/monstache/releases/tag/v3.21.0)

* Performance and reliability improvements
* Fix for issue #168 by adding new TOML only configs elasticsearch-healthcheck-timeout-startup and 
  elasticsearch-healthcheck-timeout. These are in seconds.
* Fix a panic occurring when an empty array was returned from a pipeline javascript function.
* Default read/write timeouts changed to 30s, up from 7s.

### [monstache v4.13.4](https://github.com/rwynn/monstache/releases/tag/v4.13.4)

* Improvements to change-stream-namespaces

### [monstache v3.20.4](https://github.com/rwynn/monstache/releases/tag/v3.20.4)

* Improvements to change-stream-namespaces

### [monstache v4.13.3](https://github.com/rwynn/monstache/releases/tag/v4.13.3)

* Improvements in recovery from failed connections and errors

### [monstache v3.20.3](https://github.com/rwynn/monstache/releases/tag/v3.20.3)

* Improvements in recovery from failed connections and errors

### [monstache v4.13.2](https://github.com/rwynn/monstache/releases/tag/v4.13.2)

* Fix namespace parsing for collections with dots in the name in find calls in Javascript
* Add additional validation when certs are appended to the root store to make sure it was successful
* Ensure the mechanism is set to MONGODB-X509 when logging in with an X509 certificate

### [monstache v3.20.2](https://github.com/rwynn/monstache/releases/tag/v3.20.2)

* Fix namespace parsing for collections with dots in the name in find calls in Javascript
* Add additional validation when certs are appended to the root store to make sure it was successful
* Ensure the mechanism is set to MONGODB-X509 when logging in with an X509 certificate

### [monstache v4.13.1](https://github.com/rwynn/monstache/releases/tag/v4.13.1)

* Fix issue #157 related to the `relate` config
* Improve reliability for issue #153 by ensuring direct reads are more resilient in cluster mode
* Breaking: removes the dynamic nature of finding the oplog collection.  Now defaults to `oplog.rs`.  If you are still using MongoDB with `master` mode instead of replica sets then you now need to explicitly set `mongo-oplog-collection-name` to `oplog.$main`.

### [monstache v3.20.1](https://github.com/rwynn/monstache/releases/tag/v3.20.1)

* Fix issue #157 related to the `relate` config
* Improve reliability for issue #153 by ensuring direct reads are more resilient in cluster mode
* Breaking: removes the dynamic nature of finding the oplog collection.  Now defaults to `oplog.rs`.  If you are still using MongoDB with `master` mode instead of replica sets then you now need to explicitly set `mongo-oplog-collection-name` to `oplog.$main`.

### [monstache v4.13.0](https://github.com/rwynn/monstache/releases/tag/v4.13.0)

* Fixed issue where keep-src was not being honored for relate configs
* Added mongo-x509-settings config option to allow x509 auth when connecting
* Added ability to see field level changes (updateDescription) if available in javascript and golang
* Handle delete events if possible such that they trigger resync of related docs when a relationship exists
* Remove the requirement that golang plugins must implement a Map function
* Added the ability to override the ID sent to Elasticsearch in the mapping phase.

### [monstache v3.20.0](https://github.com/rwynn/monstache/releases/tag/v3.20.0)

* Fixed issue where keep-src was not being honored for relate configs
* Added mongo-x509-settings config option to allow x509 auth when connecting
* Added ability to see field level changes (updateDescription) if available in javascript and golang
* Handle delete events if possible such that they trigger resync of related docs when a relationship exists
* Remove the requirement that golang plugins must implement a Map function
* Added the ability to override the ID sent to Elasticsearch in the mapping phase.

### [monstache v4.12.5](https://github.com/rwynn/monstache/releases/tag/v4.12.5)

* Fix regression preventing `resume-name` from being set correctly
* Add configuration option `config-database-name` to configure the MongoDB database under which monstache stores metadata. Previously hard coded to `monstache`, the default value.

### [monstache v3.19.5](https://github.com/rwynn/monstache/releases/tag/v3.19.5)

* Fix regression preventing `resume-name` from being set correctly
* Add configuration option `config-database-name` to configure the MongoDB database under which monstache stores metadata. Previously hard coded to `monstache`, the default value.

### [monstache v4.12.4](https://github.com/rwynn/monstache/releases/tag/v4.12.4)

* Repeatable builds with go modules
* Fixes for deadlock and race conditions

### [monstache v3.19.4](https://github.com/rwynn/monstache/releases/tag/v3.19.4)

* Repeatable builds with go modules
* Fixes for deadlock and race conditions

### [monstache v4.12.3](https://github.com/rwynn/monstache/releases/tag/v4.12.3)

* Upgrade elastic client to pickup fix for AWS request signing

### [monstache v3.19.3](https://github.com/rwynn/monstache/releases/tag/v3.19.3)

* Upgrade elastic client to pickup fix for AWS request signing

### [monstache v4.12.2](https://github.com/rwynn/monstache/releases/tag/v4.12.2)

* Fix parse of env value with = character

### [monstache v3.19.2](https://github.com/rwynn/monstache/releases/tag/v3.19.2)

* Fix parse of env value with = character

### [monstache v4.12.1](https://github.com/rwynn/monstache/releases/tag/v4.12.1)

* Fix read of `MONSTACHE-MONGO-CONFIG-URL` environment variable

### [monstache v3.19.1](https://github.com/rwynn/monstache/releases/tag/v3.19.1)

* Fix read of `MONSTACHE-MONGO-CONFIG-URL` environment variable

### [monstache v4.12.0](https://github.com/rwynn/monstache/releases/tag/v4.12.0)

* Added the ability to configure monstache with environment variables. See issue #133 for details
* Added a `-tpl` flag to preprocess TOML config files as golang templates with access to env vars
* Added a `disable-change-events` option to turn off listening to the oplog
* Upgraded the monstache docker image from Alpine 3.7 to 3.8

### [monstache v3.19.0](https://github.com/rwynn/monstache/releases/tag/v3.19.0)

* Added the ability to configure monstache with environment variables. See issue #133 for details.
* Added a `-tpl` flag to preprocess TOML config files as golang templates with access to env vars
* Added a `disable-change-events` option to turn off listening to the oplog
* Upgraded the monstache docker image from Alpine 3.7 to 3.8

### [monstache v4.11.9](https://github.com/rwynn/monstache/releases/tag/v4.11.9)

* Fix for lock ups by removing default of no timeout
* Default timeouts for MongoDB set to 7s
* Better recovery for change-streams
* Breaking changes - timeouts set in config file must be greater than 0 (no timeout)

### [monstache v3.18.9](https://github.com/rwynn/monstache/releases/tag/v3.18.9)

* Fix for lock ups by removing default of no timeout
* Default timeouts for MongoDB set to 7s
* Better recovery for change-streams
* Breaking changes - timeouts set in config file must be greater than 0 (no timeout)

### [monstache v4.11.8](https://github.com/rwynn/monstache/releases/tag/v4.11.8)

* Fix panic on nil access for issue #129

### [monstache v3.18.8](https://github.com/rwynn/monstache/releases/tag/v3.18.8)

* Fix panic on nil access for issue #129

### [monstache v4.11.7](https://github.com/rwynn/monstache/releases/tag/v4.11.7)

* Ensure `input.Document` map contains an `_id` field on deletes when sent to the `Process` function in a plugin
* Ensure failed bulk response items are logged as errors

### [monstache v3.18.7](https://github.com/rwynn/monstache/releases/tag/v3.18.7)

* Ensure `input.Document` map contains an `_id` field on deletes when sent to the `Process` function in a plugin
* Ensure failed bulk response items are logged as errors

### [monstache v4.11.6](https://github.com/rwynn/monstache/releases/tag/v4.11.6)

* Fix issue where the `file-namespaces` config option was not being processed correctly

### [monstache v3.18.6](https://github.com/rwynn/monstache/releases/tag/v3.18.6)

* Fix issue where the `file-namespaces` config option was not being processed correctly

### [monstache v4.11.5](https://github.com/rwynn/monstache/releases/tag/v4.11.5)

* Fix a race condition when a `related` config is used and a golang plugin implements `Process`.

### [monstache v3.18.5](https://github.com/rwynn/monstache/releases/tag/v3.18.5)

* Fix a race condition when a `related` config is used and a golang plugin implements `Process`.

### [monstache v4.11.4](https://github.com/rwynn/monstache/releases/tag/v4.11.4)

* Use less CPU resources
* Fix for race conditions

### [monstache v3.18.4](https://github.com/rwynn/monstache/releases/tag/v3.18.4)

* Use less CPU resources
* Fix for race conditions

### [monstache v4.11.3](https://github.com/rwynn/monstache/releases/tag/v4.11.3)

* Fix an issue where a paused monstache process would not resume correctly in cluster mode

### [monstache v3.18.3](https://github.com/rwynn/monstache/releases/tag/v3.18.3)

* Fix an issue where a paused monstache process would not resume correctly in cluster mode

### [monstache v4.11.2](https://github.com/rwynn/monstache/releases/tag/v4.11.2)

* Fix an issue with workers where only one worker would be used for change documents
* Redact sensitive connection information when logging connection failures

### [monstache v3.18.2](https://github.com/rwynn/monstache/releases/tag/v3.18.2)

* Fix an issue with workers where only one worker would be used for change documents
* Redact sensitive connection information when logging connection failures

### [monstache v4.11.1](https://github.com/rwynn/monstache/releases/tag/v4.11.1)

* Fix for connection checker thread exiting early in cluster mode
* Better handling of JSON serialization errors

### [monstache v3.18.1](https://github.com/rwynn/monstache/releases/tag/v3.18.1)

* Fix for connection checker thread exiting early in cluster mode
* Better handling of JSON serialization errors

### [monstache v4.11.0](https://github.com/rwynn/monstache/releases/tag/v4.11.0)

* Reliability improvements
* Fix allowing one to use a MongoDB view as a direct-read-namespace
* Addition of the `relate` config to declare dependencies between collections
* Experimental support for AWS Signing Version 4

### [monstache v3.18.0](https://github.com/rwynn/monstache/releases/tag/v3.18.0)

* Reliability improvements
* Fix allowing one to use a MongoDB view as a direct-read-namespace
* Addition of the `relate` config to declare dependencies between collections
* Experimental support for AWS Signing Version 4

### [monstache v4.10.2](https://github.com/rwynn/monstache/releases/tag/v4.10.2)

* Fixes related to i/o timeout errors
* Default timeout configurations changed to no timeout (0) with the exception of the initial connection to MongoDB which times out after 15 seconds.  Values of 0 disable timeouts.  All other positive values are in seconds.  New defaults shown below.  You probably do not need to specify any of these values unless you encounter problems.   

```
[mongo-dial-settings]
timeout=15
read-timeout=0
write-timeout=0

[mongo-session-settings]
socket-timeout=0
sync-timeout=0
```

### [monstache v3.17.2](https://github.com/rwynn/monstache/releases/tag/v3.17.2)

* Fixes related to i/o timeout errors
* Default timeout configurations changed to no timeout (0) with the exception of the initial connection to MongoDB which times out after 15 seconds.  Values of 0 disable timeouts.  All other positive values are in seconds.  New defaults shown below.  You probably do not need to specify any of these values unless you encounter problems.   

```
[mongo-dial-settings]
timeout=15
read-timeout=0
write-timeout=0

[mongo-session-settings]
socket-timeout=0
sync-timeout=0
```

### [monstache v4.10.1](https://github.com/rwynn/monstache/releases/tag/v4.10.1)

* Clean up timeout configurations and increase default timeout values
* New timeout configurations surfaced - read and write timeout.  Configure as follows (default values shown):

```
[mongo-dial-settings]
timeout=10
read-timeout=600
write-timeout=30

[mongo-session-settings]
socket-timeout=600
sync-timeout=600
```

### [monstache v3.17.1](https://github.com/rwynn/monstache/releases/tag/v3.17.1)

* Clean up timeout configurations and increase default timeout values
* New timeout configurations surfaced - read and write timeout.  Configure as follows (default values shown):

```
[mongo-dial-settings]
timeout=10
read-timeout=600
write-timeout=30

[mongo-session-settings]
socket-timeout=600
sync-timeout=600
```

### [monstache v4.10.0](https://github.com/rwynn/monstache/releases/tag/v4.10.0)

* Fix for issue #97 where monstache would exit before syncing all documents with `-exit-after-direct-reads` enabled
* Support added for MongoDB change streams via the `change-stream-namespaces` option
* New golang plugin functions `Process` and `Pipeline` added to the existing `Map` and `Filter` functions.  The `Process` function allows one to code complex processing after an event.  The `Process` function has access to the MongoDB session, the Elasticsearch client, the Elasticsearch bulk processor, and information about the change that occurred (insert, update, delete). The `Pipeline` function allows one to assign MongoDB pipeline stages to both direct reads and change streams. Since the pipeline stages may differ between direct reads and change streams the function is passed a boolean indicating the source of the data.  For example, a `$match` clause on the change stream may need to reference the `fullDocument` field since the root will be the change event. For direct reads the root will simply be the full document.
* New config option `pipeline` allows one to create aggregation pipelines in javascript for direct reads and change streams.  This can be used instead of the `Pipeline` function in a golang plugin.  The exported function in javascript takes a namespace and a boolean indicating whether or not the source was a change stream.  The function should return an array of pipeline stages to apply.
* New config option `pipe-allow-disk` which when enabled allows large pipelines to use the disk to save intermediate results.
* New global function available in javascript `script` functions named `pipe`.  The `pipe` function is simliar to existing `find` function but takes an array of aggregation pipeline stages as the first argument.

```
direct-read-namespaces = [test.test]
change-stream-namespaces = [test.test]
[[pipeline]]
script = """
module.exports = function(ns, changeStream) {
  if (changeStream) {
    return [
      { $match: {"fullDocument.foo": 1} }
    ];
  } else {
    return [
      { $match: {"foo": 1} }
    ];
  }
}
"""
[[script]]
namespace = "test.test"
script = """
module.exports = function(doc, ns) {
  doc.extra = pipe([
    { $match: {foo: 1} },
    { $limit: 1 },
    { $project: { _id: 0, foo: 1}}
  ]);
  return doc;
}
"""
```

### [monstache v3.17.0](https://github.com/rwynn/monstache/releases/tag/v3.16.0)

* Fix for issue #97 where monstache would exit before syncing all documents with `-exit-after-direct-reads` enabled
* Support added for MongoDB change streams via the `change-stream-namespaces` option
* New golang plugin functions `Process` and `Pipeline`.  The `Process` function allows one to code complex processing after an event.  The `Process` function has access to the MongoDB session, the Elasticsearch client, the Elasticsearch bulk processor, and information about the change that occurred (insert, update, delete). The `Pipeline` function allows one to assign MongoDB pipeline stages to both direct reads and change streams. Since the pipeline stages may differ between direct reads and change streams the function is passed a boolean indicating the source of the data.  For example, a `$match` clause on the change stream may need to reference the `fullDocument` field since the root will be the change event. For direct reads the root will simply be the full document.
* New config option `pipeline` allows one to create aggregation pipelines in javascript for direct reads and change streams.  This can be used instead of the `Pipeline` function in a golang plugin.  The exported function in javascript takes a namespace and a boolean indicating whether or not the source was a change stream.  The function should return an array of pipeline stages to apply.
* New config option `pipe-allow-disk` which when enabled allows large pipelines to use the disk to save intermediate results.
* New global function available in javascript `script` functions named `pipe`.  The `pipe` function is simliar to existing `find` function but takes an array of aggregation pipeline stages as the first argument.

### [monstache v4.9.0](https://github.com/rwynn/monstache/releases/tag/v4.9.0)

* Fix to omit version information on deletes when the index-as-update setting is ON (to match the omitted version information at indexing time)
* Fix issue #89 by making the indexed oplog field names and date format configurable

### [monstache v3.16.0](https://github.com/rwynn/monstache/releases/tag/v3.16.0)

* Fix to omit version information on deletes when the index-as-update setting is ON (to match the omitted version information at indexing time)
* Fix issue #89 by making the indexed oplog field names and date format configurable

### [monstache v4.8.0](https://github.com/rwynn/monstache/releases/tag/v4.8.0)

* Seperate namespace regexes for drop operations vs create/update/delete operations
* Better handling of panics
* A new `index-as-update` boolean config option that allow merge instead of replace
* Fixes to the `find` and `findOne` functions available in scripts

### [monstache v3.15.0](https://github.com/rwynn/monstache/releases/tag/v3.15.0)

* Seperate namespace regexes for drop operations vs create/update/delete operations
* Better handling of panics
* A new `index-as-update` boolean config option that allow merge instead of replace
* Fixes to the `find` and `findOne` functions available in scripts

### [monstache v4.7.0](https://github.com/rwynn/monstache/releases/tag/v4.7.0)

* add -pprof setting. When enabled and combined with -enable-http-server you can read profiling information.  See [Profiling for Go](https://artem.krylysov.com/blog/2017/03/13/profiling-and-optimizing-go-web-applications/) for more information. 
* add -enable-easy-json setting. When enabled easy-json will be used for serialization to Elasticsearch.
* tweaks to the tailing code in gtm

### [monstache v3.14.0](https://github.com/rwynn/monstache/releases/tag/v3.14.0)

* add -pprof setting. When enabled and combined with -enable-http-server you can read profiling information.  See [Profiling for Go](https://artem.krylysov.com/blog/2017/03/13/profiling-and-optimizing-go-web-applications/) for more information. 
* add -enable-easy-json setting. When enabled easy-json will be used for serialization to Elasticsearch.
* tweaks to the tailing code in gtm

### [monstache v4.6.5](https://github.com/rwynn/monstache/releases/tag/v4.6.5)

* decrease the fetch channel flush timeout
* clarify version conflicts and invalid json messages as warnings
* remove the /config endpoint for better security (use -print-config instead)
* fix LoadPlugins method (contributed by @YouthLab)
* performance tweaks in gtm

### [monstache v3.13.5](https://github.com/rwynn/monstache/releases/tag/v3.13.5)

* decrease the fetch channel flush timeout
* clarify version conflicts and invalid json messages as warnings
* remove the /config endpoint for better security (use -print-config instead)
* fix LoadPlugins method (contributed by @YouthLab)
* performance tweaks in gtm

### [monstache v4.6.4](https://github.com/rwynn/monstache/releases/tag/v4.6.4)

* Expose new setting direct-read-split-max which limits the number of times a collection is split for reading during direct-reads and thus the number of go routines and MongoDB connections spawned. The default is 9. Tune this setting to increase/decrease the amount of memory the monstache process will consume.
* Better Docker support due to the contributions of @a-magdy.


### [monstache v3.13.4](https://github.com/rwynn/monstache/releases/tag/v3.13.4)

* Expose new setting direct-read-split-max which limits the number of times a collection is split for reading during direct-reads and thus the number of go routines and MongoDB connections spawned. The default is 9. Tune this setting to increase/decrease the amount of memory the monstache process will consume.
* Better Docker support due to the contributions of @a-magdy.

### [monstache v4.6.3](https://github.com/rwynn/monstache/releases/tag/v4.6.3)

* Fix for issue #65, year outside of [0,9999].  Invalid time will be removed now with `prune-invalid-json` turned on
* Fix for issue #62, the number of connections to MongoDB is now limited to a max of 32 per namespace
* Fix for issue #59, unsupported values of +/- Infinity and NaN.  These values can now be removed with the `prune-invalid-json` setting
* Fix for issue $46 and #66, having to do with filtering.  Filters now use locks to ensure the javascript environment is used by one at a time.

### [monstache v3.13.3](https://github.com/rwynn/monstache/releases/tag/v3.13.3)

* Fix for issue #65, year outside of [0,9999].  Invalid time will be removed now with `prune-invalid-json` turned on
* Fix for issue #62, the number of connections to MongoDB is now limited to a max of 32 per namespace
* Fix for issue #59, unsupported values of +/- Infinity and NaN.  These values can now be removed with the `prune-invalid-json` setting
* Fix for issue $46 and #66, having to do with filtering.  Filters now use locks to ensure the javascript environment is used by one at a time.

### [monstache v4.6.2](https://github.com/rwynn/monstache/releases/tag/v4.6.2)

* Fix regression in 3.13 series where collections under 50K documents were not synching
* Performing Tuning.  The following defaults have changed so please update your config files accordingly.

elasticsearch-max-conns went from 10 -> 4
elasticsearch-max-docs went from 1000 -> do not flush based on count (I suggest not overriding this since document sizes can vary greatly - instead use max-bytes)
elasticsearch-max-bytes went from 5MB -> 8MB

Note when you specify elasticseach-max-bytes the value must be in bytes not MB

### [monstache v3.13.2](https://github.com/rwynn/monstache/releases/tag/v3.13.2)

* Fix regression in 3.13 series where collections under 50K documents were not synching
* Performing Tuning.  The following defaults have changed so please update your config files accordingly.

elasticsearch-max-conns went from 10 -> 4
elasticsearch-max-docs went from 1000 -> do not flush based on count (I suggest not overriding this since document sizes can vary greatly - instead use max-bytes)
elasticsearch-max-bytes went from 5MB -> 8MB

Note when you specify elasticseach-max-bytes the value must be in bytes not MB

### [monstache v4.6.1](https://github.com/rwynn/monstache/releases/tag/v4.6.1)

* Performance and bug fixes in the gtm library 

### [monstache v3.13.1](https://github.com/rwynn/monstache/releases/tag/v3.13.1)

* Performance and bug fixes in the gtm library 

### [monstache v4.6.0](https://github.com/rwynn/monstache/releases/tag/v4.6.0)

* Performance improvements. Much of the performance gains come from an upgrade of the gtm library. This library now uses split vector failing back to a paginated range queries. Also, some buffering has been removed at the gtm level for certain operations.

### [monstache v3.13.0](https://github.com/rwynn/monstache/releases/tag/v3.13.0)

* Performance improvements. Much of the performance gains come from an upgrade of the gtm library. This library now uses split vector failing back to a paginated range queries. Also, some buffering has been removed at the gtm level for certain operations.

### [monstache v4.5.0](https://github.com/rwynn/monstache/releases/tag/v4.5.0)

* Adds an option `delete-index-pattern` to specify an Elasticsearch index pattern to scope stateless deletes.  Indexes outside of this
  pattern will not be considered when propogating deletes from MongoDB to Elasticsearch.  By default all Elasticsearch indexes are queried.
* Adds the ability to specify a global filter function in Javascript.  Previously, a filter function needed to be tied to a MongoDB namespace.
  Now you can leave off the namespace and the filter function will be applied to all namespaces.  The filter function will receive the document
  as the first argument and the MongoDB namespace as the second argument.
* Breaking change: `direct-read-cursors` and `direct-read-batch-size` have been removed as options.  The underlying gtm library of monstache has been
  upgraded and no longer supports parallelCollectionScan which is being removed in future versions of MongoDB.  Now gtm will use splitVector to divy
  up collections to read documents concurrently. Also, the batch size will be managed by MongoDB and not set explicitly.  See the gtm library docs for more information.
* Adds a boolean configuration option, `prune-invalid-json`, which defaults to false.  Set this to true if your MongoDB data has values such as +Inf,
  -Inf, or NaN which are not supported by the golang JSON parser and cause infinite error loops to occur.  With prune-invalid-json set to true Monstache
  will remove these values before indexing into Elasticsearch to avoid these errors.

### [monstache v3.12.0](https://github.com/rwynn/monstache/releases/tag/v3.12.0)

* Adds an option `delete-index-pattern` to specify an Elasticsearch index pattern to scope stateless deletes.  Indexes outside of this
  pattern will not be considered when propogating deletes from MongoDB to Elasticsearch.  By default all Elasticsearch indexes are queried.
* Adds the ability to specify a global filter function in Javascript.  Previously, a filter function needed to be tied to a MongoDB namespace.
  Now you can leave off the namespace and the filter function will be applied to all namespaces.  The filter function will receive the document
  as the first argument and the MongoDB namespace as the second argument.
* Breaking change: `direct-read-cursors` and `direct-read-batch-size` have been removed as options.  The underlying gtm library of monstache has been
  upgraded and no longer supports parallelCollectionScan which is being removed in future versions of MongoDB.  Now gtm will use splitVector to divy
  up collections to read documents concurrently. Also, the batch size will be managed by MongoDB and not set explicitly.  See the gtm library docs for more information.
* Adds a boolean configuration option, `prune-invalid-json`, which defaults to false.  Set this to true if your MongoDB data has values such as +Inf,
  -Inf, or NaN which are not supported by the golang JSON parser and cause infinite error loops to occur.  With prune-invalid-json set to true Monstache
  will remove these values before indexing into Elasticsearch to avoid these errors.

### [monstache v4.4.0](https://github.com/rwynn/monstache/releases/tag/v4.4.0)

* Updated the default delete strategy

* Breaking change: check [delete-strategy](/config/#delete-strategy)

### [monstache v3.11.0](https://github.com/rwynn/monstache/releases/tag/v3.11.0)

* Updated the default delete strategy

* Breaking change: check [delete-strategy](/config/#delete-strategy)

### [monstache v4.3.2](https://github.com/rwynn/monstache/releases/tag/v4.3.2)

* Allow specifying a script without a namespace. In this case documents from all collections will be run through the script. The document object will continue to be the 1st argument to the function and a new 2nd argument will be the namespace of the source document. Fixes #55.
* Fix an issue where a Date object created in Javascript would not be formatted correctly for indexing.
* Build with go 1.10.1

### [monstache v3.10.2](https://github.com/rwynn/monstache/releases/tag/v3.10.2)

* Allow specifying a script without a namespace. In this case documents from all collections will be run through the script. The document object will continue to be the 1st argument to the function and a new 2nd argument will be the namespace of the source document. Fixes #55.
* Fix an issue where a Date object created in Javascript would not be formatted correctly for indexing.
* Build with go 1.10.1

### [monstache v4.3.1](https://github.com/rwynn/monstache/releases/tag/v4.3.1)

* Upgrade gtm to pick up fix for parallel collection scans on direct reads. Each cursor now gets its own connection.

### [monstache v3.10.1](https://github.com/rwynn/monstache/releases/tag/v3.10.1)

* Upgrade gtm to pick up fix for parallel collection scans on direct reads. Each cursor now gets its own connection.

### [monstache v4.3.0](https://github.com/rwynn/monstache/releases/tag/v4.3.0)

* Upgrade gtm to pick up support for parallel collection scan on direct reads if your mongodb storage engine supports it
* Add config option to specify the number of cursors to request for parallel collection scans
* Allow mappings to specify overrides for 1 of `index` and `type` instead of requiring both
* Fix an issue where filters were not being applied to document updates

### [monstache v3.10.0](https://github.com/rwynn/monstache/releases/tag/v3.10.0)

* Upgrade gtm to pick up support for parallel collection scan on direct reads if your mongodb storage engine supports it
* Add config option to specify the number of cursors to request for parallel collection scans
* Allow mappings to specify overrides for 1 of `index` and `type` instead of requiring both
* Fix an issue where filters were not being applied to document updates

### [monstache v4.2.1](https://github.com/rwynn/monstache/releases/tag/v4.2.1)

* Ensure index names are lowercase 

### [monstache v3.9.1](https://github.com/rwynn/monstache/releases/tag/v3.9.1)

* Ensure index names are lowercase 

### [monstache v4.2.0](https://github.com/rwynn/monstache/releases/tag/v4.2.0)

* Add filtering to Javascript and Golang plugins. Filtered documents are completely
  ignored while dropped documents result in a delete request.

### [monstache v3.9.0](https://github.com/rwynn/monstache/releases/tag/v3.9.0)

* Add filtering to Javascript and Golang plugins. Filtered documents are completely
  ignored while dropped documents result in a delete request.

### [monstache v4.1.2](https://github.com/rwynn/monstache/releases/tag/v4.1.2)

* Fix custom routing for golang plugins
* Configuration now supports paths to Javascript files in addition to inline scripts

### [monstache v3.8.2](https://github.com/rwynn/monstache/releases/tag/v3.8.2)

* Fix custom routing for golang plugins
* Configuration now supports paths to Javascript files in addition to inline scripts

### [monstache v4.1.1](https://github.com/rwynn/monstache/releases/tag/v4.1.1)

* Route time machine docs by MongoDB source id

### [monstache v3.8.1](https://github.com/rwynn/monstache/releases/tag/v3.8.1)

* Route time machine docs by MongoDB source id

### [monstache v4.1.0](https://github.com/rwynn/monstache/releases/tag/v4.1.0)

* Add a nifty time machine feature

### [monstache v3.8.0](https://github.com/rwynn/monstache/releases/tag/v3.8.0)

* Add a nifty time machine feature

### [monstache v4.0.1](https://github.com/rwynn/monstache/releases/tag/v4.0.1)

* Fixed a bug where monstache would think direct reads were done when they had not even started
* Performance improvements for direct reads on large collections


### [monstache v3.7.0](https://github.com/rwynn/monstache/releases/tag/v3.7.0)

* Fixed a bug where monstache would think direct reads were done when they had not even started
* Performance improvements for direct reads on large collections


### [monstache v4.0.0](https://github.com/rwynn/monstache/releases/tag/v4.0.0)

* Monstache v4+ should be used for ES6+. There will still be bug fixes and maintenance done to the Monstache v3 releases to support ES2-5. You can still download v3.x releases from the downloads page or by directing go get to gopkg.in/rwynn/monstache.v3

* Fixes deprecation warnings during bulk indexing against ES6 because of renamed fields version and version_type

* Monstache will now default to using the ES type _doc (as opposed to the MongoDB collection name) when it detects ES 6.2+. This is the new recommended type name going forward. See issue #42.


### [monstache v3.6.5](https://github.com/rwynn/monstache/releases/tag/v3.6.5)

* Remove brittle normalization of index names, type names, and ids

* Start differentiating between releases supporting ES6+ and pre-ES6 by releasing from rel3 branch

* Soon a 4.0.0 release will be cut from master that will be ES6 forward. pre-ES6 will still be supported by downloading 3.x releases from the releases page or directing go get to gopkg.in/rwynn/monstache.v3

* Technically this release will still work with ES+ but that won't last forever. There are some deprecation warnings. In summary, if you need pre-ES6 use v3.x releases of monstache and v4.x releases of monstache for ES6+ going forward.


### [monstache v3.6.4](https://github.com/rwynn/monstache/releases/tag/v3.6.4)

* Trying to set the record for github releases in one night

* Fix a regression whereby monstache would exit after direct reads were complete when it should have kept tailing the oplog

### [monstache v3.6.3](https://github.com/rwynn/monstache/releases/tag/v3.6.3)

* Fix for a benign race condition in shutdown, introduced in 3.6.2, that caused a panic

### [monstache v3.6.2](https://github.com/rwynn/monstache/releases/tag/v3.6.2)

* Resume usage of upstream elastic client library now that fix for Elasticsearch going down has been merged
* When Elasticsearch goes down the elastic client will now put back pressure on Add and Flush calls. When Elasticsearch comes back up it will resume Adding and Flushing were it left off. Do to the blocking nature of Add and Flush the shutdown function of monstache has been refactored to take this into account. Shutdown will not hang if Elasticsearch is down. It will try to Flush pending documents but if this blocks due to a down server it will still exit after a 5 second deadline.

### [monstache v3.6.1](https://github.com/rwynn/monstache/releases/tag/v3.6.1)

* Added more detailed error logging. Each bulk request line that failed will be logged separately with details. This is much more lightweight than having to turn on verbose to get error details. Verbose is not a recommended setting for production.


### [monstache v3.6.0](https://github.com/rwynn/monstache/releases/tag/v3.6.0)

* This release focuses on improvements with regards to handling dropped connections to either Elasticsearch or MongoDB and resuming gracefully when they come back online


### [monstache v3.5.2](https://github.com/rwynn/monstache/releases/tag/v3.5.2)


* The previous release safeguards the integrity of inserts and updates with a version number, but neglected deletes.  This release adds versions to deletes such that an [insert, delete] sequence that gets sent to Elasticsearch in 2 different requests (due to `elasticsearch-max-conns` > 1) cannot actually perform a [delete, insert] instead.  In this case the insert would now carry a version number < the delete version number and be rejected.    

### [monstache v3.5.1](https://github.com/rwynn/monstache/releases/tag/v3.5.1)


* Fix for issue #37 - out of order indexing due to concurrent bulk indexing requests.  With `elasticsearch-max-conns` set to greater than 1 you may get out of order index requests; however after this fix **each document is versioned** such that Elasticsearch will not replace a newer version with an older one.  The version of the document is the timestamp from the MongoDB oplog of when the change (insert, update) occurred.  Out of order indexing typically happens when both an insert and an update are queued for a bulk request at around the same time.  In this case, do to the way the bulk processor multiplexes requests onto multiple connections, the document may be received out of order. 

### [monstache v3.5.0](https://github.com/rwynn/monstache/releases/tag/v3.5.0)


* Support for sharded MongoDB cluster.  See docs for details
* Performance optimizations
* Turn off bulk retries if configured to do so

### [monstache v3.4.2](https://github.com/rwynn/monstache/releases/tag/v3.4.2)


* Allow the stats index name format to be configurable.  Continues to default to index per day.  

### [monstache v3.4.1](https://github.com/rwynn/monstache/releases/tag/v3.4.1)


* Fix for the javascript mapping functions.  An Otto Export does not appear to recurse into arrays.  Need to do a recursive Export for this scenario.  

### [monstache v3.4.0](https://github.com/rwynn/monstache/releases/tag/v3.4.0)


* Add ability to embed documents during the mapping phase.  Javascript plugins get 3 new global functions: findId, findOne, and find.  Golang plugins get access to the mgo.Session.  See the docs for details.  

### [monstache v3.3.1](https://github.com/rwynn/monstache/releases/tag/v3.3.1)


* Improve support for additional indexing metadata.
* Fix issue where indexing metadata was not honored

### [monstache v3.3.0](https://github.com/rwynn/monstache/releases/tag/v3.3.0)


* Added optional http server.  Enable with --enable-http-server flag.  Listens on :8080 by default.  Configure address with --http-server-addr :8000.  The server responds to the following endpoints (/started, /healthz, /config, and /stats).  The stats endpoint is only enabled if stats are enabled. The /started and /healthz endpoints can be used to check for liveness.  
* Upgraded the gtm library with performance improvements

### [monstache v3.2.0](https://github.com/rwynn/monstache/releases/tag/v3.2.0)


* Add systemd support

### [monstache v3.1.2](https://github.com/rwynn/monstache/releases/tag/v3.1.2)


* Built with go1.9
* Fix golint warnings

### [monstache v3.1.1](https://github.com/rwynn/monstache/releases/tag/v3.1.1)


- timestamp stats indexes by day for easier cleanup using e.g. curator

### [monstache v3.1.0](https://github.com/rwynn/monstache/releases/tag/v3.1.0)


- add print-config argument to display the configuration and exit
- add index-stats option to write indexing statistics into Elasticsearch for analysis

### [monstache v3.0.7](https://github.com/rwynn/monstache/releases/tag/v3.0.7)


- fix elasticsearch client http scheme for secure connections

### [monstache v3.0.6](https://github.com/rwynn/monstache/releases/tag/v3.0.6)


- fix invalid struct field tag

### [monstache v3.0.5](https://github.com/rwynn/monstache/releases/tag/v3.0.5)


- add direct-read-batch-size option
- upgrade gtm to accept batch size and to ensure all direct read errors are logged

### [monstache v3.0.4](https://github.com/rwynn/monstache/releases/tag/v3.0.4)


- fix slowdown on direct reads for large mongodb collections

### [monstache v3.0.3](https://github.com/rwynn/monstache/releases/tag/v3.0.3)


- small changes to the settings for the exponential back off on retry.  see the docs for details.
- only record timestamps originating from the oplog and not from direct reads
- apply the worker routing filter to direct reads in worker mode

### [monstache v3.0.2](https://github.com/rwynn/monstache/releases/tag/v3.0.2)


- add option to configure elasticsearch client http timout.  up the default timeout to 60 seconds


### [monstache v3.0.1](https://github.com/rwynn/monstache/releases/tag/v3.0.1)


- upgrade gtm to fix an issue where a mongodb query error (such as CappedPositionLost) causes the tail go routine to exit (after which no more events will be processed)


### [monstache v3.0.0](https://github.com/rwynn/monstache/releases/tag/v3.0.0)


- new major release
- configuration changes with regards to Elasticsearch.  see docs for details
- adds ability to write rolling logs to files
- adds ability to log indexing statistics
- changed go Elasticsearch client from elastigo to elastic which provides more API coverage
- upgrade gtm


### [monstache v2.14.0](https://github.com/rwynn/monstache/releases/tag/v2.14.0)


- add support for golang plugins.  you can now do in golang what you previously could do in javascript
- add more detail to bulk indexing errors
- upgrade gtm


### [monstache v2.13.0](https://github.com/rwynn/monstache/releases/tag/v2.13.0)


- add direct-read-ns option.  allows one to sync documents directly from a set of collections in addition to going through the oplog
- add exit-after-direct-reads option.  tells monstache to exit after performing direct reads.  useful for running monstache as a cron job.  
- fix issue around custom routing where db name was being stored as an array
- upgrade gtm


### [monstache v2.12.0](https://github.com/rwynn/monstache/releases/tag/v2.12.0)


- Fix order of operations surrounding db or collection drops in the oplog.  Required the removal of some gtm-options introduced in 2.11.  
- Built with latest version of gtm which includes some performance gains
- Add ssl option under mongo-dial-settings.  Previously, in order to enable connections with TLS one had to provide a PEM file.  Now, one can enable TLS without a PEM file by setting this new option to true.  This was tested with MongoDB Atlas which requires SSL but does not provide a PEM file


### [monstache v2.11.2](https://github.com/rwynn/monstache/releases/tag/v2.11.2)


- Built with Go 1.8
- Added option `fail-fast`
- Added option `index-oplog-time`


### [monstache v2.11.1](https://github.com/rwynn/monstache/releases/tag/v2.11.1)


- Built with Go 1.8
- Performance improvements
- Support for [rfc7386](https://tools.ietf.org/html/rfc7386) JSON merge patches
- Support for overriding Elasticsearch index and type in JavaScript
- More configuration options surfaced


### [monstache v2.10.0](https://github.com/rwynn/monstache/releases/tag/v2.10.0)


- add shard routing capability
- add Makefile


### [monstache v2.9.3](https://github.com/rwynn/monstache/releases/tag/v2.9.3)


- extend ttl for active in cluster to reduce process switching


### [monstache v2.9.2](https://github.com/rwynn/monstache/releases/tag/v2.9.2)

- fix potential collision on floating point _id closes #16


### [monstache v2.9.1](https://github.com/rwynn/monstache/releases/tag/v2.9.1)

- fix an edge case #18 where a process resuming for the cluster would remain paused

### [monstache v2.9](https://github.com/rwynn/monstache/releases/tag/v2.9)

- fix an issue with formatting of integer ids
- enable option for new clustering feature for high availability
- add TLS skip verify options for mongodb and elasticsearch
- add an option to specify a specific timestamp to start syncing from


### [monstache v2.8.1](https://github.com/rwynn/monstache/releases/tag/v2.8.1)

- fix an index out of bounds panic during error reporting
- surface gtm options for setting the oplog database and collection name as well as the cursor timeout
- report an error if unable to unzip a response when verbose is true


### [monstache v2.8](https://github.com/rwynn/monstache/releases/tag/v2.8)

- add a version flag -v
- document the elasticsearch-pem-file option
- add the elasticsearch-hosts option to configure pool of available nodes within a cluster


### [monstache v2.7](https://github.com/rwynn/monstache/releases/tag/v2.7)

- add a gzip configuration option to increase performance
- default resume-name to the worker name if defined
- decrease binary size by building with -ldflags "-w"


### [monstache v2.6](https://github.com/rwynn/monstache/releases/tag/v2.6)

- reuse allocations made for gridfs files
- add workers feature to distribute synching between multiple processes

### [monstache v2.5](https://github.com/rwynn/monstache/releases/tag/v2.5)

- add option to speed up writes when saving resume state
- remove extra buffering when adding file content


### [monstache v2.4](https://github.com/rwynn/monstache/releases/tag/v2.4)

- Fixed issue #10
- Fixed issue #11

### [monstache v2.3](https://github.com/rwynn/monstache/releases/tag/v2.3)

- Added configuration option for max file size
- Added code to normalize index and type names based on restrictions in Elasticsearch
- Performance improvements for GridFs files


### [monstache v2.2](https://github.com/rwynn/monstache/releases/tag/v2.2)

- Added configuration option for dropped databases and dropped collections.  See the README for more
  information.


### [monstache v2.1](https://github.com/rwynn/monstache/releases/tag/v2.1)

- Added support for dropped databases and collections. Now when you drop a database or collection from
  mongodb the corresponding indexes are deleted in elasticsearch.


### [monstache v2.0](https://github.com/rwynn/monstache/releases/tag/v2.0)

- Fixes an issue with the default mapping between mongodb and elasticsearch.  Previously, each database
  in mongodb was mapped to an index of the same name in elasticsearch.  This creates a problem because
  mongodb document ids are only guaranteed unique at the collection level.  If there are 2 or more documents
  in a mongodb database with the same id those documents were previously written to the same elasticsearch index.
  This fix changes the default mapping such that the entire mongodb document namespace (database + collection)
  is mapped to the destination index in elasticsearch.  This prevents the possibility of collisions within
  an index. Since this change requires reindexing of previously indexed data using monstache, the version 
  number of monstache was bumped to 2.  This change also means that by default you will have an index in
  elasticsearch for each mongodb collection instead of each mongod database.  So more indexes by default.
  You still have control to override the default mapping.  See the docs for how to explicitly control the index
  and type used for a particular mongodb namespace.
- Bumps the go version to 1.7.3 


### [monstache v1.3.1](https://github.com/rwynn/monstache/releases/tag/v1.3.1)

- Version 1.3 rebuilt with go1.7.1


### [monstache v1.3](https://github.com/rwynn/monstache/releases/tag/v1.3)

- Improve log messages
- Add support for the ingest-attachment plugin in elasticsearch 5


### [monstache v1.2](https://github.com/rwynn/monstache/releases/tag/v1.2)

- Improve Error Reporting and Add Config Options


### [monstache v1.1](https://github.com/rwynn/monstache/releases/tag/v1.1)

- Fixes crash during replay (issue #2)
- Adds supports for indexing GridFS content (issue #3)


### [monstache v1.0](https://github.com/rwynn/monstache/releases/tag/v1.0)

- 64-bit Linux binary built with go1.6.2


### [monstache v0.8-beta.2](https://github.com/rwynn/monstache/releases/tag/v0.8-beta.2)

- 64-bit Linux binary built with go1.6.2


### [monstache v0.8-beta.1](https://github.com/rwynn/monstache/releases/tag/v0.8-beta.1)

- 64-bit Linux binary built with go1.6.2


### [monstache v0.8-beta](https://github.com/rwynn/monstache/releases/tag/v0.8-beta)

- 64-bit Linux binary built with go1.6.2


### [monstache v0.8-alpha](https://github.com/rwynn/monstache/releases/tag/v0.8-alpha)

- 64-bit Linux binary built with go1.6.2

