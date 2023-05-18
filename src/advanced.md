# Advanced

---

## Versions

| Monstache version | Git branch (used to build plugin) | Docker tag | Description | Elasticsearch | MongoDB | Status
| --- | --- |---|---|---|---|---
| 6 | rel6   | rel6, latest | MongoDB, Inc. go driver | Version 7+ | Version 2.6+ | Supported
| 5 | rel5   | rel5 | MongoDB, Inc. go driver | Version 6| Version 2.6+ | Supported
| 4 | master | rel4 | mgo community go driver | Version 6 | Version 3 | Deprecated
| 3 | rel3   | rel3 | mgo community go driver | Versions 2 and 5 | Version 3 | Deprecated

!!! note
    You can use monstache `rel5` and `rel6` with MongoDB versions back to 2.6 with the following caveats.

    If you have MongoDB 3.6 then you must explicitly enumerate collections in your `change-stream-namespaces`
    setting because change streams against databases and entire deployments was not introduced until MongoDB version
    4.0.  Alternatively, you can disable change events entirely with `disable-change-events`. You must also set
    `resume-strategy` to `1` to use a token-based resume strategy compatibile with MongoDB API 3.6.

    If you have MongoDB 2.6 - 3.5 then you must omit any mention of `change-stream-namespaces` in your config file
    because change streams were first introduced in 3.6.  To emulate change events you must turn on the option
    `enable-oplog`. Alternatively, you can disable change events entirely with `disable-change-events`.

