# Getting Started

---

## Installation

Monstache is just a single binary without dependencies on runtimes like Ruby, Python or PHP. Monstache is written in
Go but you don't need to install the Go language unless you decide to write your own Go plugins.

If you simply want to run Monstache you just need to [download the latest version](https://github.com/rwynn/monstache/releases).

You will want to use 4.x releases for ES6+ and 3.x releases for ES2-5.

Unzip the download and adjust your PATH variable to include the path to the folder for your platform.

Let's make sure Monstache is set up as expected. You should see a similar version number in your terminal:

```sh
monstache -v
# 4.13.2
```

The version number should start with 3.x if you are using Elasticsearch prior to version 6.

!!! note ""

	You can also build monstache from source. Monstache uses [vgo](https://github.com/golang/go/wiki/Modules). 
	For Elasticsearch 6 and up use

	```
	cd ~/build # somewhere outside your $GOPATH
	git clone https://github.com/rwynn/monstache.git
	cd monstache
	go install
	```

	For Elasticsearch before version 6 use

	```
	cd ~/build # somewhere outside your $GOPATH
	git clone https://github.com/rwynn/monstache.git
	cd monstache
	git checkout rel3
	go install
	```

## Usage

Monstache uses the MongoDB [oplog](https://docs.mongodb.com/manual/core/replica-set-oplog/) as an event source. You will need to ensure
that MongoDB is configured to produce an oplog by [deploying a replica set](http://docs.mongodb.org/manual/tutorial/deploy-replica-set/).
If you haven't already done so, follow the 5 step [procedure](https://docs.mongodb.com/manual/tutorial/deploy-replica-set/#procedure) 
to initiate and validate your replica set. For local testing your replica set may contain a 
[single member](https://docs.mongodb.com/manual/tutorial/convert-standalone-to-replica-set/).

!!! note
	If you have enabled security in MongoDB you will need to give the user in your connection string
	certain privileges.  Specifically, the user will need to be able read the `local` database (to read
	from the oplog) and any user databases that you wish to synch data from.  Additionally, when using the 
	resume or clustering features the user will need to be able to write to and create indexes for the 
	`monstache` database. 

Monstache makes concurrent bulk indexing requests to Elasticsearch.  It is recommended to increase the
pool of bulk request handlers configured for Elasticsearch to ensure that requests do not begin to time
out due to an overloaded queue. The queue size can be increased by making changes to your elasticsearch.yml
configuration. Check the Elasticsearch documentation for default queue size values as they change between releases.
It is recommended to have a bulk queue size of at least 200.

```
 thread_pool:
   bulk:
     queue_size: 200
```

Without any explicit configuration monstache will connect to Elasticsearch and MongoDB on localhost
on the default ports and begin tailing the MongoDB oplog.  Any changes to MongoDB while Monstache is running will be reflected in Elasticsearch.

To see the indexes created by Monstache you may want to issue the following command which will show the indices in Elasticsearch. By default, the
index names will match the db.collection name in MongoDB.

```sh

curl localhost:9200/_cat/indices?v

```

Monstache uses the [TOML](https://github.com/toml-lang/toml) format for its configuration.  You can run 
monstache with an explicit configuration by passing the -f flag.

```sh
monstache -f /path/to/config.toml
```

The following shows how to specify options in a TOML config file.

!!! note
	It is highly recommended that you start with only your MongoDB and Elasticsearch connection settings and only specify additional options as needed. 

```
# connection settings

# connect to MongoDB using the following URL
mongo-url = "mongodb://someuser:password@localhost:40001"
# connect to the Elasticsearch REST API at the following node URLs
elasticsearch-urls = ["https://es1:9200", "https://es2:9200"]

# frequently required settings

# if you don't want to listen for changes to all collections in MongoDB but only a few
# e.g. only listen for inserts, updates, deletes, and drops from mydb.mycollection
# this setting does not initiate a copy, it is a filter on the oplog change listener only
namespace-regex = '^mydb\.mycollection$'
# additionally, if you need to seed an index from a collection and not just listen for changes from the oplog
# you can copy entire collections or views from MongoDB to Elasticsearch
direct-read-namespaces = ["mydb.mycollection", "db.collection", "test.test"]
# if you want to use MongoDB change streams instead of legacy oplog tailing add the following
# in this case you don't need regexes to filter collections.
# change streams require MongoDB version 3.6+
# change streams cannot be combined yet with resume, replay, or cluster options.
# change streams start listening for new changes since the monstache process is started
change-stream-namespaces = ["mydb.mycollection", "db.collection", "test.test"]

# additional settings

# compress requests to Elasticsearch
gzip = true
# generate indexing statistics
stats = true
# index statistics into Elasticsearch
index-stats = true
# use the following PEM file for connections to MongoDB
mongo-pem-file = "/path/to/mongoCert.pem"
# disable PEM validation
mongo-validate-pem-file = false
# use the following user name for Elasticsearch basic auth
elasticsearch-user = "someuser"
# use the following password for Elasticsearch basic auth
elasticsearch-password = "somepassword"
# use 4 go routines concurrently pushing documents to Elasticsearch
elasticsearch-max-conns = 4 
# use the following PEM file to connections to Elasticsearch
elasticsearch-pem-file = "/path/to/elasticCert.pem"
# validate connections to Elasticsearch
elastic-validate-pem-file = true
# propogate dropped collections in MongoDB as index deletes in Elasticsearch
dropped-collections = true
# propogate dropped databases in MongoDB as index deletes in Elasticsearch
dropped-databases = true
# do not start processing at the beginning of the MongoDB oplog
# if you set the replay to true you may see version conflict messages
# in the log if you had synced previously. This just means that you are replaying old docs which are already
# in Elasticsearch with a newer version. Elasticsearch is preventing the old docs from overwriting new ones.
replay = false
# resume processing from a timestamp saved in a previous run
resume = true
# do not validate that progress timestamps have been saved
resume-write-unsafe = false
# override the name under which resume state is saved
resume-name = "default"
# exclude documents whose namespace matches the following pattern
namespace-exclude-regex = '^mydb\.ignorecollection$'
# turn on indexing of GridFS file content
index-files = true
# turn on search result highlighting of GridFS content
file-highlighting = true
# index GridFS files inserted into the following collections
file-namespaces = ["users.fs.files"]
# print detailed information including request traces
verbose = true
# enable clustering mode
cluster-name = 'apollo'
# do not exit after full-sync, rather continue tailing the oplog
exit-after-direct-reads = false
```

See [Configuration](../config/) for details about each configuration
option.

