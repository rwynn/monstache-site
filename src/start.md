# Getting Started

---

## Installation

Monstache is just a single binary without dependencies on runtimes like Ruby, Python or PHP. Monstache is written in
Go but you don't need to install the Go language unless you decide to write your own Go plugins.

If you simply want to run Monstache you just need to [download the latest version](https://github.com/rwynn/monstache/releases).

## Which version should I use?

| Monstache version | Git branch (used to build plugin) | Docker tag | Description | Elasticsearch | MongoDB | Status
| --- | --- |---|---|---|---|---
| 6 | rel6   | rel6, latest | MongoDB, Inc. go driver | Version 7+ | Version 2.6+ | Supported
| 5 | rel5   | rel5 | MongoDB, Inc. go driver | Version 6| Version 2.6+ | Supported
| 4 | master | rel4 | mgo community go driver | Version 6 | Version 3 | Deprecated
| 3 | rel3   | rel3 | mgo community go driver | Versions 2 and 5 | Version 3 | Deprecated

Unzip the download and adjust your PATH variable to include the path to the folder for your platform.

Let's make sure Monstache is set up as expected. You should see a similar version number in your terminal:

```sh
monstache -v
# 6.7.2
```

You can also build monstache from source. Monstache uses [vgo](https://github.com/golang/go/wiki/Modules). 

```sh
cd ~/build # somewhere outside your $GOPATH
git clone https://github.com/rwynn/monstache.git
cd monstache
git checkout <branch-or-tag-to-build>
go install
# monstache binary should now be in $GOPATH/bin
```

## Usage

Monstache uses the MongoDB [oplog](https://docs.mongodb.com/manual/core/replica-set-oplog/) as an event source. You will need to ensure
that MongoDB is configured to produce an oplog by [deploying a replica set](http://docs.mongodb.org/manual/tutorial/deploy-replica-set/).
If you haven't already done so, follow the 5 step [procedure](https://docs.mongodb.com/manual/tutorial/deploy-replica-set/#procedure) 
to initiate and validate your replica set. For local testing your replica set may contain a 
[single member](https://docs.mongodb.com/manual/tutorial/convert-standalone-to-replica-set/).

!!! note
	If you have enabled security in MongoDB you will need to give the user in your connection string
	certain privileges:
    
    For MongoDB versions prior to 3.6 the user in the connection string will need to be able read the `local` database (to read from the oplog) and any user databases that you wish to synch data from.

    When using the resume or clustering features the user will need to be able to write to and 
    create indexes for the `monstache` database, or more generally, whatever you configure the 
    option `config-database-name` to be.

    When using change streams you will need to implement the changes in the documentation for
    [access control](https://docs.mongodb.com/manual/changeStreams/#access-control). Monstache
    defaults to opening the change stream against the entire deployment.

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

# if you need to seed an index from a collection and not just listen and sync changes events
# you can copy entire collections or views from MongoDB to Elasticsearch
direct-read-namespaces = ["mydb.mycollection", "db.collection", "test.test", "db2.myview"]

# if you want to use MongoDB change streams instead of legacy oplog tailing use change-stream-namespaces
# change streams require at least MongoDB API 3.6+
# if you have MongoDB 4+ you can listen for changes to an entire database or entire deployment
# in this case you usually don't need regexes in your config to filter collections unless you target the deployment.
# to listen to an entire db use only the database name.  For a deployment use an empty string.
change-stream-namespaces = ["mydb.mycollection", "db.collection", "test.test"]

# additional settings

# if you don't want to listen for changes to all collections in MongoDB but only a few
# e.g. only listen for inserts, updates, deletes, and drops from mydb.mycollection
# this setting does not initiate a copy, it is only a filter on the change event listener
namespace-regex = '^mydb\.mycollection$'
# compress requests to Elasticsearch
gzip = true
# generate indexing statistics
stats = true
# index statistics into Elasticsearch
index-stats = true
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
# use a custom resume strategy (tokens) instead of the default strategy (timestamps)
# tokens work with MongoDB API 3.6+ while timestamps work only with MongoDB API 4.0+
resume-strategy = 1
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

