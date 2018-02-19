# Getting Started

---

## Installation

Monstache is just a single binary without dependencies on runtimes like Ruby, Python or PHP.

You just need to [download the latest version](https://github.com/rwynn/monstache/releases).

You will want to use 4.x releases for ES6+ and 3.x releases for ES2-5.

Unzip the download and adjust your PATH variable to include the path to the folder for your platform.

Let's make sure Monstache is set up as expected. You should see a similar version number in your terminal:

```sh
monstache -v
# 4.0.1
```

The version number should start with 3.x if you are using Elasticsearch prior to version 6.

!!! note ""

	You can also build monstache from source. For Elasticsearch 6 and up use

	```
	go get -u github.com/rwynn/monstache
	```

	For Elasticsearch before version 6 use

	```
	go get -u gopkg.in/rwynn/monstache.v3
	```

## Usage

Monstache uses the MongoDB [oplog](https://docs.mongodb.com/manual/core/replica-set-oplog/) as an event source. You will need to make sure that MongoDB is configured to
produce an oplog.  The oplog can be enabled by using one of the following options:

+ Setting up [replica sets](http://docs.mongodb.org/manual/tutorial/deploy-replica-set/)
+ Passing --master to the mongod process
+ Setting the following in /etc/mongod.conf

```toml
master = true
```

!!! note
	If you have enabled security in MongoDB you will need to give the user in your connection string
	certain privileges.  Specifically, the user will need to be able read the `local` database (to read
	from the oplog) and any user databases that you wish to synch data from.  Additionally, when using the 
	resume or clustering features the user will need to be able to write to and create indexes for the 
	`monstache` database. 

Monstache makes concurrent bulk indexing requests to Elasticsearch.  It is recommended to increase the
pool of bulk request handlers configured for Elasticsearch to ensure that requests do not begin to time
out due to an overloaded queue. The queue size can be increased by making changes to your elasticsearch.yml
configuration.

```
 thread_pool:
   bulk:
     queue_size: 200
```

Without any explicit configuration monstache will connect to Elasticsearch and MongoDB on localhost
on the default ports and begin tailing the MongoDB oplog.  Any changes to MongoDB will be reflected in Elasticsearch.

Monstache uses the [TOML](https://github.com/toml-lang/toml) format for its configuration.  You can run 
monstache with an explicit configuration by passing the -f flag.

```sh
monstache -f /path/to/config.toml
```

A sample configuration looks like this:

```
# compress requests to Elasticsearch
gzip = true
# generate indexing statistics
stats = true
# index statistics into Elasticsearch
index-stats = true
# connect to MongoDB using the following URL
mongo-url = "mongodb://someuser:password@localhost:40001"
# use the following PEM file for connections to MongoDB
mongo-pem-file = "/path/to/mongoCert.pem"
# disable PEM validation
mongo-validate-pem-file = false
# connect to the Elasticsearch REST API at the following URLs
elasticsearch-urls = ["https://example:9200"]
# use the following user name for Elasticsearch basic auth
elasticsearch-user = "someuser"
# use the following password for Elasticsearch basic auth
elasticsearch-password = "somepassword"
# use 10 go routines concurrently pushing documents to Elasticsearch
elasticsearch-max-conns = 10
# use the following PEM file to connections to Elasticsearch
elasticsearch-pem-file = "/path/to/elasticCert.pem"
# validate connections to Elasticsearch
elastic-validate-pem-file = true
# propogate dropped collections in MongoDB as index deletes in Elasticsearch
dropped-collections = true
# propogate dropped databases in MongoDB as index deletes in Elasticsearch
dropped-databases = true
# do not start processing at the beginning of the MongoDB oplog
replay = false
# resume processing from a timestamp saved in a previous run
resume = true
# do not validate that progress timestamps have been saved
resume-write-unsafe = false
# override the name under which resume state is saved
resume-name = "default"
# include documents whose namespace matches the following pattern
namespace-regex = '^mydb\.(mycollection|\$cmd)$'
# exclude documents whose namespace matches the following pattern
namespace-exclude-regex = '^mydb\.(ignorecollection|\$cmd)$'
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
# do a full-sync of the following collections
direct-read-namespaces = ["db.collection", "test.test"]
# do not exit after full-sync, rather continue tailing the oplog
exit-after-direct-reads = false
```

See [Configuration](/config/) for details about each configuration
option.

