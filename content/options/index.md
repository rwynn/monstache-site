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

## resume

### boolean (default false)

When `resume` is true, monstache writes the timestamp of mongodb operations it has successfully synced to elasticsearch
to the collection `monstache.monstache`.  It also reads this value from that collection when it starts in order to replay
events which it might have missed because monstache was stopped. monstache uses the value of `resume-name` as a key when
storing and retrieving timestamps.  If `resume` is true but `resume-name` is not set the key defaults to `default`.
In the case where `resume` is true and `worker` is set but `resume-name` is not set the key defaults to the name of the
worker. Note when using multiple monstache processes it is always best to ensure that `resume-name` is set to a unique 
value for each process.  This ensures that each process will not overwrite the timestamp information of another.

## resume-from-timestamp

### int64 (default 0)

When `resume-from-timestamp` (a 64 bit timestamp where the first 32 bytes represent the time since epoch and the last 32 bits
represent an offset) is given, monstache will sync events starting immediately after the timestamp.  This is useful if you have 
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

## gtm-channel-size

### int (default 100)

When `gtm-channel-size` is given it controls the size of the go channels created for processing events.  When many events
are processed at once a larger channel size may prevent blocking in gtm.

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

### int (default 5)

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

## cluster-name

### string (default "")

When `cluster-name` is given monstache will enter a high availablity mode. Processes with cluster name set to the same value will coordinate.  Only one of the
processes in a cluster will be sync changes.  The other process will be in a paused state.  If the process which is syncing changes goes down for some reason
one of the processes in paused state will take control and start syncing.  See the section [high availability](/high-availability/) for more information.

## script

### []object (default nil)

When `script` is given monstache will pass the mongodb document into the script before indexing into elasticsearch.  See the section [Transform and Filter](/transform-filter/)
for more information.

---
