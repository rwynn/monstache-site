---
title: Transform and Filter
weight: 40
---

monstache supports embedding user defined middleware between MongoDB and Elasticsearch.  middleware is able to transform documents,
drop documents, or define indexing metadata.  middleware may be written in either Javascript or in Golang as a plugin.  Golang plugins
require Go version 1.8 or greater on Linux. currently, you are able to use Javascript or Golang but not both (this may change in the future).

## Golang

monstache supports Golang 1.8 plugins on Linux.  To implement a plugin for monstache you simply need to implement a specific function signature,
use the go command to build a .so file for your plugin, and finally pass the path to your plugin .so file when running monstache.

plugins must import the package `github.com/rwynn/monstache/monstachemap`

plugins must implement a function named `Map` with the following signature

```go
func Map(input *monstachemap.MapperPluginInput) (output *monstachemap.MapperPluginOutput, err error)
```

plugins can be compiled using

	go build -buildmode=plugin -o myplugin.so myplugin.go

to enable the plugin, start with `monstache -mapper-plugin-path /path/to/myplugin.so`

the following example plugin simply converts top level string values to uppercase

```go
package main
import (
	"github.com/rwynn/monstache/monstachemap"
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

the input parameter will contain information about the document's origin database and collection.
to drop the document (direct monstache not to index it) set `output.Drop = true`.
to simply pass the original document through to Elasticsearch, set `output.Passthrough = true`

`output.Index`, `output.Type`, `output.Parent` and `output.Routing` allow you to set the indexing metadata for each individual document.

if would like to embed other MongoDB documents (possibly from a different collection) within the current document 
before indexing, you can access the `*mgo.Session` pointer as `input.Session`.  With the mgo session you can use the 
[mgo API](https://godoc.org/gopkg.in/mgo.v2) to find documents in MongoDB and embed them in the Document set 
on output.  

## Javascript

### Transformation

monstache uses the amazing [otto](https://github.com/robertkrimen/otto) library to provide transformation at the document field
level in Javascript.  You can associate one javascript mapping function per mongodb collection.  These javascript functions are
added to your TOML config file, for example:
	
```toml
[[script]]
namespace = "mydb.mycollection"
script = """
var counter = 1;
module.exports = function(doc) {
	doc.foo += "test" + counter;
	counter++;
	return _.omit(doc, "password", "secret");
}
"""

[[script]]
namespace = "anotherdb.anothercollection"
script = """
var counter = 1;
module.exports = function(doc) {
	doc.foo += "test2" + counter;
	counter++;
	return doc;
}
"""
```

The example TOML above configures 2 scripts. The first is applied to `mycollection` in `mydb` while the second is applied
to `anothercollection` in `anotherdb`.

You will notice that the multi-line string feature of TOML is used to assign a javascript snippet to the variable named
`script`.  The javascript assigned to script must assign a function to the exports property of the `module` object.  This 
function will be passed the document from mongodb just before it is indexed in elasticsearch.  Inside the function you can
manipulate the document to drop fields, add fields, or augment the existing fields.

The `this` reference in the mapping function is assigned to the document from mongodb.  

When the return value from the mapping function is an `object` then that mapped object is what actually gets indexed in elasticsearch.
For these purposes an object is a javascript non-primitive, excluding `Function`, `Array`, `String`, `Number`, `Boolean`, `Date`, `Error` and `RegExp`.

### Filtering

If the return value from the mapping function is not an `object` per the definition above then the result is converted into a `boolean`
and if the boolean value is `false` then that indicates to monstache that you would not like to index the document. If the boolean value is `true` then
the original document from mongodb gets indexed in elasticsearch.

This allows you to return false or null if you have implemented soft deletes in mongodb.

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
inserted without a `deletedAt` property, but later updated to include the `deletedAt` property then monstache will remove the
previously indexed document from the elasticsearch index. 

Note you could also return `doc` above instead of returning `true` and get the same result, however, it's a slight performance gain
to simply return `true` when not changing the document because you are not copying data in that case.

You may have noticed that in the first example above the exported mapping function closes over a var named `counter`.  You can
use closures to maintain state between invocations of your mapping function.

Finally, since Otto makes it so easy, the venerable [Underscore](http://underscorejs.org/) library is included for you at 
no extra charge.  Feel free to abuse the power of the `_`.

### Embedding Documents

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
```

Each function takes a `query` object parameter and an optional `options` object parameter.

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

### Indexing Metadata

You can override the indexing metadata for an individual document by setting a special field named
`_meta_monstache` on the document you return from your Javascript function.

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
incoming documents from MongoDB.

```
[[script]]
namespace = "test.company"
routing = true
script = """
module.exports = function(doc) {
    var meta = { type: doc.type, index: 'company' };
    if (doc.type === "employee") {
        meta.parent = doc.branch;
    }
    doc._meta_monstache = meta;
    return _.omit(doc, "branch", "type");
}
"""
```

The snippet above will route these documents to the `company` index in Elasticsearch instead of the
default of `test.company`.  Also, instead of using `company` as the Elasticsearch type, the type
attribute from the document will be used as the Elasticsearch type.  Finally, if the type is
employee then the document will be indexed as a child of the branch the person belongs to.  

We can throw away the type and branch information by deleting it from the document before returning
since the type information will be stored in Elasticsearch under `_type` and the branch information
will be stored under `_parent`.

The example is based on the Elasticsearch docs for [parent-child](https://www.elastic.co/guide/en/elasticsearch/guide/current/parent-child.html)

---
