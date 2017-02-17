---
title: Options
weight: 20
---

Options can be specified in your TOML config file or be passed into monstache as Go program arguments on the command line.
Options specified as program arguments take precedance over the same option in the TOML config file.

## gzip

### boolean (default false)

When `gzip` is true, monstache will compress requests to elasticsearch to increase performance. 
If you enable gzip in monstache and are using elasticsearch prior to version 5 you will also 
need to update the elasticsearch config file to set http.compression: true. In elasticsearch 
version 5 and above http.compression is enabled by default. Enabling gzip is recommended 
especially if you enable the index-files setting.

## fail-fast

### boolean (default false)

When `fail-fast` is true, if monstache receives a failed bulk indexing response from Elasticsearch, monstache
will log the request that produced the response as an ERROR and then exit immediately with an error status. 
Normally, monstache just logs the error and continues processing events.

If monstache has been configured with a value for `elasticsearch-retry-seconds`, a failed request will be
retried once after the retry period before being considered a failure.

## index-oplog-time

### boolean (default false)

If this option is set to true monstache will include 2 automatic fields in the source document indexed into
Elasticsearch.  The first is `_oplog_ts` which is the timestamp for the event copied directly from the MongoDB
oplog. The second is `_oplog_date` which is an ElasticSearch date field corresponding to the time of the same
event.

This information is generally useful in ElasticSearch giving the notion of last updated.  However, it's also
valuable information to have for failed indexing requests since it gives one the information to replay from 
a failure point.  See the option `resume-from-timestamp` for information on how to replay oplog events since 
a given event occurred. 

## resume

### boolean (default false)

When `resume` is true, monstache writes the timestamp of mongodb operations it has successfully synced to elasticsearch
to the collection `monstache.monstache`.  It also reads the timestamp from that collection when it starts in order to replay
events which it might have missed because monstache was stopped. If monstache is started with the `cluster-name` option
set then `resume` is automatically turned on.  

## resume-name

### string (default "default")

monstache uses the value of `resume-name` as an id when storing and retrieving timestamps
to and from the mongodb collection `monstache.monstache`. The default value for this option is `default`.
However, there are some exceptions.  If monstache is started with the `cluster-name` option set then the
name of the cluster becomes the resume-name.  This is to ensure that any process in the cluster is able to resume
from the last timestamp successfully processed.  The other exception occurs when `resume-name` is not given but
`worker-name` is.  In that cause the worker name becomes the resume-name.

## resume-from-timestamp

### int64 (default 0)

When `resume-from-timestamp` (a 64 bit timestamp where the high 32 bytes represent the number of seconds since epoch and the low 32 bits
represent an offset within a second) is given, monstache will sync events starting immediately after the timestamp.  This is useful if you have 
a specific timestamp from the oplog and would like to start syncing from after this event. 

## replay

### boolean (default false)

When `replay` is true, monstache replays all events from the beginning of the mongodb oplog and syncs them to elasticsearch.

When `resume` and `replay` are both true, monstache replays all events from the beginning of the mongodb oplog, syncs them
to elasticsearch and also writes the timestamp of processed events to `monstache.monstache`. 

When neither `resume` nor `replay` are true, monstache reads the last timestamp in the oplog and starts listening for events
occurring after this timestamp.  Timestamps are not written to `monstache.monstache`.  This is the default behavior. 

## resume-write-unsafe

### boolean (default false)

When `resume-write-unsafe` is true monstache sets the safety mode of the mongodb session such that writes are fire and forget.
This speeds up writing of timestamps used to resume synching in a subsequent run of monstache.  This speed up comes at the cost
of no error checking on the write of the timestamp.  Since errors writing the last synched timestamp are only logged by monstache
and do not stop execution it's not unreasonable to set this to true to get a speedup.

## namespace-regex

### regexp (default "")

When `namespace-regex` is given this regex is tested against the namespace, `database.collection`, of the event. If
the regex matches monstache continues processing event filters, otherwise it drops the event. By default monstache
processes events in all databases and all collections with the exception of the reserved database `monstache`, any
collections suffixed with `.chunks`, and the system collections. For more information see the section [Namespaces](/namespaces/).

## namespace-exclude-regex

### regex (default "")

When `namespace-exclude-regex` is given this regex is tested against the namespace, `database.collection`, of the event. If
the regex matches monstache ignores the event, otherwise it continues processing event filters. By default monstache
processes events in all databases and all collections with the exception of the reserved database `monstache`, any
collections suffixed with `.chunks`, and the system collections. For more information see the section [Namespaces](/namespaces/).

## mongo-url

### string (default localhost)

