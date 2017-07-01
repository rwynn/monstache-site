---
title: Monstache
type: index
weight: 1
---

## Sync MongoDB to ElasticSearch in near realtime

Monstache is a sync daemon written in Go that continously indexes your MongoDB collections into
Elasticsearch. Monstache gives you the ability to do complex searches and aggregations of your MongoDB data
and easily build realtime Kibana visualizations and dashboards.

## Quick start

[Download](https://github.com/rwynn/monstache/releases) or Install with go get:

```sh
go get -v github.com/rwynn/monstache
```

## Features

- Optionally filter the set of collections you want to sync

- Direct read mode to do a full sync of collections in addition to tailing the oplog

- Transform and filter documents before indexing using Golang plugins or JavaScript

- Index the content of GridFS files

- Support for hard and soft deletes in MongoDB

- Support for propogating database and collection drops

- Optional custom document routing in ElasticSearch

- Stateful resume feature

- Worker and Clustering modes for High Availability

- Support for [rfc7396](https://tools.ietf.org/html/rfc7396) JSON merge patches

- Single binary with a light footprint 

See the [Getting started guide]({{< relref "getting-started/index.md" >}}) for instructions how to get
it up and running.

---
