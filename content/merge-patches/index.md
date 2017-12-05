---
title: Merge Patches
weight: 71
---

A unique feature of monstache is support for JSON Merge Patches [rfc-7396](https://tools.ietf.org/html/rfc7396).

If merge patches are enabled monstache will add an additional field to documents indexed into elasticsearch. The
name of this field is configurable but it defaults to `json-merge-patches`.  

Consider the following example with merge patches enabled... 

```javascript
db.test.insert({name: "Joe", age: 16, friends: [1, 2, 3]})
```
At this point you would have the following document source in elasticsearch.

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

If we now look at the document in elasticsearch we see the following:

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

Each time the document is updated in mongodb the corresponding document in elasticsearch gains a
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

---
