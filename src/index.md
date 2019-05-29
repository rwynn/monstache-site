# Monstache

Sync MongoDB to Elasticsearch in realtime

---

[Monstache](https://github.com/rwynn/monstache) is a sync daemon written in Go that continously 
indexes your MongoDB collections into Elasticsearch. Monstache gives you the ability to use 
Elasticsearch to do complex searches and aggregations of your MongoDB data and easily build realtime 
Kibana visualizations and dashboards.

!!! note "Latest news"

	For a showcase of what monstache can do with open data 
	see the [monstache-showcase](https://github.com/rwynn/monstache-showcase)

    If you find monstache useful check out some other projects related to MongoDB
    [mongofluxd](https://github.com/rwynn/mongofluxd)
    [redisetgo](https://github.com/rwynn/redisetgo)
    [route81](https://github.com/rwynn/route81)

## Features

- Supports up to and including the latest versions of Elasticsearch and MongoDB

- Single binary with a light footprint 

- Support for MongoDB change streams and aggregation pipelines

- Pre built Docker [containers](https://hub.docker.com/r/rwynn/monstache/tags/)

- Optionally filter the set of collections to sync

- Advanced support for sharded MongoDB clusters including auto-detection of new shards

- Direct read mode to do a full sync of collections in addition to tailing the oplog

- Transform and filter documents before indexing using Golang plugins or JavaScript

- Index the content of GridFS files

- Support for propogating hard/soft document deletes

- Support for propogating database and collection drops as index deletes

- Optional custom document routing in Elasticsearch

- Stateful resume feature

- Time machine feature to track document changes over time

- Worker and Clustering modes for High Availability

- Support for [rfc7396](https://tools.ietf.org/html/rfc7396) JSON merge patches

- Systemd support

- Optional http server to get access to liveness, stats, profiling, etc

## Next Steps

See [Getting Started](./start/) for instructions how to get
it up and running.

See [Release Notes](./about/#release-notes) for updates.