The URL to connect to MongoDB which must follow the [Standard Connection String Format](https://docs.mongodb.com/v3.0/reference/connection-string/#standard-connection-string-format)

## mongo-pem-file

### string (default "")

When `mongo-pem-file` is given monstache will use the given file path to add a local certificate to x509 cert
pool when connecting to mongodb. This should only be used when mongodb is configured with SSL enabled.

## mongo-validate-pem

### boolean (default true)

When `mongo-validate-pem-file` is false TLS will be configured to skip verification

## mongo-oplog-database-name

### string (default local)

When `mongo-oplog-database-name` is given monstache will look for the mongodb oplog in the supplied database

## mongo-oplog-collection-name

### string (default $oplog.main)

When `mongo-oplog-collection-name` is given monstache will look for the mongodb oplog in the supplied collection

## mongo-cursor-timeout

### string (default 100s)

When `mongo-cursor-timeout` is given monstache will time out and re-query the oplog after the supplied duration.
Duration values are expected in the form `50s`.

## mongo-dial-settings

### TOML table (default nil)

The following mongodb dial properties are available

### timeout

#### int (default 10)

Seconds to wait when establishing a connection to mongodb before giving up

## mongo-session-settings

### TOML table (default nil)

The following mongodb session properties are available

### socket-timeout

#### int (default 60)

Seconds to wait for a non-responding socket before it is forcefully closed

### sync-timeout

#### int (default 7)

Amount of time in seconds an operation will wait before returning an error in case a connection to a usable server can't be established.
Set it to zero to wait forever.

## gtm-settings

### TOML table (default nil)

The following gtm configuration properties are available.  See (gtm)[https://github.com/rwynn/gtm] for details

### channel-size

#### int (default 100)

Controls the size of the go channels created for processing events.  When many events
are processed at once a larger channel size may prevent blocking in gtm.

### buffer-size

#### int (default 32)

Determines how many documents are buffered by a gtm worker go routine before they are batch fetched from
mongodb.  When many documents are inserted or updated at once it is better to fetch them together.

### buffer-duration

#### string (default 750ms)

A string representation of a golang duration.  Determines the maximum time a buffer is held before it is 
fetched in batch from mongodb and flushed for indexing.

### worker-count

#### int (default 8)

The number of go routines which are batch fetching documents for indexing.  Each go routine will batch according
to the `buffer-size` setting and hold buffers for at most `buffer-duration`.  This will be set to 1 if `ordering`
is set to 0 or `oplog`.

### ordering

#### int (default 2)

Determines the ordering guarantee of operations coming off the oplog. Operations first come off the oplog sorted
chronologically, but then enter queues where they are picked up by go routines (workers) for further processing.
Ordering sets the behavior of those workers with respect to maintaining the original oplog ordering.

Valid options for ordering are 0, 1, or 2. 

0 gives Oplog (strongest) ordering. 0 means that operations are indexed in the same order they appear in the oplog.

1 gives Namespace ordering.  1 means that operations within a namespace are indexed oplog ordered.  There is no guarantee that
operations across namespaces will be indexed in the same order they appeared in the oplog.

2 gives Document ordering.  2 means that operations against a single document (insert, update, delete) are oplog ordered.
There is no guarantee that across 2 documents that the indexing order will match the oplog order.  

1 and 2 give better throughput when combined with a worker count greater than 1 because multiple go routines will be 
operating concurrently to batch fetch documents.  The cost of fanning out document fetches is that total ordering cannot be
guaranteed.

2 gives the best performance while still ensuring that if a single document
is updated and then quickly deleted, then the delete of that document in elasticsearch will happen after the update.  

2 does not guarantee that if a document is inserted into a collection C and then C is instantly dropped that the corresponding
index for C does not contain the document (though 1 does).  This (probably rare) scenario is one drawback of 2.  

0 is an option if you need to ensure that operations are always processed in strict oplog order. When 0 is used the
`worker-count` is forced to 1 to ensure the strict ordering.  This results in slightly less throughput. This is a good option
is ordering semantics are your primary concern.  

1 is a good middle ground.  It is not as performant as 2 better than 0 while providing ordering semantics at the namespace level.

## index-files

### boolean (default false)

When `index-files` is true monstache will index the raw content of files stored in GridFS into elasticsearch as an attachment type.
By default `index-files` is false meaning that monstache will only index metadata associated with files stored in GridFS.
In order for `index-files` to index the raw content of files stored in GridFS you must install a plugin for elasticsearch.
For versions of elasticsearch prior to version 5, you should install the [mapper-attachments](https://www.elastic.co/guide/en/elasticsearch/plugins/2.3/mapper-attachments.html) plugin.  In version 5 or greater
of elasticsearch the mapper-attachment plugin is deprecated and you should install the [ingest-attachment](https://www.elastic.co/guide/en/elasticsearch/plugins/master/ingest-attachment.html) plugin instead.
For further information on how to configure monstache to index content from GridFS, see the section [Indexing Gridfs Files](/gridfs/).

## max-file-size

### int (default 0)

When `max-file-size` is greater than 0 monstache will not index the content of GridFS files that exceed this limit in bytes.

## file-namespaces

### []string (default nil)

The `file-namespaces` config must be set when `index-files` is enabled.  `file-namespaces` must be set to an array of mongodb
namespace strings.  Files uploaded through gridfs to any of the namespaces in `file-namespaces` will be retrieved and their
raw content indexed into elasticsearch via either the mapper-attachments or ingest-attachment plugin. 

## file-highlighting

### boolean (default false)

When `file-highlighting` is true monstache will enable the ability to return highlighted keywords in the extracted text of files
for queries on files which were indexed in elasticsearch from gridfs.

## verbose

### boolean (default false)

When `verbose` is true monstache with enable debug logging including a trace of requests to elasticsearch

## elasticsearch-url

### string (default http://localhost:9200)

The URL of the ElasticSearch REST Interface

## elasticsearch-version

### string (by default determined by connecting to the server)

When `elasticsearch-version` is provided monstache will parse the given server version to determine how to interact with
the elasticsearch API.  This is normally not recommended because monstache will connect to elasticsearch to find out
which version is being used.  This option is provided for cases where connecting to the base URL of the elasticsearch REST
API to get the version is not possible or desired.

## elasticsearch-max-conns

### int (default 10)

The maximum size of the ElasticSearch connection pool

## elasticsearch-retry-seconds

### int (default 0)

When `elasticseach-retry-seconds` is greater than 0 a failed request to elasticsearch with retry the request after the given number of seconds

## elasticsearch-max-docs

### int (default 100)

When `elasticsearch-max-docs` is given a bulk index request to elasticsearch will be forced when the buffer reaches the given number of documents

## elasticsearch-max-bytes

### int (default 16384)

When `elasticsearch-max-bytes` is given a bulk index request to elasticsearch will be forced when the buffer reaches the given number of bytes

## elasticsearch-max-seconds

### int (default 2)

When `elasticsearch-max-seconds` is given a bulk index request to elasticsearch will be forced when a request has not been made in the given number of seconds

## elasticsearch-pem-file

### string (default "")

When `elasticsearch-pem-file` is given monstache will use the given file path to add a local certificate to x509 cert
pool when connecting to elasticsearch. This should only be used when elasticsearch is configured with SSL enabled.

## elasticsearch-validate-pem

### boolean (default true)

When `elasticsearch-validate-pem-file` is false TLS will be configured to skip verification

## elasticsearch-hosts

### []string (default nil)

When `elasticsearch-hosts` is given monstache will set the hosts array on the `elastigo` client connection. You must duplicate and include in this array value
the host that you already configured in the `elasticsearch-url` option along with any other hosts. Use this option if you have a cluster with multiple nodes
and would like index requests to be intelligently distributed between the cluster nodes.  Note that index requests will go to only one of the configured hosts
within a cluster.  If you have multiple elasticsearch clusters you should use one dedicated monstache process per cluster.  This configures the hosts within
a single cluster and not across clusters.

## dropped-databases

### boolean (default true)

When `dropped-databases` is false monstache will not delete the mapped indexes in elasticsearch if a mongodb database is dropped

## dropped-collections

### boolean (default true)

When `dropped-collections` is false monstache will not delete the mapped index in elasticsearch if a mongodb collection is dropped

## worker

### string (default "")

When `worker` is given monstache will enter multi-worker mode and will require you to also provide the config option `workers`.  Use this mode to run
multiple monstache processes and distribute the work between them.  In this mode monstache will ensure that each mongo document id always goes to the
same worker and none of the other workers. See the section [workers](/workers/) for more information.

## workers

### []string (default nil)

An array of worker names to be used in conjunction with the `worker` option. 

## enable-patches

### boolean (default false) 

Set to true to enable storing [rfc7396](https://tools.ietf.org/html/rfc7396) patches in your elasticsearch documents

## patch-namespaces

### []string (default nil)

An array of mongodb namespaces that you would like to enable rfc7396 patches on

## merge-patch-attribute

### string (default "json-merge-patches") 

Customize the name of the property under which merge patches are stored

## cluster-name

### string (default "")

When `cluster-name` is given monstache will enter a high availablity mode. Processes with cluster name set to the same value will coordinate.  Only one of the
processes in a cluster will be sync changes.  The other process will be in a paused state.  If the process which is syncing changes goes down for some reason
one of the processes in paused state will take control and start syncing.  See the section [high availability](/high-availability/) for more information.

## script

### [] TOML table (default nil)

When `script` is given monstache will pass the mongodb document into the script before indexing into elasticsearch.  See the section [Transform and Filter](/transform-filter/)
for more information.

---
