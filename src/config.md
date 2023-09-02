# Configuration

---

Configuration can be specified in environment variables (a limited set of options), in a TOML config file or 
passed into monstache as program arguments on the command line.

Environment variables names can be suffixed with __FILE.  In this case the value of the environment variable will
be interpreted as a file path.  Monstache will attempt to read the file at that path and use the contents of the file
as the value of the variable.

!!! note
	Command line arguments take precedance over environment variables which in turn take precedance over the 
	TOML config file. You can verify the final configuration used by Monstache by running monstache with `-print-config`.

!!! warning
	Keep simple one-line configs **above** any TOML table definitions in your config file.  A TOML table 
	is only ended by another TOML table or the end of the file.  Anything below a TOML table will be 
	interpreted to be part of the table by the parser unless it is ended. See the following 
	[Issue 58](https://github.com/rwynn/monstache/issues/58#issuecomment-381275381) for more information.

## aws-connect

TOML table (default `nil`)

Enable support for using a connection to Elasticsearch that uses AWS Signature Version 4

!!! note ""

	#### strategy

	int (default 0)

	The stategy used to configure the AWS credential provider.  The 0 strategy is static and uses the values of `access-key`
	and `secret-key`.  The 1 strategy is file based and loads the credentials from the `credentials-file` setting or from value 
	of the standard `AWS_SHARED_CREDENTIALS_FILE`, or `~/.aws/credentials`. The 2 strategy loads the credentials from the standard
	AWS environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`. The 3 strategy loads the credentials from the default
	remote endpoints such as EC2 or ECS roles.  The 4 strategy chains together strategies 1-3 and uses the first strategy that returns
	a credential.

	#### credentials-file

	string (default "~/.aws/credentials")

	The credentials file to use.  Normally, you need not set this as it will come from either `AWS_SHARED_CREDENTIALS_FILE` or default
	to `~/.aws/credentials`.

	#### profile

	string (default "")

	The AWS profile to use from the credentials file.  If not provided a profile named `default` will be used.

	#### watch-credentials

	bool (default false)

	Set to true to put a watch on the `credentials-watch-dir`.  When a file in the watch dir is changed monstache will invalidate the
	credentials such that they will be re-established on the next request to Elasticsearch.

	#### credentials-watch-dir

	string (default "~/.aws")

	The path to a directory to watch for changes if `watch-credentials` is enabled.

	#### force-expire

	string (default "")

	A golang duration string, e.g. 5m.  If given, monstache will force expire the credentials on this interval.

	#### access-key

	string (default "") (env var name `MONSTACHE_AWS_ACCESS_KEY`)

	AWS Access Key

	#### secret-key

	string (default "") (env var name `MONSTACHE_AWS_SECRET_KEY`)

	AWS Secret Key

	#### region

	string (default "") (env var name `MONSTACHE_AWS_REGION`)

	AWS Region

## change-stream-namespaces

[]string (default `nil`) (env var name `MONSTACHE_CHANGE_STREAM_NS`)

!!! note ""
	This option requires MongoDB 3.6 or above

This option allows you to opt in to using MongoDB [change streams](https://docs.mongodb.com/manual/changeStreams/).  
The namespaces included will be tailed using `watch` API.
When this option is enabled the direct tailing of the oplog is disabled, therefore you do not need to specify additional
regular expressions to filter the set of collections to watch.

If you are using MongoDB 4 or greater you can open a change stream against entire databases or 
even the entire deployment. To tail a database set the value of the namespace to the database name. 
For example, instead of `db.collection` the value would simply be `db`. To tail the entire deployment
use an empty string as the namespace value.  For example, `change-stream-namespaces = [ '' ]`.

!!! note ""
	This option may be passed on the command line as ./monstache --change-stream-namespace test.foo

	If specified as an environment variable the value should be namespaces separated only by the `env-delimiter` which
	defaults to a comma.  E.g. `MONSTACHE_CHANGE_STREAM_NS=test.foo,test.bar`

## config-database-name

string (default `monstache`) 

The name of the MongoDB database that monstache will store metadata under.  This metadata includes information to support resuming from a specific point in the oplog and managing cluster mode. This database is only written to for some configurations.  Namely, if you specify `cluster-name`, enable `resume` or set `direct-read-stateful`. WARNING: If you are listening to changes via `change-stream-namespaces`, you cannot set the same database to both listen to changes & store the configs in.

## cluster-name

string (default `""`) (env var name `MONSTACHE_CLUSTER`)

When cluster-name is given monstache will enter a high availablity mode. Processes with cluster name set to the same value will coordinate.  Only one of the
processes in a cluster will sync changes.  The other processes will be in a paused state.  If the process which is syncing changes goes down for some reason
one of the processes in paused state will take control and start syncing.  See the section [high availability](../advanced/#high-availability) for more information.

## delete-index-pattern

string (default `*`)

When using a stateless delete strategy, set this to a valid Elasticsearch index pattern to restrict the scope of possible indexes that a stateless delete
will consider.  If monstache only indexes to index a, b, and c then you can set this to `a,b,c`.  If monstache only indexes to indexes starting with 
mydb then you can set this to `mydb*`.  

## delete-strategy

int (default `0`)

The strategy to use for handling document deletes when custom indexing is done in scripts.

**Strategy 0** -default- will do a term query by document id across all Elasticsearch indexes in `delete-index-pattern`.
Will only perform the delete if one single document is returned by the query.

**Stategy 1** -deprecated- will store indexing metadata in MongoDB in the `monstache.meta` collection and use this metadata to locate and delete the document.

**Stategy 2** will completely ignore document deletes in MongoDB.

## direct-read-bounded

boolean (default `false`)

When this option is enabled monstache will ensure that all direct read queries have a min and max set on the query.
This ensures that direct reads will complete and not chase new data that is being inserted while the cursor is being
exhausted.

## direct-read-concur

int (default `0`) 

This option allows you to control the number of namespaces in `direct-read-namespaces` which will be syncing concurrently.
By default monstache starts reading and syncing all namespaces concurrently.  If this places too much stress on MongoDB then
you can set this option to an integer greater than 0.  If you set it to `1`, for example, then monstache will sync the
collections serially.  Numbers greater than 1 allow you to sync collections in batches of that size.

## direct-read-dynamic-exclude-regex

string (default `""`) (env var name `MONSTACHE_DIRECT_READ_NS_DYNAMIC_EXCLUDE_REGEX`)

This option is only available in monstache v5 and v6.

This options allows you to exclude any collections that match the given regex when monstache is directed to dynamically
register `direct-read-namespaces`.  When direct read namespaces are explicit it is not used.

## direct-read-dynamic-include-regex

string (default `""`) (env var name `MONSTACHE_DIRECT_READ_NS_DYNAMIC_INCLUDE_REGEX`)

This option is only available in monstache v5 and v6.

This options allows you to only include collections that match the given regex when monstache is directed to dynamically
register `direct-read-namespaces`.  When direct read namespaces are explicit it is not used.


## direct-read-namespaces

[]string (default `nil`) (env var name `MONSTACHE_DIRECT_READ_NS`)

This option allows you to directly copy collections from MongoDB to Elasticsearch. Monstache allows filtering the data that is
actually indexed to Elasticsearch, so you need not necessarily copy the entire collection.

!!! note
    In monstache v5 and v6 you can use an array with a single empty string to direct monstache to dynamically discover your
    collections and perform direct reads on them.  When `direct-read-dynamic-exclude-regex` is configured you can prune 
    from the list that is discovered.  System collections will not be considered for inclusion in the discovery.

Since the oplog is a capped collection it may only contain a subset of all your data.  In this case you can perform a direct
sync of Mongodb to Elasticsearch.  To do this, set direct-read-namespaces to an array of namespaces that you would 
like to copy.  Monstache will perform reads directly from the given set of db.collection and sync them to Elasticsearch.

!!! note
	This option may be passed on the command line as 
	./monstache --direct-read-namespace test.foo --direct-read-namespace test.bar

	If specified as an environment variable the value should be namespaces separated only by the `env-delimiter` which
	defaults to a comma.  E.g. `MONSTACHE_DIRECT_READ_NS=test.foo,test.bar`

!!! warning
	When direct reads are enabled Monstache still processes change events while the direct reads are being performed.  
	It does not wait until direct reads are completed to start listening for changes.  This is to ensure that any 
	changes that occur during the direct read process get synchronized.

By default, Monstache maps a MongoDB collection named `foo` in a database named `test` to the `test.foo` index in Elasticsearch.

For maximum indexing performance when doing alot of a direct reads you might want to adjust the refresh interval during 
indexing on the destination Elasticsearch indices.  The refresh interval can be set at a global level in elasticsearch.yml 
or on a per index basis by using the Index Settings or Index Template APIs.  

For more information see 
[Update Indices Settings](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-update-settings.html).

By default, Elasticsearch refreshes every second.  You will want to increase this value or turn off refresh completely 
during the indexing phase by setting the refresh_interval to -1.  Remember to reset the refresh_interval to a 
positive value and do a force merge after the indexing phase has completed if you decide to temporarily turn off refresh, 
otherwise you will not be able to see the new documents in queries.

Another way to speed up bulk indexing is to set the number_of_replicas to 0 while indexing and then later increase 
the number of replicas.  The following index template shows how one might configure a target index for better indexing
throughput by controlling replicas and the refresh interval. The index template needs to be installed before running monstache.

```
{
  "index_patterns": ["test.*"],
  "settings": {
    "number_of_shards": 5,
    "number_of_replicas": 0,
    "refresh_interval": "30s"
  }
}
```

## direct-read-no-timeout

boolean (default `false`)

When direct-read-no-timeout is true monstache will set the no cursor timeout flag on cursors opened for direct reads.
The default is not to do this since having cursors without timeouts is not generally a good practice.  However, for
reading very large collections you may find it necessary to avoid cursor timeout errors.  An alternative to enabling
this setting is to increase the cursor timeout on your MongoDB server or look into using the `direct-read-split-max`
and `direct-read-concur` options to limit the number of cursors opened for direct reads.

## direct-read-split-max

int (default `9`)

The maximum number of times to split a collection for direct reads.  This setting greatly impacts the memory consumption
of Monstache.  When direct reads are performed, the collection is first broken up into ranges which are then read 
concurrently is separate go routines.  If you increase this value you will notice the connection count increase in mongostat
when direct reads are performed.  You will also notice the memory consumption of Monstache grow.  Increasing this value can
increase the throughput for reading large collections, but you need to have enough memory available to Monstache to do so.
You can decrease this value for a memory constrained Monstache process.

To disable collection splitting altogether, set this option to `-1`.  In this case monstache will not try to segment the
collection, but rather use a single cursor for the entire read.

## direct-read-stateful

boolean (default `false`)

When this setting is set to true monstache will mark direct read namespaces as complete after they have been fully read in
a collection named `directreads` in the monstache config database.

On subsequent restarts monstache will check this collection and only start direct reads for the namespaces not in the completed list.

This allow you to keep the list the direct read namespaces in the configuration but manage the list that has completed and should
not be run again externally in MongoDB. Deleting the `directreads` collection and restarting monstache will force a full sync.

## disable-change-events

boolean (default `false`)

When disable-change-events is true monstache will not listen to change events from the oplog or call watch on any collections.  This option is only
useful if you are using [direct-read-namespaces](#direct-read-namespaces) to copy collections and would prefer not to sync change events.

## disable-file-pipeline-put

boolean (default `false`)

This setting only applies to monstache versions 5 and 6.

When this option is true monstache will not attempt to auto create an ingest pipeline named `attachment` with a `file` field
at startup when `index-files` is enabled.  In this case the user must create the pipeline before running monstache.
For example, the user must issue a command against Elasticsearch as follows prior to running monstache in order 
to index GridFS files:

```
PUT _ingest/pipeline/attachment
{
  "description" : "Extract file information",
  "processors" : [
    {
      "attachment" : {
        "field" : "file",
        "indexed_chars" : -1
      }
    }
  ]
}
```

## dropped-databases

boolean (default `true`)

When dropped-databases is false monstache will not delete the mapped indexes in Elasticsearch if a MongoDB database is dropped

## dropped-collections

boolean (default `true`)

When dropped-collections is false monstache will not delete the mapped index in Elasticsearch if a MongoDB collection is dropped

## elasticsearch-user

string (default `""`) (env var name `MONSTACHE_ES_USER`)

Optional Elasticsearch username for basic auth

## elasticsearch-password

string (default `""`) (env var name `MONSTACHE_ES_PASS`)

Optional Elasticsearch password for basic auth

## elasticsearch-urls

[]string (default `[ "http://localhost:9200" ]`) (env var name `MONSTACHE_ES_URLS`)

An array of URLs to connect to the Elasticsearch REST Interface

!!! note
	This option may be passed on the command line as ./monstache --elasticsearch-url URL1 --elasticsearch-url URL2 

	If specified as an environment variable the value should be URLs separated only by the `env-delimiter` which
	defaults to a comma.  E.g. `MONSTACHE_ES_URLS=http://es1:9200,http://es2:9200`

## elasticsearch-healthcheck-timeout-startup

int (default `15`)

The number of seconds to wait on the initial health check to Elasticsearch to responed before giving up
and exiting.

## elasticsearch-healthcheck-timeout

int (default `5`)

The number of seconds to wait for a post-initial health check to Elasticsearch to respond

## elasticsearch-version

string (by default `determined by connecting to the server`)

When elasticsearch-version is provided monstache will parse the given server version to determine how to interact with
the Elasticsearch API.  This is normally not recommended because monstache will connect to Elasticsearch to find out
which version is being used.  This option is provided for cases where connecting to the base URL of the Elasticsearch REST
API to get the version is not possible or desired.

## elasticsearch-max-conns

int (default `4`)

The size of the Elasticsearch HTTP connection pool. This determines the concurrency of bulk indexing requests to Elasticsearch.
If you increase this value too high you may begin to see bulk indexing failures if the bulk index queue gets overloaded.
To increase the size of the bulk indexing queue you can update the Elasticsearch config file:

	thread_pool:
	    bulk:
		queue_size: 200

For more information see [Thread Pool](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-threadpool.html).

You will want to tune this variable in sync with the `elasticsearch-max-bytes` option.

## elasticsearch-retry

boolean (default `false`)

When elasticseach-retry is true a failed request to Elasticsearch will be retried with an exponential backoff policy. The policy
is set with an initial timeout of 50 ms, an exponential factor of 2, and a max wait of 20 seconds. For more information on how 
this works see [Back Off Strategy](https://github.com/olivere/elastic/blob/release-branch.v5/backoff.go)

## elasticsearch-client-timeout

int (default `0`)

The number of seconds before a request to Elasticsearch times out. A setting of 0, the default, disables the timeout.

## elasticsearch-max-docs

int (default `-1`)

When elasticsearch-max-docs is given a bulk index request to Elasticsearch will be forced when the buffer reaches the given number of documents.

!!! warning
	It is not recommended to change this option but rather use `elasticsearch-max-bytes` instead since the document count is not a good gauge of when
	to flush.  The default value of -1 means to not use the number of docs as a flush indicator. 

## elasticsearch-max-bytes

int (default 8MB as bytes)

When elasticsearch-max-bytes is given a bulk index request to Elasticsearch will be forced when a connection buffer reaches the given number of bytes. This
setting greatly impacts performance. A high value for this setting will cause high memory monstache memory usage as the documents are buffered in memory.

Each connection in `elasticsearch-max-conns` will flush when its queue gets filled to this size. 

## elasticsearch-max-seconds

int (default `1`)

When elasticsearch-max-seconds is given a bulk index request to Elasticsearch will be forced when a request has not been made in the given number of seconds.
The default value is automatically increased to `5` when direct read namespaces are detected.  This is to ensure that flushes do not happen too often in this
case which would cut performance.

## elasticsearch-pem-file

string (default `""`) (env var name `MONSTACHE_ES_PEM`)

When elasticsearch-pem-file is given monstache will use the given file path to add a local certificate to x509 cert
pool when connecting to Elasticsearch. This should only be used when Elasticsearch is configured with SSL enabled.

## elasticsearch-pki-auth

TOML table (default `nil`)

Used to configure client to use PKI user auth for Elasticsearch  

!!! note ""

	#### cert-file

	string (default "") (env var name `MONSTACHE_ES_PKI_CERT`)

	Path to the cert file e.g. the --cert argument to curl

	#### key-file

	string (default "") (env var name `MONSTACHE_ES_PKI_KEY`)

	Path to the key file e.g. the --key argument to curl

## elasticsearch-validate-pem-file

boolean (default `true`) (env var name `MONSTACHE_ES_VALIDATE_PEM`)

When elasticsearch-validate-pem-file is false TLS will be configured to skip verification

## enable-easy-json

boolean (default `false`)

When enable-easy-json is true monstache will use the easy-json library to serialize requests to Elasticsearch

## enable-http-server

boolean (default `false`)

Add this flag to enable an embedded HTTP server at localhost:8080

## enable-oplog

boolean (default `false`)

This option only applies to monstache v5 and v6.  Enabling it turns on change event emulation feature that
tails the MongoDB oplog directly.  It should only be turned on when pairing monstache v5 or v6 with a MongoDB
server at a server compatibility version less than 3.6.

## enable-patches

boolean (default `false`) 

Set to true to enable storing [rfc7396](https://tools.ietf.org/html/rfc7396) patches in your Elasticsearch documents

## env-delimiter

string (default `,`)

This option is only supported on the command line.  The value for this delimiter will be used to split environment variable values when the
environment variable is used in conjunction with an option of array type.  E.g. with `export MONSTACHE_DIRECT_READ_NS=test.test,foo.bar`.

## exit-after-direct-reads

boolean (default `false`)

The [direct-read-namespaces](#direct-read-namespaces) option gives you a way to do a full sync on multiple collections.  At times you may want
to perform a full sync via the direct-read-namespaces option and then quit monstache.  Set this option to true and
monstache will exit after syncing the direct read collections instead of continuing to tail the oplog. This is useful
if you would like to run monstache to run a full sync on a set of collections via a cron job.

## fail-fast

boolean (default `false`)

When fail-fast is true, if monstache receives a failed bulk indexing response from Elasticsearch, monstache
will log the request that produced the response as an ERROR and then exit immediately with an error status. 
Normally, monstache just logs the error and continues processing events.

If monstache has been configured with [elasticsearch-retry](#elasticsearch-retry) true, a failed request will be
retried before being considered a failure.

## file-downloaders

int (default `10`)

Number of go routines concurrently processing GridFS files when file `index-files` is turned on.

## file-highlighting

boolean (default `false`)

When file-highlighting is true monstache will enable the ability to return highlighted keywords in the extracted text of files
for queries on files which were indexed in Elasticsearch from gridfs.

## file-namespaces

[]string (default `nil`) (env var name `MONSTACHE_FILE_NS`)

The file-namespaces config must be set when index-files is enabled.  file-namespaces must be set to an array of MongoDB
namespace strings.  Files uploaded through gridfs to any of the namespaces in file-namespaces will be retrieved and their
raw content indexed into Elasticsearch via either the mapper-attachments or ingest-attachment plugin. 

!!! note
	This option may be passed on the command line as ./monstache --file-namespace test.foo --file-namespace test.bar

	If specified as an environment variable the value should be namespaces separated only by the `env-delimiter` which
	defaults to a comma.  E.g. `MONSTACHE_FILE_NS=test.foo,test.bar`

## filter

[] array of TOML table (default `nil`)

When filter is given monstache will pass the MongoDB document from an insert or update operation into the filter function immediately after it is read from the oplog.  Return true from the function to continue processing the document or false to completely ignore the document. See the section [Middleware](../advanced/#middleware) for more information.

!!! note ""

	#### namespace

	string (default "")

	The MongoDB namespace, db.collection, to apply the script to.  If you omit namespace the filter function will be applied to all documents.

	#### script

	string (default "")

	An inline script.  You can use TOML multiline syntax here. The function should take 2 arguments, a doc and a namespace, and return true/false to
	include or filter the document.

	#### path

	string (default "")

	The file path to load a script from.  Use this or an inline script but not both. Can be a
    path relative to the directory monstache is executed from or an absolute path.

## graylog-addr

string (default "") (env var name `MONSTACHE_GRAYLOG_ADDR`)

The address of a graylog server to redirect logs to in GELF 

## gtm-settings

TOML table (default `nil`)

The following gtm configuration properties are available.  See [gtm](https://github.com/rwynn/gtm) for details

!!! note ""

	#### channel-size

	int (default 512)

	Controls the size of the go channels created for processing events.  When many events
	are processed at once a larger channel size may prevent blocking in gtm.

	#### buffer-size

	int (default 32)

	Determines how many documents are buffered by a gtm worker go routine before they are batch fetched from
	MongoDB.  When many documents are inserted or updated at once it is better to fetch them together.

	#### buffer-duration

	string (default 75ms)

	A string representation of a golang duration.  Determines the maximum time a buffer is held before it is 
	fetched in batch from MongoDB and flushed for indexing.

    #### max-await-time

    string (default "")

    A string represetation of a golang duration, e.g. "10s".  If set, will be converted and passed at the
    `maxAwaitTimeMS` option for change streams.  This determines the maximum amount of time in milliseconds 
    the server waits for new data changes to report to the change stream cursor before returning an empty batch.

## gzip

boolean (default `false`)

When gzip is true, monstache will compress requests to Elasticsearch. 
If you enable gzip in monstache and are using Elasticsearch prior to version 5 you will also 
need to update the Elasticsearch config file to set http.compression: true. In Elasticsearch 
version 5 and above http.compression is enabled by default. Enabling gzip compression is recommended 
if you enable the index-files setting.

## http-server-addr

string (default `:8080`) (env var name `MONSTACHE_HTTP_ADDR`)

The address to bind the embedded HTTP server on if enabled

## index-as-update

boolean (default `false`)

When index-as-update is set to true monstache will sync create and update operations in MongoDB
as updates to Elasticsearch. This does not change the fact that Monstache always sends an entire copy of
the data in MongoDB.  It just means that any existing non-overlapping fields in Elasticsearch will be maintained.

By default, monstache will overwrite the entire document in Elasticsearch.
This setting may be useful if you make updates to Elasticsearch to the documents monstache has previously
synced out of band and would like to retain these updates when the document changes in MongoDB. 
You will only be able to retain fields in Elasticsearch that do not overlap with fields in MongoDB.

When this setting is turned on some guarantees about the order of operations applied in Elasticsearch are lost.
The reason for this is that the version field cannot be set with this enabled.  The version field by default is set to
the timestamp of the event in MongoDB. Elasticsearch will only apply changes if the version number is greater or
equal to the last value indexed maintaining serialization. 

If you enable this setting and do not see serialized updates in MongoDB being indexed
correctly then you can mitigate this problem with the following settings:

```
elasticsearch-max-conns = 1

[gtm-settings]
buffer-size = 2048
buffer-duration = 4s
```

## index-files

boolean (default `false`)

When index-files is true monstache will index the raw content of files stored in GridFS into Elasticsearch as an attachment type.
By default index-files is false meaning that monstache will only index metadata associated with files stored in GridFS.
In order for index-files to index the raw content of files stored in GridFS you must install a plugin for Elasticsearch.
For versions of Elasticsearch prior to version 5, you should install the [mapper-attachments](https://www.elastic.co/guide/en/elasticsearch/plugins/2.4/mapper-attachments.html) plugin.  In version 5 or greater
of Elasticsearch the mapper-attachment plugin is deprecated and you should install the [ingest-attachment](https://www.elastic.co/guide/en/elasticsearch/plugins/master/ingest-attachment.html) plugin instead.
For further information on how to configure monstache to index content from GridFS, see the section [GridFS support](../advanced/#gridfs-support).

## index-oplog-time

boolean (default `false`)

If this option is set to true monstache will include 2 automatic fields in the source document indexed into
Elasticsearch.  The first is `oplog_ts` which is the timestamp for the event copied directly from the MongoDB
oplog. The second is `oplog_date` which is an Elasticsearch date field corresponding to the time of the same
event.

This information is generally useful in Elasticsearch giving the notion of last updated.  However, it's also
valuable information to have for failed indexing requests since it gives one the information to replay from 
a failure point.  See the option [resume-from-timestamp](#resume-from-timestamp) for information on how to replay oplog events since 
a given event occurred. 

For data read via the direct read feature the oplog time will only be available if the id of the MongoDB
document is an ObjectID.  If the id of the MongoDB document is not an ObjectID and the document source is
a direct read query then the oplog time will not be available.

## index-stats

boolean (default `false`)

When both stats and index-stats are true monstache will write statistics about its indexing progress in
Elasticsearch instead of standard out.

The indexes used to store the statistics are time stamped by day and 
prefixed `monstache.stats.`. E.g. monstache.stats.2017-07-01 and so on. 

As these indexes will accrue over time your can use a tool like [curator](https://github.com/elastic/curator)
to prune them with a Delete Indices action and an age filter.

## logs

TOML table (default `nil`) (env var name `MONSTACHE_LOG_DIR`)

Allows writing logs to a file using a rolling appender instead of stdout.  Supply a file path for each type of log you would like to send to a file.
When the `MONSTACHE_LOG_DIR` environment variable is used then a log file for each log level will be generated in the given directory.

!!! note ""

	#### info

	string (default "")

	The file path to write info level logs to

	#### warn

	string (default "")

	The file path to write warning level logs to

	#### error

	string (default "")

	The file path to write error level logs to

	#### trace

	string (default "")

	The file path to write trace level logs to. Trace logs are enabled via the verbose option.

	#### stats

	string (default "")

	The file path to write indexing statistics to. Stats logs are enabled via the stats option.

## log-rotate

TOML table (default `nil`)

Use to configure how log files are rotated/managed when logging to files. These options are passed
through to the [lumberjack](https://github.com/natefinch/lumberjack) logger.

!!! note ""

	#### max-size

	int (default 500) (env var name `MONSTACHE_LOG_MAX_SIZE`)

    MaxSize is the maximum size in megabytes of the log file before it gets rotated.

	#### max-age

	int (default 28) (env var name `MONSTACHE_LOG_MAX_AGE`)

    MaxAge is the maximum number of days to retain old log files based on the
    timestamp encoded in their filename.  Note that a day is defined as 24
    hours and may not exactly correspond to calendar days due to daylight
    savings, leap seconds, etc. Use a value of zero to ignore the age of files.

    #### max-backups

    int (default 5) (env var name `MONSTACHE_LOG_MAX_BACKUPS`)

    MaxBackups is the maximum number of old log files to retain. Use a value of
    zero to retain all old log files (though MaxAge may still cause them to get
    deleted.)

	#### localtime

	boolean (default false)

    LocalTime determines if the time used for formatting the timestamps in
    backup files is the computer's local time.  The default is to use UTC
    time.

	#### compress

	boolean (default false)

    Compress determines if the rotated log files should be compressed
    using gzip. The default is not to perform compression.

## mapper-plugin-path

string (default `""`)

The path to an .so file golang plugin.

## mapping

[] array of TOML table (default `nil`)

When mapping is given monstache will be directed to override the default index and type assigned to documents in Elasticsearch.
See the section [Index Mapping](../advanced/#index-mapping) for more information.

!!! note ""

	#### namespace

	string (default "")

	The MongoDB namespace, db.collection, to apply the mapping to.

	#### index

	string (default "same as namespace including the dot. e.g. test.test")

	Allows you to override the default index that monstache will send documents to.  By default, the index is the same as the MongoDB namespace.

	#### type

	string (default "_doc for ES 6.2+ and the name of the MongoDB collection otherwise")

	Allows you to override the default type that monstache will index documents with.  Overriding the type is not recommended for Elasticsearch version
	6.2+.

	#### pipeline

	string (default "")

	The name of an existing Elasticsearch pipeline to index the data with. A pipeline is a series of Elasticsearch processors to be executed.  An Elasticsearch pipeline is one way to transform MongoDB data before indexing.

## max-file-size

int (default `0`)

When max-file-size is greater than 0 monstache will not index the content of GridFS files that exceed this limit in bytes.

## merge-patch-attribute

string (default `json-merge-patches`) 

Customize the name of the property under which merge patches are stored

## mongo-url

string (default `localhost`) (env var name `MONSTACHE_MONGO_URL`)

The URL to connect to MongoDB which must follow the [Standard Connection String Format](https://docs.mongodb.com/v3.0/reference/connection-string/#standard-connection-string-format)

For sharded clusters this URL should point to the `mongos` router server and the [mongo-config-url](#mongo-config-url)
option must be set to point to the config server.

## mongo-config-url

string (default `""`) (env var name `MONSTACHE_MONGO_CONFIG_URL`)

This config must only be set for sharded MongoDB clusters. Has the same syntax as mongo-url.
This URL must point to the MongoDB `config` server.

Monstache will read the list of shards using this connection and then setup a listener to react
to new shards being added to the cluster at a later time. It will then setup a new direct connection to
each shard to listen for events.

!!! note ""
	Setting the mongo-config-url is not necessary if you are using [change-stream-namespaces](#change-stream-namespaces).

## mongo-pem-file

string (default `""`) (env var name `MONSTACHE_MONGO_PEM`)

!!! note ""
    This setting only applies to the mgo driver in monstache versions 3 and 4. The driver in monstache 5 and 6
    uses the connection string for all settings.

When mongo-pem-file is given monstache will use the given file path to add a local certificate to x509 cert
pool when connecting to MongoDB. This should only be used when MongoDB is configured with SSL enabled.

## mongo-validate-pem-file

boolean (default `true`) (env var name `MONSTACHE_MONGO_VALIDATE_PEM`)

!!! note ""
    This setting only applies to the mgo driver in monstache versions 3 and 4. The driver in monstache 5 and 6
    uses the connection string for all settings.

When mongo-validate-pem-file is false TLS will be configured to skip verification

## mongo-oplog-database-name

string (default `local`) (env var name `MONSTACHE_MONGO_OPLOG_DB`)

When mongo-oplog-database-name is given monstache will look for the MongoDB oplog in the supplied database

## mongo-oplog-collection-name

string (default `oplog.rs`) (env var name `MONSTACHE_MONGO_OPLOG_COL`)

When mongo-oplog-collection-name is given monstache will look for the MongoDB oplog in the supplied collection.
The collection defaults to `oplog.rs` which is what will be produced when replica sets are enabled.  If you are 
using an old version of MongoDB with `master` based replication instead of replica sets, then you will need to 
configure this setting to `oplog.$main`.

!!! warning
	If this setting was not supplied monstache would previously search for the first collection prefixed `oplog`
	in the `local` database.  However, starting in monstache `v4.13.1` and `v3.20.1` this behavior has changed.
	Now, monstache will not do dynamic resolution.  Since `master` based replication in MongoDB is no longer
	supported, monstache now defaults to `oplog.rs` and will only use another collection (e.g. `oplog.$main`) if 
	you explicitly config it to do so.

## mongo-dial-settings

TOML table (default `nil`)

!!! note ""
    This setting only applies to the mgo driver in monstache versions 3 and 4. The driver in monstache 5 and 6
    uses the connection string for all settings.

The following MongoDB dial properties are available.  Timeout values of 0 disable the timeout.

!!! note ""

	#### ssl

	##### bool (default false)

	Set to true to establish a connection using TLS.

	#### timeout

	##### int (default 15)

	Seconds to wait when establishing an initial connection to MongoDB before giving up

	#### read-timeout

	##### int (default 30)

	Seconds to wait when reading data from MongoDB before giving up. Must be greater than 0.
	This should be greater than 10 because Monstache waits 10s for new change events
	by retrying the query.

	#### write-timeout

	##### int (default 30)

	Seconds to wait when writing data to MongoDB before giving up. Must be greated than 0.
	This should be greater than 10 because Monstache waits 10s for new change events
	by retrying the query.

## mongo-session-settings

TOML table (default `nil`)

!!! note ""
    This setting only applies to the mgo driver in monstache versions 3 and 4. The driver in monstache 5 and 6
    uses the connection string for all settings.

The following MongoDB session properties are available. Timeout values of 0 disable the timeout.

!!! note ""

	#### socket-timeout

	int (default 0)

	Seconds to wait for a non-responding socket before it is forcefully closed

	#### sync-timeout

	int (default 30)

	Amount of time in seconds an operation will wait before returning an error in case a connection to a usable server can't be established.
	Must be greater than 0.

## mongo-x509-settings

TOML table (default `nil`)

!!! note ""
    This setting only applies to the mgo driver in monstache versions 3 and 4. The driver in monstache 5 and 6
    uses the connection string for all settings.

Allows one to configure x509 authentication with MongoDB. For more information see 
[x509 auth](https://docs.mongodb.com/manual/tutorial/configure-x509-client-authentication/).

!!! note
	You must configure your `mongo-url` with the request parameter `authMechanism=MONGODB-X509`.
	You must also supply both of the following file paths:

!!! note ""

	#### client-cert-pem-file

	string (default "")

	The path to a PEM encoded file containing the client cert

	#### client-key-pem-file

	string (default "")

	The path to a PEM encoded file containing the client key

## namespace-drop-exclude-regex

regex (default `""`) (env var name `MONSTACHE_NS_DROP_EXCLUDE_REGEX`)

When namespace-drop-exclude-regex is given this regex is tested against the namespace, database.collection, of drops in MongoDB. 
For database drops the namespace will be database-name.$cmd.  For collections drops the namespace will be database-name.collection-name.
If the regex does not match the namespace then the operation will by synced.

## namespace-drop-regex

regexp (default `""`) (env var name `MONSTACHE_NS_DROP_REGEX`)

When namespace-drop-regex is given this regex is tested against the namespace, database.collection, of drops in MongoDB. For database drops
the namespace will be database-name.$cmd.  For collections drops the namespace will be database-name.collection-name.  If the regex matches
the namespace then the operation will by synced.

## namespace-exclude-regex

regex (default `""`) (env var name `MONSTACHE_NS_EXCLUDE_REGEX`)

When namespace-exclude-regex is given this regex is tested against the namespace, database.collection, of any insert, update, delete in MongoDB.
If the regex matches monstache ignores the event, otherwise it continues processing event filters. By default monstache
processes events in all databases and all collections with the exception of the reserved database monstache, any
collections suffixed with .chunks, and the system collections. For more information see the section [Namespaces](../advanced/#namespaces).

## namespace-regex

regexp (default `""`) (env var name `MONSTACHE_NS_REGEX`)

When namespace-regex is given this regex is tested against the namespace, database.collection, of any insert, update, delete in MongoDB.
If the regex matches monstache continues processing event filters, otherwise it drops the event. By default monstache
processes events in all databases and all collections with the exception of the reserved database monstache, any
collections suffixed with .chunks, and the system collections. For more information see the section [Namespaces](../advanced/#namespaces).

## oplog-date-field-format

string (default `2006/01/02 15:04:05`)

Use this option to override the layout for formatting the `oplog_date` field.  Refer to 
the [Format](https://golang.org/pkg/time/#Time.Format) function for the reference time 
values to use in the layout.

## oplog-date-field-name

string (default `oplog_date`)

Use this option to override the name of the field used to store the oplog date string

## oplog-ts-field-name

string (default `oplog_ts`)

Use this option to override the name of the field used to store the oplog timestamp

## patch-namespaces

[]string (default `nil`) (env var name `MONSTACHE_PATCH_NS`)

An array of MongoDB namespaces that you would like to enable rfc7396 patches on

!!! note
	This option may be passed on the command line as ./monstache --patch-namespace test.foo --patch-namespace test.bar 

	If specified as an environment variable the value should be namespaces separated only by the `env-delimiter` which
	defaults to a comma.  E.g. `MONSTACHE_PATCH_NS=test.foo,test.bar`

## pipeline

[] array of TOML table (default `nil`)

When pipeline is given monstache will call the function specified to determine an array of aggregation pipeline stages to run.
See the section [Middleware](../advanced/#middleware) for more information.

!!! note ""

	#### namespace

	string (default "")

	The MongoDB namespace, db.collection, to apply the script to. If you omit the namespace the pipeline function with be applied to all namespaces.

	#### script

	string (default "")

	An inline script.  You can use TOML multiline syntax here.  The function should take 2 arguments, a namespace and a boolean indicating whether or not the data is a change stream.
	The function should return an array of aggregation pipeline stages. Note, for change streams the root of the pipeline will be the change event with a field `fullDocument` representing the
	changed doc.  You should alter your pipeline stages according to this boolean.  Monstache needs the change event data so do not replace the root of the document in your pipeline for change
	streams.

	#### path

	string (default "")

	The file path to load a script from.  Use this or an inline script but not both. Can be a path relative to the directory monstache is executed from or an absolute path.

## pipe-allow-disk

boolean (default `false`)

Add this flag to allow MongoDB to use the disk as a temporary store for data during aggregation pipelines

## post-processors

int (default `10`)

Number of go routines concurrently calling the `Process` method in any golang middleware plugins installed via `mapper-plugin-path`.

## pprof

boolean (default `false`)

When pprof is true and the http server is enabled, monstache will make profiling information available.

See [Profiling for Go](https://artem.krylysov.com/blog/2017/03/13/profiling-and-optimizing-go-web-applications/) for more information. 

## print-config

boolean (default `false`)

When print-config is true monstache will print its configuration and then exit

## prune-invalid-json

boolean (default `false`)

If your MongoDB data contains values like +Infinity, -Infinity, NaN, or invalid dates you will want to set this option to true.  The
Golang json serializer is not able to handle these values and the indexer will get stuck in an infinite loop. When prune-invalid-json
is set to true Monstache will drop those fields so that indexing errors do not occur.

## relate

[] array of TOML table (default `nil`)

Allows one to relate 2 namespaces together such that a change to one causes a sync of the associated namespace

!!! note ""

	#### namespace

	string (default "")

	The namespace of the collection that, when modified, triggers a sync of the with-namespace

	#### with-namespace

	string (default "")

	The namespace of the collection or view that will be synced when namespace changes

	#### src-field

	string (default "_id")

	The name of the field in namespace that will be extracted from the change doc and used as the value side of the query into with-namespace

	#### match-field

	string (default "_id")

	The name of the field in with-namespace that will be used as the field name to match side of the query into with-namespace

	#### match-field-type

	string (default "")

	Valid values for this property are `objectId`, `string`, `int`, `long` and `decimal`. If the property is given the value of the `src-field` will be converted into the type given (if possible) before being used to query against `match-field`.

	#### keep-src

	bool (default "false")

	Whether or not to sync the original change event in addition to the one looked up in with-namespace.
	By default the original change is ignored and only the document from with-namespace is synced.

	#### max-depth

	int (default 0)

    If max-depth is greater than 0 then the relationship will only fire if the number of relationships between
    this relate and the originating event is less than or equal to the value given.  By default monstache will
    continue following relationships until none are left.

    #### dot-notation

    bool (default "false")

    If `match-field` is a nested field like `foo.bar` then setting `dot-notation` to true
    produces the query `{ "foo.bar": 1 }` to MongoDB.  If `dot-notation` is not enabled then the query will
    be an exact match query sent as `{ foo { bar : 1 } }`.

## relate-buffer

int (default `1000`) 

Number of relate events allowed to queue up before skipping the event and reporting an error.
This setting was introduced to prevent scenarios where relate queries get queued up and stall
the pipeline.  You can increase this value if you are hitting this limit, but monstache will take
more memory to hold the events and you may find that MongoDB experiences high CPU due to Monstache
performing many queries concurrently to try to clear the buffer. This limit is usually hit when
you have a `relate` config and then do a mass insert or update against the relate namespace.

## relate-threads

int (default `10`) 

Number of go routines concurrently processing relationships when `relate` is enabled.  This dictates
the concurrency of queries trying to unload the relate queue.

## replay

boolean (default `false`)

!!! warning
    Replay is currently deprecated in favor of `direct-read-namespaces`.  Replay may be removed in a future release.

When replay is true, monstache replays all events from the beginning of the MongoDB oplog and syncs them to Elasticsearch. 

!!! note ""

	If you've previously synced Monstache to Elasticsearch you may see many WARN statments in the log indicating that there was a version conflict.
	This is normal during a replay and it just means that you already have data in Elasticsearch that is newer than the point in time data from the oplog.

When [resume](#resume) and replay are both true, monstache replays all events from the beginning of the MongoDB oplog, syncs them
to Elasticsearch and also writes the timestamps of processed events to monstache.monstache. 

When neither resume nor replay are true, monstache reads the last timestamp in the oplog and starts listening for events
occurring after this timestamp (tails starting at the end).  Timestamps are not written to monstache.monstache.  This is the default behavior. 

## resume

boolean (default `false`)

When resume is true, monstache writes the timestamp of MongoDB operations it has successfully synced to Elasticsearch
to the collection monstache.monstache.  It also reads that timestamp from that collection when it starts in order to replay
events which it might have missed because monstache was stopped. If monstache is started with the [cluster-name](#cluster-name)option set then resume is automatically turned on.

## resume-from-timestamp

int64 (default `0`)

This option only applies when the `resume-strategy` is 0 for timestamp based resume.

When resume-from-timestamp 
(a 64 bit timestamp where the high 32 bytes represent the number of seconds since epoch and the low 32 bits
represent an offset within a second) is given, monstache will sync events starting immediately after the timestamp.
This is useful if you have a specific timestamp from the oplog and would like to start syncing from after this event. 

!!! note ""
	If you supply an integer that is greater than 0 but less than or equal to the max value of a 
	32-bit integer then monstache will interpret the value as seconds since the epoch and automatically shift 
	the value 32 bits left.

## resume-name

string (default `default`)

monstache uses the value of resume-name as an id when storing and retrieving timestamps
to and from the MongoDB collection `monstache.monstache`. The default value for this option is the string `default`.
However, there are some exceptions.  If monstache is started with the [cluster-name](#cluster-name) option set then the
name of the cluster becomes the resume-name.  This is to ensure that any process in the cluster is able to resume
from the last timestamp successfully processed.  Another exception occurs when [worker](#worker) is enabled.
In that case the worker name becomes the resume-name.

## resume-strategy

int (default `0`)

The strategy to use for resuming streams from previous runs of monstache.  Only applies when `resume` is enabled.
This strategy is also used when `cluster-name` is set to ensure streams are resumed when the active process in the
cluster switches.

**Strategy 0** -default- Timestamp based resume of change streams.  Compatible with MongoDB API 4.0+.

**Stategy 1** Token based resume of change streams. Compatible with MongoDB API 3.6+.

Timestamps and tokens are written periodically to the database configured in `config-database-name`. Timestamps are
written to the collection named `monstache`.  Tokens are written to the collection named `tokens`.

## resume-write-unsafe

boolean (default `false`)

When resume-write-unsafe is true monstache sets the safety mode of the MongoDB session such that writes are fire and forget.
This speeds up writing of timestamps used to resume synching in a subsequent run of monstache.  This speed up comes at the cost
of no error checking on the write of the timestamp.  Since errors writing the last synched timestamp are only logged by monstache
and do not stop execution it's not unreasonable to set this to true to get a speedup.

## routing-namespaces

[]string (default `nil`)

You only need to set this configuration option if you use golang and javascript plugins are do custom routing: override parent or routing attributes. This array should be set to a list of all the namespaces that custom routing is done on. This ensures that deletes in MongoDB are routed correctly to 
Elasticsearch.

## script

[] array of TOML table (default `nil`)

When script is given monstache will pass the MongoDB document into the script before indexing into Elasticsearch.
See the section [Middleware](../advanced/#middleware) for more information.

!!! note ""

	#### namespace

	string (default "")

	The MongoDB namespace, db.collection, to apply the script to. If you omit the namespace the mapping function with be applied to all documents.

	#### routing

	boolean (default false)

	Set routing to true if you override the index, routing or parent metadata via _meta_monstache

	#### script

	string (default "")

	An inline script.  You can use TOML multiline syntax here.  The function should take 2 arguments, a doc and a namespace, and return a modified doc.
	You can also return true to index the original document or false to ignore the document and schedule any previous documents with the same id
	for deletion.

	#### path

	string (default "")

	The file path to load a script from.  Use this or an inline script but not both. Can be a path relative to the directory monstache is executed from or an absolute path.

## stats

boolean (default `false`)

When stats is true monstache will periodically print statistics accumulated by the indexer

## stats-duration

string (default `30s`)

Sets the duration after which statistics are printed if stats is enabled

## stats-index-format

string (default `monstache.stats.2006-01-02`)

The `time.Time` supported index name format for stats indices.  By default, stats indexes 
are partitioned by day.  To use less indices for stats you can shorten this format string 
(e.g monstache.stats.2006-01) or remove the time component completely to use a single index.  

## time-machine-namespaces

[]string (default `nil`) (env var name `MONSTACHE_TIME_MACHINE_NS`)

Monstache is good at keeping your MongoDB collections and Elasticsearch indexes in sync.  When a document is updated in MongoDB the corresponding document in Elasticsearch is updated too.  Same goes for deleting documents in MongoDB.  But what if you also wanted to keep a log of all the changes to a MongoDB document over its lifespan.  That's what time-machine-namespaces are for.  When you configure a list of namespaces in MongoDB to add to the time machine, in addition to keeping documents in sync, Monstache will index of copy of your MongoDB document at the time it changes in a separate timestamped index.

Say for example, you insert a document into the `test.test` collection in MongoDB.  Monstache will index by default into the `test.test` index in Elasticsearch, but with time machines it will also index it into `log.test.test.2018-02-19`.  When it indexes it into the time machine index it does so without the id from MongoDB and lets Elasticsearch generate a unique id.  But, it stores the id from MongoDB in the source field `_source_id`.  Also, it adds _oplog_ts and _oplog_date fields on the source document.  These correspond to the timestamp from the oplog when the data changed in MongoDB. Finally, it routes the document by the MongoDB id so that you can speed up queries later to find changes to a doc.

This lets you do some cool things but mostly you'll want to sort by `_oplog_date` and filter by `_source_id` to see how documents have changed over time. 

Because the indexes are timestamped you can drop then after a period of time so they don't take up space.  If you just want the last couple of days of changes, delete the indexes with the old timestamps.  Elastic [curator](https://github.com/elastic/curator) is your friend here.

!!! note
	This option may be passed on the command line as 
	./monstache --time-machine-namespace test.foo --time-machine-namespace test.bar

	If specified as an environment variable the value should be namespaces separated only by the `env-delimiter` which
	defaults to a comma.  E.g. `MONSTACHE_TIME_MACHINE_NS=test.foo,test.bar`

## time-machine-index-prefix

string (default `log`)

If you have enabled time machine namespaces and want to change the prefix assigned to the index names use this setting.

## time-machine-index-suffix

string (default `2006-01-02`)

If you have enabled time machine namespaces and want to suffix the index names using a different date format use this setting.  Consult the golang docs for how date formats work.  By default this suffixes the index name with the year, month, and day.

## time-machine-direct-reads

boolean (default `false`)

This setting controls whether or not direct reads are added to the time machine log index. This is false by default so only changes read from the oplog are added. 

## tpl

boolean (default `false`)

This option is only supported on the command line.  When the tpl mode is turned on then any config file passed via -f will be interpreted and executed
as a golang template before being loaded.  The template will have access to all environment variables.  The environment variables will be passed as a map
to the template. The env map can be accessed as the dot `.` symbol in the golang template and values from the map obtained using the `index` function.

For example, the given an environment variable THRESHOLD, then with `-tpl -f config.toml` the config.toml might contain...

```
[[script]]
namespace = "mydb.mycollection"
script = """
module.exports = function(doc) {
    if ( doc.score > {{index . "THRESHOLD"}} ) {
      doc.important = true;
    }
    return doc;
}
"""
```

## verbose

boolean (default `false`)

When verbose is true monstache with enable debug logging including a trace of requests to Elasticsearch

## worker

string (default `""`) (env var name `MONSTACHE_WORKER`)

When worker is given monstache will enter multi-worker mode and will require you to also provide the config option workers.  Use this mode to run
multiple monstache processes and distribute the work between them.  In this mode monstache will ensure that each MongoDB document id always goes to the
same worker and none of the other workers. See the [Workers](../advanced/#workers) section for more information.

## workers

[]string (default `nil`)

An array of worker names to be used in conjunction with the worker option. 

!!! note
	This option may be passed on the command line as ./monstache --workers w1 --workers w2 


<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "72240423b033493f80acd2f95b8e0f69"}'></script>
