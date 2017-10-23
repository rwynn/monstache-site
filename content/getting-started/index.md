---
title: Getting started
weight: 10
---

## Installation

Monstache is just a single binary without dependencies on runtimes like Ruby, Python or PHP. You just need to download the [latest version](https://github.com/rwynn/monstache/releases). 

Let's make sure Monstache is set up as expected. You should see a similar version number in your terminal:

```sh
monstache -v
# 3.2.0
```

## Configuration

Monstache uses the MongoDB [oplog](https://docs.mongodb.com/manual/core/replica-set-oplog/) as an event source. You will need to make sure that MongoDB is configured to
produce an oplog.  The oplog can be enabled by using one of the following options:

+ Setting up [replica sets](http://docs.mongodb.org/manual/tutorial/deploy-replica-set/)
+ Passing --master to the mongod process
+ Setting the following in /etc/mongod.conf

```toml
master = true
```

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

Without any explicit configuration monstache will connect to ElasticSearch and MongoDB on localhost
on the default ports and begin tailing the MongoDB oplog.  Any changes to MongoDB will be reflected in ElasticSearch.

Monstache uses the [TOML](https://github.com/toml-lang/toml) format for its configuration.  You can run 
monstache with an explicit configuration by passing the -f flag.

```sh
monstache -f /path/to/config.toml
```

A sample configuration looks like this:

```toml
gzip = true
stats = true
index-stats = true
mongo-url = "mongodb://someuser:password@localhost:40001"
mongo-pem-file = "/path/to/mongoCert.pem"
mongo-validate-pem-file = false
elasticsearch-urls = ["https://example:9200"]
elasticsearch-user = "someuser"
elasticsearch-password = "somepassword"
elasticsearch-max-conns = 10
elasticsearch-pem-file = "/path/to/elasticCert.pem"
elastic-validate-pem-file = true
dropped-collections = true
dropped-databases = true
replay = false
resume = true
resume-write-unsafe = false
resume-name = "default"
namespace-regex = "^mydb\.(mycollection|\$cmd)$"
namespace-exclude-regex = "^mydb\.(ignorecollection|\$cmd)$"
gtm-channel-size = 200
index-files = true
file-highlighting = true
file-namespaces = ["users.fs.files"]
verbose = true
cluster-name = 'apollo'
direct-read-namespaces = ["db.collection", "test.test"]
exit-after-direct-reads = false
```

See the [Options guide]({{< relref "options/index.md" >}}) for details about each configuration
option.

---