!!! warning
    Your MongoDB binary version does not always mean that the
    [feature compatibility](https://docs.mongodb.com/manual/reference/command/setFeatureCompatibilityVersion/)
    is at that same level. Check
    your feature compatibility version from the MongoDB console to ensure that MongoDB is not operating in a lesser
    capability mode. This sometimes happens when MongoDB is upgraded in place or MongoDB is started with a data
    directory of a previous installation. Sometimes there are reasons to stay at a lower feature compatibility
    so check before you upgrade it.

## GridFS Support

Monstache supports indexing the raw content of files stored in GridFS into Elasticsearch for full
text search.  This feature requires that you install an Elasticsearch plugin which enables the field type `attachment`.
For versions of Elasticsearch prior to version 5 you should install the 
[mapper-attachments](https://www.elastic.co/guide/en/elasticsearch/plugins/2.4/mapper-attachments.html) plugin.
For version 5 or later of Elasticsearch you should instead install the 
[ingest-attachment](https://www.elastic.co/guide/en/elasticsearch/plugins/current/ingest-attachment.html) plugin.

Once you have installed the appropriate plugin for Elasticsearch, getting file content from GridFS into Elasticsearch is
as simple as configuring monstache.  You will want to enable the [index-files](../config/#index-files) option and also tell monstache the 
namespace of all collections which will hold GridFS files. For example in your TOML config file,

```
index-files = true

direct-read-namespaces = ["users.fs.files", "posts.fs.files"]

file-namespaces = ["users.fs.files", "posts.fs.files"]

file-highlighting = true
```

The above configuration tells monstache that you wish to index the raw content of GridFS files in the `users` and `posts`
MongoDB databases. By default, MongoDB uses a bucket named `fs`, so if you just use the defaults your collection name will
be `fs.files`.  However, if you have customized the bucket name, then your file collection would be something like `mybucket.files`
and the entire namespace would be `users.mybucket.files`.

When you configure monstache this way it will perform an additional operation at startup to ensure the destination indexes in
Elasticsearch have a field named `file` with a type mapping of `attachment`.  

For the example TOML configuration above, monstache would initialize 2 indices in preparation for indexing into
Elasticsearch by issuing the following REST commands:

For Elasticsearch versions prior to version 5...

	POST /users.fs.files
	{
	  "mappings": {
	    "fs.files": {
	      "properties": {
		"file": { "type": "attachment" }
	}}}}

	POST /posts.fs.files
	{
	  "mappings": {
	    "fs.files": {
	      "properties": {
		"file": { "type": "attachment" }
	}}}}

For Elasticsearch version 5 and above...

	PUT /_ingest/pipeline/attachment
	{
	  "description" : "Extract file information",
	  "processors" : [
	    {
	      "attachment" : {
		"field" : "file"
	      }
	    }
	  ]
	}

When a file is inserted into MongoDB via GridFS, monstache will detect the new file, use the MongoDB api to retrieve the raw
content, and index a document into Elasticsearch with the raw content stored in a `file` field as a base64 
encoded string. The Elasticsearch plugin will then extract text content from the raw content using 
[Apache Tika](https://tika.apache.org/), tokenize the text content, and allow you to query on the content of the file.

To test this feature of monstache you can simply use the [mongofiles](https://docs.mongodb.com/manual/reference/program/mongofiles/)
command to quickly add a file to MongoDB via GridFS.  Continuing the example above one could issue the following command to put a 
file named `resume.docx` into GridFS and after a short time this file should be searchable in Elasticsearch in the index `users.fs.files`.

	mongofiles -d users put resume.docx

After a short time you should be able to query the contents of resume.docx in the users index in Elasticsearch

	curl -XGET "http://localhost:9200/users.fs.files/_search?q=golang"

If you would like to see the text extracted by Apache Tika you can project the appropriate sub-field

For Elasticsearch versions prior to version 5...

	curl -H "Content-Type:application/json" localhost:9200/users.fs.files/_search?pretty -d '{
		"fields": [ "file.content" ],
		"query": {
			"match": {
				"file.content": "golang"
			}
		}
	}'

For Elasticsearch version 5 and above...

	curl -H "Content-Type:application/json" localhost:9200/users.fs.files/_search?pretty -d '{
		"_source": [ "attachment.content" ],
		"query": {
			"match": {
				"attachment.content": "golang"
			}
		}
	}'

When [file-highlighting](../config/#file-highlighting) is enabled you can add a highlight clause to your query

For Elasticsearch versions prior to version 5...

	curl -H "Content-Type:application/json" localhost:9200/users.fs.files/_search?pretty -d '{
		"fields": ["file.content"],
		"query": {
			"match": {
				"file.content": "golang"
			}
		},
		"highlight": {
			"fields": {
				"file.content": {
				}
			}
		}
	}'

For Elasticsearch version 5 and above...

	curl -H "Content-Type:application/json" localhost:9200/users.fs.files/_search?pretty -d '{
		"_source": ["attachment.content"],
		"query": {
			"match": {
				"attachment.content": "golang"
			}
		},
		"highlight": {
			"fields": {
				"attachment.content": {
				}
			}
		}
	}'


The highlight response will contain emphasis on the matching terms

For Elasticsearch versions prior to version 5...

	"hits" : [ {
		"highlight" : {
			"file.content" : [ "I like to program in <em>golang</em>.\n\n" ]
		}
	} ]

For Elasticsearch version 5 and above...

	"hits" : [{
		"highlight" : {
			"attachment.content" : [ "I like to program in <em>golang</em>." ]
		}
	}]


## Workers


You can run multiple monstache processes and distribute the work between them.  First configure
the names of all the workers in a shared config.toml file.

```toml
workers = ["Tom", "Dick", "Harry"]
```

In this case we have 3 workers.  Now we can start 3 monstache processes and give each one of the worker
names.

	monstache -f config.toml -worker Tom
	monstache -f config.toml -worker Dick
	monstache -f config.toml -worker Harry

monstache will hash the id of each document using consistent hashing so that each id is handled by only
one of the available workers.


## High Availability


You can run monstache in high availability mode by starting multiple processes with the same value for [cluster-name](../config/#cluster-name).
Each process will join a cluster which works together to ensure that a monstache process is always syncing to Elasticsearch.

High availability works by ensuring one active process in the `monstache.cluster` collection in MongoDB at any given time. Only the process in
this collection will be syncing for the cluster.  Processes not present in this collection will be paused.  Documents in the 
`monstache.cluster` collection have a TTL assigned to them.  When a document in this collection times out it will be removed from
the collection by MongoDB and another process in the monstache cluster will have a chance to write to the collection and become the
new active process.

When [cluster-name](../config/#cluster-name) is supplied the [resume](../config/#resume) feature is automatically turned on and the [resume-name](../config/#resume-name) becomes the name of the cluster.
This is to ensure that each of the processes is able to pick up syncing where the last one left off.  

You can combine the HA feature with the workers feature.  For 3 cluster nodes with 3 workers per node you would have something like the following:

	// config.toml
	workers = ["Tom", "Dick", "Harry"]
	
	// on host A
	monstache -cluster-name HA -worker Tom -f config.toml
	monstache -cluster-name HA -worker Dick -f config.toml
	monstache -cluster-name HA -worker Harry -f config.toml

	// on host B
	monstache -cluster-name HA -worker Tom -f config.toml
	monstache -cluster-name HA -worker Dick -f config.toml
	monstache -cluster-name HA -worker Harry -f config.toml

	// on host C
	monstache -cluster-name HA -worker Tom -f config.toml
	monstache -cluster-name HA -worker Dick -f config.toml
	monstache -cluster-name HA -worker Harry -f config.toml

When the clustering feature is combined with workers then the [resume-name](../config/#resume-name) becomes the cluster name concatenated with the worker name.

## Index Mapping

When indexing documents from MongoDB into Elasticsearch the default mapping is as follows:

For Elasticsearch prior to 6.2

```text
Elasticsearch index name    <= MongoDB database name . MongoDB collection name
Elasticsearch type          <= MongoDB collection name
Elasticsearch document _id  <= MongoDB document _id
```

For Elasticsearch 6.2+

```text
Elasticsearch index name    <= MongoDB database name . MongoDB collection name
Elasticsearch type          <= _doc 
Elasticsearch document _id  <= MongoDB document _id
```

If these default won't work for some reason you can override the index and type mapping on a per collection basis by adding
the following to your TOML config file:

```toml
[[mapping]]
namespace = "test.test"
index = "index1"
type = "type1"

[[mapping]]
namespace = "test.test2"
index = "index2"
type = "type2"
```

With the configuration above documents in the `test.test` namespace in MongoDB are indexed into the `index1` 
index in Elasticsearch with the `type1` type.

If you need your index and type mapping to be more dynamic, such as based on values inside the MongoDB document, then
see the sections [Middleware](#middleware) and  [Routing](#routing).

!!! warning
	It is not recommended to override the default type of `_doc` if using Elasticsearch 6.2+ since this will be the supported path going forward.
	Also, using `_doc` as the type will not work with Elasticsearch prior to 6.2.

Make sure that automatic index creation is not disabled in elasticsearch.yml or create your target indexes before using Monstache.

If automatic index creation must be controlled, whitelist any indexes in elasticsearch.yml that monstache will create.

## Namespaces

When a document is inserted, updated, or deleted in MongoDB a document is appended to the oplog representing the event.  This document has a field `ns` which is the namespace.  For inserts, updates, and deletes the namespace is the database name and collection name of the document changed joined by a dot. E.g. for `use test; db.foo.insert({hello: "world"});` the namespace for the event in the oplog would be `test.foo`.

In addition to inserts, updates, and deletes monstache also supports database and collection drops.  When a database or collection is dropped in MongoDB an event is appended to the oplog.  Like the other types of changes this event has a field `ns` representing the namespace.  However, for drops the namespace is the database name and the string `$cmd` joined by a dot.  E.g. for `use test; db.foo.drop()` the namespace for the event in the oplog would be `test.$cmd`.  

## Middleware

monstache supports embedding user defined middleware between MongoDB and Elasticsearch.  Middleware is able to transform documents, drop documents, or define indexing metadata.  Middleware may be written in either Javascript or in Golang as a plugin.

!!! warning
	It is HIGHLY recommended to use a golang plugin in production over a javascript plugin due to performance differences.
	Currently, golang plugins are orders of magnitude faster than javascript plugins.  This is due to concurrency and the
	need to perform locking on the javascript environment.  Javascript plugins are very useful for quickly prototyping a
	solution, however at some point it is recommended to convert them to golang plugins.

	If you enable a Golang plugin then monstache will ignore an javascript middleware in your configuration. This may
	change in the future but for now the choice of middleware language is mutually exclusive.

### Golang

monstache supports golang plugins.  You should have golang version 1.11 or greater installed and will need to perform the build on the Linux or OSX platform. Golang plugins are not currently supported on the Windows platform due to limits in golang.

To implement a plugin for monstache you need to implement specific function signatures,
use the go command to build a .so file for your plugin, 
and finally pass the path to your plugin .so file when running monstache.

See [this wiki page](https://github.com/rwynn/monstache/wiki/Build-and-run-a-monstache-docker-container-image-with-an-embedded-go-plugin) for an example using Docker.

!!! warning
	Golang plugins must be built with the exact same source code (including dependencies) of the loading program.
  If you don't build your plugin this way then monstache may fail to load it at runtime due to source code mismatches.

To create a golang plugin for monstache

- git clone `monstache` somewhere outside your $GOPATH
- git checkout a specific monstache version tag (e.g. `v6.7.4`).  See Versions above.
- in the monstache root directory run `go install` to build the `monstache` binary. It should now be in $GOPATH/bin
- create a .go source file for your plugin in the monstache root directory with the package name `main`
- implement one or more of the following functions: `Map`, `Filter`, `Pipeline`, `Process`

```go

func Map(input *monstachemap.MapperPluginInput) (output *monstachemap.MapperPluginOutput, err error)

func Filter(input *monstachemap.MapperPluginInput) (keep bool, err error)

func Pipeline(ns string, changeStream bool) (stages []interface, err error)

func Process(input*monstachemap.ProcessPluginInput) error

```

Compile your plugin to a .so with

```sh
go build -buildmode=plugin -o myplugin.so myplugin.go
```

Run the binary, the one you built above with `go install` (not a release binary), with the following arguments

```sh
$GOPATH/bin/monstache -mapper-plugin-path /path/to/myplugin.so
```

The following example plugin simply converts top-level string values to uppercase

```go
package main
import (
	"github.com/rwynn/monstache/v6/monstachemap"
	"strings"
)
// a plugin to convert document values to uppercase
func Map(input *monstachemap.MapperPluginInput) (output *monstachemap.MapperPluginOutput, err error) {
	doc := input.Document
	for k, v := range doc {
		switch v.(type) {
		case string:
			doc[k] = strings.ToUpper(v.(string))
		}
	}
	output = &monstachemap.MapperPluginOutput{Document: doc}
	return
}
```

The input parameter will contain information about the document's origin database and collection:

| field        | meaning                                                                |
| ------------ | ---------------------------------------------------------------------- |
| `Document`   | MongoDB document updated or inserted                                   |
| `UpdateDescription`   | If available, the [update description](https://docs.mongodb.com/manual/reference/change-events/#update-event)|
| `Namespace`  | Operation [namespace](#namespaces) as described above                  |
| `Database`   | MongoDB database from where the event came                             |
| `Collection` | MongoDB collection where the document was inserted, deleted or updated |
| `Operation`  | Which kind of operation triggered this event, see [gtm.mapOperation()](https://github.com/rwynn/gtm/blob/master/gtm.go#L116). "i" for insert, "u" for update, "d" for delete and "c" for invalidate. The `Map` function will only receive inserts and updates.  To handle deletes or invalidates implement the `Process` function described below. |
| `Session`    | [*mgo.Session](https://godoc.org/github.com/globalsign/mgo#Session). You need not `Close` the session as monstache will do this automatically when the function exits|

The output parameter will contain information about how the document should be treated by monstache:

| field             | meaning                                                                     |
| ----------------- | --------------------------------------------------------------------------- |
| `Document`        | an updated document to index into Elasticsearch                             |
| `Index`           | the name of the index to use                                                |
| `Type`            | the document type                                                           |
| `ID`              | override the document ID                                                    |
| `Routing`         | the routing value to use                                                    |
| `Drop`            | set to true to indicate that the document should not be indexed but removed |
| `Passthrough`     | set to true to indicate the original document should be indexed unchanged   |
| `Parent`          | the parent id to use                                                        |
| `Version`         | the version of the document                                                 |
| `VersionType`     | the version type of the document (internal, external, external_gte)         |
| `Pipeline`        | the pipeline to index with                                                  |
| `RetryOnConflict` | how many times to retry updates before failing                              |
| `Skip`            | set to true to indicate the the document should be ignored                  |

*For detailed information see [monstachemap/plugin.go](https://github.com/rwynn/monstache/blob/master/monstachemap/plugin.go)*

Few examples are:

To skip the document (direct monstache to ignore it) set `output.Skip = true`.

To drop the document (direct monstache not to index it but remove it) set `output.Drop = true`.

To simply pass the original document through to Elasticsearch, set `output.Passthrough = true`

To set custom indexing metadata on the document use `output.Index`, `output.Type`, `output.Parent` and `output.Routing`.

!!! note
    If you override `output.Index`, `output.Type`, `output.Parent` or `output.Routing` for any MongoDB namespaces in a 
    golang plugin you should also add those namespaces to the `routing-namespaces` array in your config file.

    This instructs Monstache to query the document metadata so that deletes of the document work correctly.

If would like to embed other MongoDB documents (possibly from a different collection) within the current document 
before indexing, you can access the `*mgo.Session` pointer as `input.Session`.  With the mgo session you can use the [mgo API](https://godoc.org/github.com/globalsign/mgo) to find documents in MongoDB and embed them in the Document set on output.

When you implement a `Filter` function the function is called immediately after reading inserts and updates from the oplog.  You can return false from this function to completely ignore a document.  This is different than setting `output.Drop` from the mapping function because when you set `output.Drop` to true, a delete request is issued to Elasticsearch in case the document had previously been indexed.  By contrast, returning false from the `Filter` function causes the operation to be completely ignored and there is no corresponding delete request issued to Elasticsearch.

When you implement a `Pipeline` function the function will be called to setup an [aggregation pipeline](https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/) for both direct reads and any change streams that you have configured. The aggregation pipeline stages that you return may be different depending if applied to a direct read or to a change stream. For direct reads the root document will be the document in the collection.  For change streams the root document will be a change event with a `fullDocument` field inside it. Use the boolean parameter `changeStream` to alter the stages that you return from this function accordingly.

When you implement a `Process` function the function will be called after monstache processes each event.  This function has full access to the MongoDB and Elasticsearch clients (including the Elasticsearch bulk processor) in the input and allows you to handle complex event processing scenarios. The input parameter for the `Process` function will have all the same fields as the input to a `Map` function described above plus the following:

| field                   | meaning                                                                |
| ----------------------- | ---------------------------------------------------------------------- |
| `Document`              | MongoDB document updated, inserted, or deleted                         |
| `ElasticClient`         | A full featured Elasticsearch [client](https://godoc.org/github.com/olivere/elastic#Client)|
| `ElasticBulkProcessor`  | The same bulk [processor](https://godoc.org/github.com/olivere/elastic#BulkProcessor) monstache uses to index documents. You need only `Add` requests to the processor and they will be flushed in bulk automatically. `Note` you must delete the `_id` field from any argument to the bulk processor `Add` function|
| `Timestamp`             | The MongoDB [timestamp](https://docs.mongodb.com/manual/reference/bson-types/#timestamps) of the change event from the oplog. In the case of direct reads the timestamp is the time at which the document was read from MongoDB.                      |

!!! note
	Under the `docker/plugin` folder there is a `build.sh` script to help you build a plugin. There is a README file in that directory with instructions.

### Javascript

Monstache supports plugins written in Javascript.  You may find that Javascript plugins give you much less performance than
golang plugins.  You also may reach some limits of what can be done in the Javascript.  This is due to the implementation 
of the Javascript environment and the locking required under high load. Javascript plugins are still very useful for quick 
prototypes and small data sets.

#### Transformation

Monstache uses the amazing [otto](https://github.com/robertkrimen/otto) library to provide transformation at the document field
level in Javascript.  You can associate one javascript mapping function per MongoDB collection.  You can also associate a function 
at the global level by not specifying a namespace.  These javascript functions are
added to your TOML config file, for example:
	
```toml
[[script]]
namespace = "mydb.mycollection"
script = """
var counter = 1;
module.exports = function(doc) {
	doc.foo += "test" + counter;
	counter++;
	return doc;
}
"""

[[script]]
namespace = "anotherdb.anothercollection"
path = "path/to/transform.js"
routing = true

[[script]]
# this script does not declare a namespace
# it is global to all collections
script = """
module.exports = function(doc, ns, updateDesc) {
	// the doc namespace e.g. test.test is passed as the 2nd arg
        // if available, an object containing the update description is passed as the 3rd arg
	return _.omit(doc, "password", "secret");
}
"""
```

The example TOML above configures 3 scripts. The first is applied to `mycollection` in `mydb` while the second is applied
to `anothercollection` in `anotherdb`. The first script is inlined while the second is loaded from a file path.  The path can be absolute or relative to the directory monstache is executed from.
The last script does not specify a namespace, so documents from all collections pass through it. Global scripts are run before scripts which are
linked to a specific namespace.

You will notice that the multi-line string feature of TOML is used to assign a javascript snippet to the variable named
`script`.  The javascript assigned to script must assign a function to the exports property of the `module` object.  This 
function will be passed the document from MongoDB just before it is indexed in Elasticsearch.  Inside the function you can
manipulate the document to drop fields, add fields, or augment the existing fields.

The `this` reference in the mapping function is assigned to the document from MongoDB.  

When the return value from the mapping function is an `object` then that mapped object is what actually gets indexed in Elasticsearch.
For these purposes an object is a javascript non-primitive, excluding `Function`, `Array`, `String`, `Number`, `Boolean`, `Date`, `Error` and `RegExp`.

#### Filtering

You can completely ignore documents by adding filter configurations to your TOML config file.  The filter functions are executing immediately after inserts or updates are read from the oplog.  The correspding document is passed into the function and you can return true or false to include or ignore the document.

```toml
[[filter]]
namespace = "db.collection"
script = """
module.exports = function(doc, ns, updateDesc) {
    return !!doc.interesting;
}
"""

[[filter]]
namespace = "db2.collection2"
path = "path/to/script.js"
```

#### Aggregation Pipelines

You can alter or filter direct reads and change streams by using a pipeline definition. Note, when building a pipeline for a change stream the
root of the document will be the change event and the associated document will be under a field named `fullDocument`.

For more information on the properties of the root document for change streams see [Change Events](https://docs.mongodb.com/manual/reference/change-events/).

You can scope a pipeline to a particular namespace using the `namespace` attribute or leave it off to have the pipeline applied to all namespaces.

```toml
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
```

!!! warning
	You should not replace the root using `$replaceRoot` for a change stream since monstache needs this information.  You should only make
	modifications to the `fullDocument` field in a pipeline.

#### Dropping

If the return value from the mapping function is not an `object` per the definition above then the result is converted into a `boolean`
and if the boolean value is `false` then that indicates to monstache that you would not like to index the document. If the boolean value is `true` then
the original document from MongoDB gets indexed in Elasticsearch.

This allows you to return false or null if you have implemented soft deletes in MongoDB.

```toml
[[script]]
namespace = "db.collection"
script = """
module.exports = function(doc) {
	if (!!doc.deletedAt) {
		return false;
	}
	return true;
}
"""
```

In the above example monstache will index any document except the ones with a `deletedAt` property.  If the document is first
inserted without a `deletedAt` property, but later updated to include the `deletedAt` property then monstache will remove, or drop, the
previously indexed document from the Elasticsearch index. 

!!! note
    Dropping a document is different that filtering a document.  A filtered document is completely ignored.  A dropped document results in a delete request being issued to Elasticsearch in case the document had previously been indexed.

#### Scripting Features 

You may have noticed that in the first example above the exported mapping function closes over a var named `counter`.  You can
use closures to maintain state between invocations of your mapping function.

Finally, since Otto makes it so easy, the venerable [Underscore](http://underscorejs.org/) library is included for you at 
no extra charge.  Feel free to abuse the power of the `_`.

#### Embedding Documents

In your javascript function you have access to the following global functions to retreive documents from MongoDB for
embedding in the current document before indexing.  Using this approach you can pull in related data.

```javascript
function findId(documentId, [options]) {
    // convenience method for findOne({_id: documentId})
    // returns 1 document or null
}

function findOne(query, [options]) {
    // returns 1 document or null
}

function find(query, [options]) {
    // returns an array of documents or null
}

function pipe(stages, [options]) {
    // returns an array of documents or null
}
```

Each function takes a `query` type object parameter and an optional `options` object parameter.

The options object takes the following keys and values:

```javascript
var options = {
    database: "test",
    collection: "test",
    // to omit _id set the _id key to 0 in select
    select: {
        age: 1
    },
    // only applicable to find...
    sort: ["name"],
    limit: 2
}
```

If the database or collection keys are omitted from the options object, the values for database and/or
collection are set to the database and collection of the document being processed.

Here are some examples:

This example sorts the documents in the same collection as the document being processed by name and returns
the first 2 documents projecting only the age field.  The result is set on the current document before being
indexed.

```
[[script]]
namespace = "test.test"
script = """
module.exports = function(doc) {
    doc.twoAgesSortedByName = find({}, {
            sort: ["name"],
            limit: 2,
            select: {
              age: 1
            }
    });
    return doc;
}
"""
```

This example grabs a reference id from a document and replaces it with the corresponding document with that id.

```
[[script]]
namespace = "test.posts"
script = """
module.exports = function(post) {
    if (post.author) { // author is a an object id reference
        post.author = findId(post.author, {
          database: "test",
          collection: "users"
        });
    }
    return post;
}
"""
```

This example runs an aggregation pipeline and stores the results in an extra field in the document

```
[[script]]
namespace = "test.test"
script = """
module.exports = function(doc, ns) {
  doc.extra = pipe([
    { $match: {foo: 1} },
    { $limit: 1 },
    { $project: { _id: 0, foo: 1}}
  ]
  // optional , { database: "foo", collection: "bar"} // defaults to same namespace
  );
  return doc;
}
"""
```

#### Indexing Metadata

You can override the indexing metadata for an individual document by setting a special field named
`_meta_monstache` on the document you return from your Javascript function.

The `_meta_monstache` object supports the following properties.

| prop              | meaning                                                                     |
| ----------------- | --------------------------------------------------------------------------- |
| `routing`         | the routing value                                                           |
| `index`           | the name of the index to use                                                |
| `type`            | the document type                                                           |
| `parent`          | the document parent                                                         |
| `version`         | the document version                                                        |
| `versionType`     | the document version type                                                   |
| `pipeline`        | the name of a pipeline to apply to the document                             |
| `retryOnConflict` | control how retry works on conflicts                                        |
| `skip`            | set this boolean to true to skip indexing                                   |
| `id`              | override the ID used to index the document                                  |

Assume there is a collection in MongoDB named `company` in the `test` database.
The documents in this collection look like either

```
{ "_id": "london", "type": "branch", "name": "London Westminster", "city": "London", "country": "UK" }
```
or
```
{ "_id": "alice", "type": "employee", "name": "Alice Smith", "branch": "london" }
```

Given the above the following snippet sets up a parent-child relationship in Elasticsearch based on the
incoming documents from MongoDB and updates the ns (namespace) from test.company to company in Elasticsearch

```
[[script]]
namespace = "test.company"
routing = true
script = """
module.exports = function(doc, ns) {
		// var meta = { type: doc.type, index: 'company' };
    var meta = { type: doc.type, index: ns.split(".")[1] };
    if (doc.type === "employee") {
        meta.parent = doc.branch;
    }
    doc._meta_monstache = meta;
    return _.omit(doc, "branch", "type");
}
"""
```

The snippet above will route these documents to the `company` index in Elasticsearch instead of the
default of `test.company`, if you didn't specify a namespace, it'll route all documents to indexes named as the collection only without the database _db_._collection_ (MongoDB) => _collection_ (Elasticsearch).  Also, instead of using `company` as the Elasticsearch type, the type
attribute from the document will be used as the Elasticsearch type.  Finally, if the type is
employee then the document will be indexed as a child of the branch the person belongs to.

We can throw away the type and branch information by deleting it from the document before returning
since the type information will be stored in Elasticsearch under `_type` and the branch information
will be stored under `_parent`.

The example is based on the Elasticsearch docs for [parent-child](https://www.elastic.co/guide/en/elasticsearch/guide/current/parent-child.html)

For more on updating the namespace name, check the [Delete Strategy](../config/#delete-strategy)

## Routing

Routing is the process by which Elasticsearch determines which shard a document will reside in.  Monstache
supports user defined, or custom, routing of your MongoDB documents into Elasticsearch.  

Consider an example where you have a `comments` collection in MongoDB which stores a comment and 
its associated post identifier.  

```javascript
use blog;
db.comments.insert({title: "Did you read this?", post_id: "123"});
db.comments.insert({title: "Yeah, it's good", post_id: "123"});
```

In this case monstache will index those 2 documents in an index named `blog.comments` under the id
created by MongoDB.  When Elasticsearch routes a document to a shard, by default, it does so by hashing 
the id of the document.  This means that as the number of comments on post `123` grows, each of the comments
will be distributed somewhat evenly between the available shards in the cluster.  

Thus, when a query is performed searching among the comments for post `123` Elasticsearch will need to query
all of those shards just in case a comment happened to have been routed there.

We can take advantage of the support in Elasticsearch and in monstache to do some intelligent
routing such that all comments for post `123` reside in the same shard.

First we need to tell monstache that we would like to do custom routing for this collection by setting `routing`
equal to true on a custom script for the namespace.  Then we need to add some metadata to the document telling
monstache how to route the document when indexing.  In this case we want to route by the `post_id` field.

```toml
[[script]]
namespace = "blog.comments"
routing = true
script = """
module.exports = function(doc) {
	doc._meta_monstache = { routing: doc.post_id };
	return doc;
}
"""
```

Now when monstache indexes document for the collection `blog.comments` it will set the special `_routing` attribute
for the document on the index request such that Elasticsearch routes comments based on their corresponding post. 

The `_meta_monstache` field is used only to inform monstache about routing and is not included in the source
document when indexing to Elasticsearch.  

Now when we are searching for comments and we know the post id that the comment belongs to we can include that post
id in the request and make a search that normally queries all shards query only 1 shard.

```
$ curl -H "Content-Type:application/json" -XGET 'http://localhost:9200/blog.comments/_search?routing=123' -d '
{
   "query":{
      "match_all":{}
   }
}'
```

You will notice in the response that only 1 shard was queried instead of all your shards.  Custom routing is great
way to reduce broadcast searches and thus get better performance.

The catch with custom routing is that you need to include the routing parameter on all insert, update, and delete
operations.  Insert and update is not a problem for monstache because the routing information will come from your
MongoDB document.  Deletes, however, pose a problem for monstache because when a delete occurs in MongoDB the
information in the oplog is limited to the id of the document that was deleted.  But monstache needs to know where the
document was originally routed in order to tell Elasticsearch where to look for it.

Monstache has 3 available strategies for handling deletes in this situation.  The default strategy is stateless and uses
a term query into Elasticsearch based on the ID of the document deleted in MongoDB.  If the search into Elasticsearch returns
exactly 1 document then monstache will schedule that document for deletion. The 2nd stategy monstache uses is stateful and requires
giving monstache the ability to write to the collection `monstache.meta`.  In this collection monstache stores information about
documents that were given custom indexing metadata.  This stategy slows down indexing and takes up space in MongoDB.  
However, it is precise because it records exactly how each document was indexed. The final stategy simply punts on deletes and
leaves document deletion to the user.  If you don't generally delete documents in MongoDB or don't care if Elasticsearch contains
documents which have been deleted in MongoDB, this option is available. See [Delete Strategy](../config/#delete-strategy) for more information.

For more information see [Customizing Document Routing](https://www.elastic.co/blog/customizing-your-document-routing)

In addition to letting your customize the shard routing for a specific document, you can also customize the Elasticsearch
`index` and `type` using a script by putting the custom information in the meta attribute. 

```toml
[[script]]
namespace = "blog.comments"
routing = true
script = """
module.exports = function(doc) {
	if (doc.score >= 100) {
		// NOTE: prefix dynamic index with namespace for proper cleanup on drops
		doc._meta_monstache = { index: "blog.comments.highscore", type: "highScoreComment", routing: doc.post_id };
	} else {
		doc._meta_monstache = { routing: doc.post_id };
	}
	return doc;
}
"""
```

## Joins

Elasticsearch 6 introduces an updated approach to parent-child called joins.  The following example shows how you can accomplish joins
with Monstache.  The example is based on the Elasticsearch [documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/parent-join.html).

This example assumes Monstache is syncing the `test.test` collection in MongoDB with the `test.test` index in Elasticsearch.

First we will want to setup an index mapping in Elasticsearch describing the join field.  

```
curl -XPUT 'localhost:9200/test.test?pretty' -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "_doc": {
      "properties": {
        "my_join_field": { 
          "type": "join",
          "relations": {
            "question": "answer" 
          }
        }
      }
    }
  }
}
'
```

!!! warning
    The above mapping uses _doc as the Elasticsearch type. _doc is the recommended type for new
    versions Elasticsearch but it only works with Elasticsearch versions 6.2 and greater.  Monstache
    defaults to using _doc as the type when it detects Elasticsearch version 6.2 or greater.  If you
    are using a previous version of Elasticsearch monstache defaults to using the MongoDB collection
    name as the Elasticsearch type. The type Monstache uses can be overriden but it is not
    recommended from Elasticsearch 6.2 on. 


Next will will configure Monstache with custom Javascript middleware that does transformation and routing.  In a file called CONFIG.toml.

```
[[script]]
namespace = "test.test"
routing = true
script = """
module.exports = function(doc) {
        var routing;
        if (doc.type === "question") {
                routing = doc._id;
                doc.my_join_field = {
                   name: "question"
                }
        } else if (doc.type === "answer") {
                routing = doc.question;
                doc.my_join_field = {
                  name: "answer",
                  parent: routing
                };
        }
        if (routing) {
                doc._meta_monstache = { routing: routing };
        }
        return doc;
}
"""
```

The mapping function adds a `my_join_field` field to each document.  The contents of the field are based on the `type` attribute in the MongoDB
document. Also, the function ensures that the routing is always based on the _id of the question document.   

Now with this config in place we can start Monstache.  We will use verbose to see the requests.

```
monstache -verbose -f CONFIG.toml
```

With Monstache running we are now ready to insert into MongoDB

```

rs:PRIMARY> use test;
switched to db test

rs:PRIMARY> db.test.insert({type: "question", text: "This is a question"});

rs:PRIMARY> db.test.find()
{ "_id" : ObjectId("5a84a8b826993bde57c12893"), "type" : "question", "text" : "This is a question" }

rs:PRIMARY> db.test.insert({type: "answer", text: "This is an answer", question: ObjectId("5a84a8b826993bde57c12893") });

```

When we insert these documents we should see Monstache generate the following requests to Elasticsearch

```

{"index":{"_id":"5a84a8b826993bde57c12893","_index":"test.test","_type":"_doc","routing":"5a84a8b826993bde57c12893","version":6522523668566769665,"version_type":"external"}}
{"my_join_field":{"name":"question"},"text":"This is a question","type":"question"}

{"index":{"_id":"5a84a92b26993bde57c12894","_index":"test.test","_type":"_doc","routing":"5a84a8b826993bde57c12893","version":6522524162488008705,"version_type":"external"}}
{"my_join_field":{"name":"answer","parent":"5a84a8b826993bde57c12893"},"question":"5a84a8b826993bde57c12893","text":"This is an answer","type":"answer"}

```

This looks good.  We should now have a parent/child relationship between these documents in Elasticsearch.

If we do a search on the `test.test` index we see the following results:

```json

 "hits" : {
    "total" : 2,
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "test.test",
        "_type" : "_doc",
        "_id" : "5a84a8b826993bde57c12893",
        "_score" : 1.0,
        "_routing" : "5a84a8b826993bde57c12893",
        "_source" : {
          "my_join_field" : {
            "name" : "question"
          },
          "text" : "This is a question",
          "type" : "question"
        }
      },
      {
        "_index" : "test.test",
        "_type" : "_doc",
        "_id" : "5a84a92b26993bde57c12894",
        "_score" : 1.0,
        "_routing" : "5a84a8b826993bde57c12893",
        "_source" : {
          "my_join_field" : {
            "name" : "answer",
            "parent" : "5a84a8b826993bde57c12893"
          },
          "question" : "5a84a8b826993bde57c12893",
          "text" : "This is an answer",
          "type" : "answer"
        }
      }
    ]
  }

```

To clean up our documents in Elasticsearch a bit we can omit the information that we don't really need in the source docs by 
updating our mapping function. This information needs not be at the top-level since it is duplicated in `my_join_field`.

```
	return _.omit(doc, "type", "question");

```

If your parent and child documents are in separate MongoDB collections then you would set up a script
for each collection.  You can tell if the doc is a parent or child by the collection it comes from. The only other difference would be that you would need to override the index dynamically in addition to the routing such that documents from both MongoDB collections target the same 
index.

```
    doc._meta_monstache = { routing: routing, index: "parentsAndChildren" };
```
!!! warning
    You must be careful when you route 2 or more MongoDB collections to the same Elasticsearch index
    that the document _ids across the MongoDB collections do not collide for any 2 docs because 
    they will be used as the _id in the target index. 

## Time Machines

If you are not just interested in what the current value of a document in MongoDB is, but also would like to see how it has changed over time use [time machine namespaces](../config/#time-machine-namespaces).   For example, you've inserted and later updated a document with id 123 in the `test.test` collection in MongoDB. If `test.test` is a time machine namespace you will have 2 documents representing those changes in the `log.test.test.2018-02-20` index (timestamp will change) in Elasticsearch.  If you later want all the changes made to that document in MongoDB you can issue a query like this:

```
$ curl -XGET 'http://localhost:9200/log.test.test.*/_search?routing=123' -d '
{
   "query":{
      "sort" : [
        { "_oplog_ts" : {"order" : "desc"}}
      ],
      "filtered":{
         "query":{
            "match_all":{}
         },
         "filter":{
            "term":{
               "_source_id":"123"
            }
         }
      }
   }
}'
```

That query will be very efficient because it only queries the shard that all the change docs went to for MongoDB document id 123.  It filters the documents on that shard by `_source_id`, or id from MongoDB, to only give us the changes to that document.  Finally, it sorts by the `_oplog_ts` which gives us the most recent change docs first.   

The index pattern in the query is a wildcard to pick up all the timestamped indexes that we've acculated for the `test.test` namespace.

## Merge Patches

A unique feature of monstache is support for JSON Merge Patches [rfc-7396](https://tools.ietf.org/html/rfc7396).

If merge patches are enabled monstache will add an additional field to documents indexed into Elasticsearch. The
name of this field is configurable but it defaults to `json-merge-patches`.  

Consider the following example with merge patches enabled... 

```javascript
db.test.insert({name: "Joe", age: 16, friends: [1, 2, 3]})
```
At this point you would have the following document source in Elasticsearch.

	 "_source" : {
	  "age" : 16,
	  "friends" : [
	    1,
	    2,
	    3
	  ],
	  "json-merge-patches" : [
	    {
	      "p" : "{\"age\":16,\"friends\":[1,2,3],\"name\":\"Joe\"}",
	      "ts" : 1487263414,
	      "v" : 1
	    }
	  ],
	  "name" : "Joe"
	}

As you can see we have a single timestamped merge patch in the json-merge-patches array.  

Now let's update the document to remove a friend and update the age.

```javascript
db.test.update({name: "Joe"}, {$set: {age: 21, friends: [1, 3]}})
```

If we now look at the document in Elasticsearch we see the following:

	"_source" : {
	  "age" : 21,
	  "friends" : [
	    1,
	    3
	  ],
	  "json-merge-patches" : [
	    {
	      "p" : "{\"age\":16,\"friends\":[1,2,3],\"name\":\"Joe\"}",
	      "ts" : 1487263414,
	      "v" : 1
	    },
	    {
	      "p" : "{\"age\":21,\"friends\":[1,3]}",
	      "ts" : 1487263746,
	      "v" : 2
	    }
	  ],
	  "name" : "Joe"
	}

You can see that the document was updated as expected and an additional merge patch was added.

Each time the document is updated in MongoDB the corresponding document in Elasticsearch gains a
timestamped merge patch.  Using this information we can time travel is the document's history.

There is a merge patch for each version of the document.  To recreate a specific version we simply need
to apply the merge patches in order up to the version that we want.

To get version 1 of the document above we start with {} and apply the 1st merge patch.  

To get version 2 of the document above we start with {}

- apply the 1st merge patch to get v1
- apply the 2nd merge patch to v1 to get v2

The timestamps associated with these merge patches are in seconds since the epoch, taken from the
timestamp recorded in the oplog when the insert or update occured. 

To enable the merge patches feature in monstache you need to add the following to you TOML config:

	enable-patches = true
	patch-namespaces = ["test.test"]

You need you add each namespace that you would like to see patches for in the patch-namespaces array.

Optionally, you can change the key under which the patches are stored in the source document as follows:

    merge-patch-attribute = "custom-merge-attr"	

Merge patches will only be recorded for data read from the MongoDB oplog.  Data read using the direct read
feature will not be enhanced with merge patches.

Most likely, you will want to turn off indexing for the merge patch attribute.  You can do this by creating
an index template for each patch namespace before running monstache...

	PUT /_template/test.test
	{
	    "template" : "test.test",
	    "mappings" : {
		"test" : {
		    "json-merge-patches" : { "index" : false }
		}
	    }
	}

## Systemd

Monstache has support built in for integrating with systemd. The following `monstache.service` is an example 
systemd configuration.

    [Unit]
    Description=monstache sync service

    [Service]
    Type=notify
    ExecStart=/usr/local/bin/monstache -f /etc/monstache/config.toml
    WatchdogSec=30s
    Restart=always

    [Install]
    WantedBy=multi-user.target

Systemd unit files are normally saved to `/lib/systemd/system`.  Verify same with your OS documentation. 

After saving the monstache.service file you can run `systemctl daemon-reload` to tell systemd to reload 
all unit files. 

You can enable the service to start on boot with `systemctl enable monstache.service` and start the service with `systemctl start monstache.service`.

With the configuration above monstache will notify systemd when it has started successfully and then notify 
systemd repeatedly at half the WatchDog interval to signal liveness.  The configuration above causes systemd
to restart monstache if it does not start or respond within the WatchdDog interval.

## Docker

There are Docker images available for Monstache on [Docker Hub](https://hub.docker.com/r/rwynn/monstache/tags/)

You can pull and run the latest images with

```
docker run rwynn/monstache:rel6 -v

docker run rwynn/monstache:rel5 -v
```

You can pull and run release images with

```
docker run rwynn/monstache:6.7.4 -v

docker run rwynn/monstache:5.7.4 -v
```

For example, to run monstache via Docker with a golang plugin that resides at `~/plugin/plugin.so` on the host you can use a bind mount

```

docker run --rm --net=host -v ~/plugin:/tmp/plugin rwynn/monstache:6.7.4 -mapper-plugin-path /tmp/plugin/plugin.so

```

## HTTP Server

Monstache has a built in HTTP server that you can enable with --enable-http-server. It
listens on :8080 by default but you can change this with --http-server-addr.

When using monstache with kubernetes this server can be used to detect liveness and 
[act accordingly](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/)

The following GET endpoints are available

#### /started

Returns the uptime of the server

#### /healthz

Returns at 200 status code with the text "ok" when monstache is running

#### /stats

Returns the current indexing statistics in JSON format. Only available if stats are enabled

#### /instance

Returns information about the running monstache process including whether or not it is currently enabled
(a cluster will have one enabled process) and the most recent change event timestamp read from MongoDB.

#### /debug (if pprof is enabled)

If the pprof setting is enabled the following endpoints are also made available:

* /debug/pprof/
* /debug/pprof/cmdline
* /debug/pprof/profile
* /debug/pprof/symbol
* /debug/pprof/trace

## MongoDB Authentication

Check the following [link](https://github.com/mongodb/mongo-go-driver/blob/v1.4.4/x/mongo/driver/connstring/connstring.go)
for all available options that you can specify in the MongoDB connection string related to authentication.

For more information on how the MongoDB driver processes authentication configuration see
[the driver docs](https://pkg.go.dev/go.mongodb.org/mongo-driver/mongo#Connect).

## AWS Signature Version 4

Monstache has included AWS Signature Version 4 request signing.  To enable the AWS Signature Version 4 support add the following to your config file:

```

elasticsearch-urls = ["https://<endpoint_from_aws_overview_screen>:443"]

[aws-connect]
access-key = "XXX"
secret-key = "YYY"
region = "ZZZ"

```

See the docs for [aws-connect](../config/#aws-connect) for the different stategies available for configuring a credential
provider.

Notice how the `elasticsearch-url` references the port number `443` in the connection string.  This is because AWS makes
your cluster available on the standard https port and not the default Elasticsearch port of `9200`.  If you have connection
problems make sure you are using the correct port.  You cannot omit the port because the driver will default to `9200` if a 
port is not specified.  

You can read more about [Signature Version 4](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html) and 
[Amazon Elasticsearch Service](https://aws.amazon.com/elasticsearch-service/).

For information on how to obtain the `access-key` and `secret-key` required to connect you can read this
[blog post](https://medium.com/@ahuijsen/setting-up-permissions-for-elasticsearch-service-in-aws-2fef7cc02b4c).

In short, you will need to create or use an existing IAM user in your AWS account.  You will then need to give this user 
access to your Elasticsearch domain. The `access-key` and `secret-key` you put in your configuration file are those associated
with the IAM user.

```
{
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::<account-id>:user/<iam-user-name>"
      },
      "Action": "es:*",
      "Resource": "arn:aws:es:us-east-1:<account-id>:domain/<elasticsearch-domain-name>/*"
}

```

## Watching changes on specific fields only

If you are using MongoDB 3.6+ you can use a change stream pipeline to only listen for change events on specific fields.

For example, if you wanted to listen for `create`, `delete`, and `update` events on the namespace `test.test`, but you only
wanted to sync changes when the `foo` or `bar` field changed on the doc, you could use the following configuration. 

If, for example, a field named `count` changed on the document, then this change would be ignored by monstache. 

```
change-stream-namespaces = ["test.test"]

[[pipeline]]
namespace = "test.test"
script = """
module.exports = function(ns, changeStream) {
  if (changeStream) {
    return [
      {
        $match: {
          $or: [
            { "updateDescription": {$exists: false} },
            { "updateDescription.updatedFields.foo": {$exists: true}},
            { "updateDescription.updatedFields.bar": {$exists: true}}
          ]
        }
      }
    ];
  } else {
    return [];
  }
}
"""
```

To build complicated change stream pipelines see [Change Events](https://docs.mongodb.com/manual/reference/change-events/) 
for information on the structure of change events. This information will shape your pipeline.

## MongoDB view replication

You may have a situation where you want to replicate a MongoDB view in Elasticsearch.
Or you have a collection that should trigger sync of another collection. You can use the `relate` config to do this.

Consider you have a collections `thing` and `state`.  A thing has an associated state and a thing is linked to a state via
a field `s` which points to the `_id` of the associated state in the `state` collection.

You can create a view in MongoDB that uses a `$lookup` to pull the state information in and present a view of things with the state 
information included.

```
use thingdb;
db.createView("thingview", "thing", [ {$lookup: {from: "state", localField: "s", foreignField: "_id", as: "s"}}])
```

Given this view you can use the following config to keep things up to date in a `things` index in Elasticsearch.

```
direct-read-namespaces = ["thingdb.thingview"] # read direct from the view of the collection to seed index

change-stream-namespaces = ["thingdb.thing", "thingdb.state"] # change events happen on the underlying collections not views

[[mapping]]
namespace = "thingdb.thing" # map change events on the thing collection to the things index
index = "things"

[[mapping]]
namespace = "thingdb.thingview" # map direct reads of the thingview to the same things index
index = "things"

[[relate]]
namespace = "thingdb.thing"  # when a thing changes look it up in the assoicated view by _id and index that
with-namespace = "thingdb.thingview"
keep-src = false # ignore the original thing that changed and instead just use the lookup of that thing via the view

[[relate]]
namespace = "thingdb.state" # when a state changes trigger a thing change event since thing is associated to a state
with-namespace = "thingdb.thing"
src-field = "_id" # use the _id field of the state that changed to lookup associated things
match-field = "s" # only trigger change events for the things where thing.s (match-field) = state._id (src-field).
keep-src = false
```

!!! warning
	Be careful of the expense of using `relate` with a view.  In the example above, if there were many things 
	associated to a single state then a change to that state would trigger n+1 queries to MongoDB when n is the 
	number of things related to the state.  1 query would be used to find all associated things and n queries would be 
	used to lookup each thing in the view.

## Amazon DocumentDB (with MongoDB compatibility)

Monstache support for Amazon DocumentDB is currently experimental.  Support for the change streams API in MongoDB
was recently added to Amazon DocumentDB. Consult the DocumentDB documentation for instructions on 
[enabling change streams](https://docs.aws.amazon.com/documentdb/latest/developerguide/change-streams.html)
for your collections.

Since Amazon DocumentDB only supports compatibility with MongoDB API 3.6 you will want to ensure that your change stream
configuration targets collections and that your resume strategy is set to use tokens and not the default of timestamps.

Ensure that your MongoDB connection URI is set with a primary read preference: e.g. `?readPreference=primary`.

```toml
# ensure you target collections in your change stream namespaces
change-stream-namespaces = ["db1.col1", "db2.col2"]
# ensure that resuming, if enabled, is done based on tokens and not timestamps
resume = true
resume-strategy = 1
```


<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "72240423b033493f80acd2f95b8e0f69"}'></script>
