---
title: Getting started
weight: 10
---

## Installation

Monstache is just a single binary without dependencies on runtimes like Ruby, Python or PHP. You just need to download the [latest version](https://github.com/rwynn/monstache/releases). 

Let's make sure Monstache is set up as expected. You should see a similar version number in your terminal:

```sh
monstache -v
# 2.13.0
```

## Configuration

Monstache uses the MongoDB [oplog](https://docs.mongodb.com/manual/core/replica-set-oplog/) as an event source. You will need to make sure that MongoDB is configured to
produce an oplog.  The oplog can be enabled by

+ Setting up [replica sets](http://docs.mongodb.org/manual/tutorial/deploy-replica-set/)
+ Passing --master to the mongod process
+ Setting the following in /etc/mongod.conf

```toml
master = true
```

Without any explicit configuration monstache will connect to ElasticSearch and MongoDB on localhost
and begin tailing the MongoDB oplog.  Any changes to MongoDB will be reflected in ElasticSearch.

Monstache uses the [TOML](https://github.com/toml-lang/toml) format for its configuration.  You can run 
monstache with an explicit configuration by passing the -f flag.

```sh
monstache -f /path/to/config.toml
```

A sample configuration looks like this:

```toml
gzip = true
mongo-url = "mongodb://someuser:password@localhost:40001"
mongo-pem-file = "/path/to/mongoCert.pem"
mongo-validate-pem-file = false
elasticsearch-url = "http://someuser:password@localhost:9200"
elasticsearch-max-conns = 10
elasticsearch-pem-file = "/path/to/elasticCert.pem"
elastic-validate-pem-file = true
elasticsearch-hosts = ["localhost", "example.com"]
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
