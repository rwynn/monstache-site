---
title: Monstache
type: index
weight: 1
---

## Sync MongoDB to ElasticSearch in near realtime

Monstache is a sync daemon written in Go that keeps your MongoDB collections synchronized with your
ElasticSearch indices.  


## Quick start

Install with go get:

```sh
go get -v github.com/rwynn/monstache
```

## Features

- Select only the collections you want to sync

- Transform and filter documents before indexing using JavaScript

- Index the content of GridFS files

- Support for database and collection drops

- Stateful resume feature

- Worker and Clustering modes for High Availability

- Single binary with a light footprint 

See the [Getting started guide]({{< relref "getting-started/index.md" >}}) for instructions how to get
it up and running.

---
