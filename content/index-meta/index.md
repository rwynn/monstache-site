---
title: Routing
weight: 51
---

Domain knowledge of your data can lead to better performance with a custom routing solution. Routing
is the process by which ElasticSearch determines which shard a document will reside in.  Monstache
supports user defined, or custom, routing of your MongoDB documents into ElasticSearch.  

Consider an example where you have a `comments` collection in MongoDB which stores a comment and 
its associated post identifier.  

```
use blog;
db.comments.insert({title: "Did you read this?", post_id: "123"});
db.comments.insert({title: "Yeah, it's good", post_id: "123"});
```

In this case monstache will index those 2 documents in an index named `blog.comments` under the id
created by MongoDB.  When ElasticSearch routes a document to a shard, by default, it does so by hashing 
the id of the document.  This means that as the number of comments on post `123` grows, each of the comments
will be distributed somewhat evenly between the available shards in the cluster.  

Thus, when a query is performed searching among the comments for post `123` ElasticSearch will need to query
all of those shards just in case a comment happened to have been routed there.

This is where we can take advantage of the support in ElasticSearch and in monstache to do some intelligent
routing such that all comments for post `123` reside in the same shard.

First we need to tell monstache that we would like to do custom routing for this collection by setting `routing`
equal to true on a custom script for the namespace.  Then we need to add some metadata to the document telling
monstache how to route the document when indexing.  In this case we want to route by the `post_id` field.

```toml
[[script]]
namespace = "blog.comments"
routing = true
script = """
var counter = 1;
module.exports = function(doc) {
	doc._meta_monstache = { routing: doc.post_id };
	return doc;
}
"""
```

Now when monstache indexes document for the collection `blog.comments` it will set the special `_routing` attribute
for the document on the index request such that ElasticSearch routes comments based on their corresponding post. 

The `_meta_monstache` field is used only to inform monstache about routing and is not included in the source
document when indexing to ElasticSearch.  

Now when we are searching for comments and we know the post id that the comment belongs to we can include that post
id in the request and make a search that normally queries all shards query only 1 shard.

```
$ curl -XGET 'http://localhost:9200/blog.comments/_search?routing=123' -d '
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
document was originally routed in order to tell ElasticSearch where to look for it.

Monstache gets around this problem by using a lookup table that it stores in MongoDB at `monstache.meta`.  In this collection monstache stores
the routing information for each document with custom routing.  When a delete occurs monstache looks up the route
in this collection and forwards that information to ElasticSearch on the delete request.

For more information see [Customizing Document Routing](https://www.elastic.co/blog/customizing-your-document-routing)
