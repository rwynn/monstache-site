---
title: Transform and Filter
weight: 40
---

### Transformation

monstache uses the amazing [otto](https://github.com/robertkrimen/otto) library to provide transformation at the document field
level in javascript.  You can associate one javascript mapping function per mongodb collection.  These javascript functions are
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

---
