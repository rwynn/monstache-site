---
title: Indexing GridFS Files
weight: 50
---

Monstache supports indexing the raw content of files stored in GridFS into elasticsearch for full
text search.  This feature requires that you install an elasticsearch plugin which enables the field type `attachment`.
For versions of elasticsearch prior to version 5 you should install the 
[mapper-attachments](https://www.elastic.co/guide/en/elasticsearch/plugins/2.3/mapper-attachments.html) plugin.
For version 5 or later of elasticsearch you should instead install the 
[ingest-attachment](https://www.elastic.co/guide/en/elasticsearch/plugins/master/ingest-attachment.html) plugin.

Once you have installed the appropriate plugin for elasticsearch, getting file content from GridFS into elasticsearch is
as simple as configuring monstache.  You will want to enable the `index-files` option and also tell monstache the 
namespace of all collections which will hold GridFS files. For example in your TOML config file,

```toml
index-files = true

file-namespaces = ["users.fs.files", "posts.fs.files"]

file-highlighting = true
```

The above configuration tells monstache that you wish to index the raw content of GridFS files in the `users` and `posts`
mongodb databases. By default, mongodb uses a bucket named `fs`, so if you just use the defaults your collection name will
be `fs.files`.  However, if you have customized the bucket name, then your file collection would be something like `mybucket.files`
and the entire namespace would be `users.mybucket.files`.

When you configure monstache this way it will perform an additional operation at startup to ensure the destination indexes in
elasticsearch have a field named `file` with a type mapping of `attachment`.  

For the example TOML configuration above, monstache would initialize 2 indices in preparation for indexing into
elasticsearch by issuing the following REST commands:

For elasticsearch versions prior to version 5...

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

For elasticsearch version 5 and above...

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

When a file is inserted into mongodb via GridFS, monstache will detect the new file, use the mongodb api to retrieve the raw
content, and index a document into elasticsearch with the raw content stored in a `file` field as a base64 
encoded string. The elasticsearch plugin will then extract text content from the raw content using 
[Apache Tika](https://tika.apache.org/), tokenize the text content, and allow you to query on the content of the file.

To test this feature of monstache you can simply use the [mongofiles](https://docs.mongodb.com/manual/reference/program/mongofiles/)
command to quickly add a file to mongodb via GridFS.  Continuing the example above one could issue the following command to put a 
file named `resume.docx` into GridFS and after a short time this file should be searchable in elasticsearch in the index `users.fs.files`.

	mongofiles -d users put resume.docx

After a short time you should be able to query the contents of resume.docx in the users index in elasticsearch

	curl -XGET 'http://localhost:9200/users.fs.files/_search?q=golang'

If you would like to see the text extracted by Apache Tika you can project the appropriate sub-field

For elasticsearch versions prior to version 5...

	curl localhost:9200/users.fs.files/_search?pretty -d '{
		"fields": [ "file.content" ],
		"query": {
			"match": {
				"_all": "golang"
			}
		}
	}'

For elasticsearch version 5 and above...

	curl localhost:9200/users.fs.files/_search?pretty -d '{
		"_source": [ "attachment.content" ],
		"query": {
			"match": {
				"_all": "golang"
			}
		}
	}'

When `file-highlighting` is enabled you can add a highlight clause to your query

For elasticsearch versions prior to version 5...

	curl localhost:9200/users.fs.files/_search?pretty -d '{
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

For elasticsearch version 5 and above...

	curl localhost:9200/users.fs.files/_search?pretty -d '{
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

For elasticsearch versions prior to version 5...

	"hits" : [ {
		"highlight" : {
			"file.content" : [ "I like to program in <em>golang</em>.\n\n" ]
		}
	} ]

For elasticsearch version 5 and above...

	"hits" : [{
		"highlight" : {
			"attachment.content" : [ "I like to program in <em>golang</em>." ]
		}
	}]


---
