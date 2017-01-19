---
title: Index Mapping
weight: 30
---

When indexing documents from mongodb into elasticsearch the mapping is as follows:

```txt
mongodb database name . mongodb collection name -> elasticsearch index name
mongodb collection name -> elasticsearch type
mongodb document _id -> elasticsearch document _id
```

If these default won't work for some reason you can override the index and collection mapping on a per collection basis by adding
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

With the configuration above documents in the `test.test` namespace in mongodb are indexed into the `index1` 
index in elasticsearch with the `type1` type.

Make sure that automatic index creation is not disabled in elasticsearch.yml.

If automatic index creation must be controlled, whitelist any indexes in elasticsearch.yml that monstache will create.

Note that when monstache maps index and type names for ElasticSearch it does normalization based on the 
[Validity Rules](https://github.com/elastic/elasticsearch/issues/6736).  This includes making sure index names are
all lowercase and that index, types, and ids do not being with an underscore.

---
