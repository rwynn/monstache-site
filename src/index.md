# Monstache

Sync MongoDB to Elasticsearch in realtime

---

[Monstache](https://github.com/rwynn/monstache) is a sync daemon written in Go that continously 
indexes your MongoDB collections into Elasticsearch. Monstache gives you the ability to use 
Elasticsearch to do complex searches and aggregations of your MongoDB data and easily build realtime 
Kibana visualizations and dashboards.

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

- Support for propogating hard/soft deletes

- Support for propogating database and collection drops

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

