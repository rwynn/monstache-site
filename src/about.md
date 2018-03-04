# About

---

## License

The MIT License (MIT)

Copyright (c) 2016-2018 Ryan Wynn

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
Monstache you can do so with the following command. This can be useful if you
want to provide feedback for a new feature or want to confirm if a bug you
have encountered is fixed in the git master.

```bash
go get -u github.com/rwynn/monstache
```

### Running the tests

To run the tests, you will need to have local mongod and elasticsearch servers running.  
Then you will need to start a monstache process in one terminal or in the background.

```bash
monstache -verbose
```

Finally in another terminal you can run the tests by issuing the following commands 

```bash
cd $GOPATH/src/github.com/rwynn/monstache
go test -v
```

!!! warning

    Running the Monstache tests will perform modifications to the `test.test` namespace in 
    MongoDB and will index documents in the `test.test` index in Elasticsearch.  If you have
    data that you need to keep on your local servers, make a back up before running the tests.

### Submitting Pull Requests

Once you are happy with your changes or you are ready for some feedback, push
it to your fork and send a pull request. For a change to be accepted it will
most likely need to have tests and documentation if it is a new feature.

## Release Notes

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

