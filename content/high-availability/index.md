---
title: High Availability
weight: 70
---


You can run monstache in high availability mode by starting multiple processes with the same value for `cluster-name`.
Each process will join a cluster which works together to ensure that a monstache process is always syncing to Elasticsearch.

High availability works by ensuring a active process in the `monstache.cluster` collection in mongodb. Only the processes in
this collection will be syncing for the cluster.  Processes not present in this collection will be paused.  Documents in the 
`monstache.cluster` collection have a TTL assigned to them.  When a document in this collection times out it will be removed from
the collection by mongodb and another process in the cluster will then have a chance to write to the collection and become the
new active process.

When `cluster-name` is supplied the `resume` feature is automatically turned on and the `resume-name` becomes the name of the cluster.
This is to ensure that each of the processes is able to pick up syncing where the last one left off.  

You can combine the HA feature with the workers feature.  For 3 cluster nodes with 3 workers per node you would have something like the following:

	// config.toml
	workers = ["Tom", "Dick", "Harry"]
	
	// on host A
	monstache -cluster-name HA -worker Tom -f config.toml
	monstache -cluster-name HA -worker Dick -f config.toml
	monstache -cluster-name HA -worker Harry -f config.toml

	// on host B
	monstache -cluster-name HA -worker Tom -f config.toml
	monstache -cluster-name HA -worker Dick -f config.toml
	monstache -cluster-name HA -worker Harry -f config.toml

	// on host C
	monstache -cluster-name HA -worker Tom -f config.toml
	monstache -cluster-name HA -worker Dick -f config.toml
	monstache -cluster-name HA -worker Harry -f config.toml

When the clustering feature is combined with workers then the `resume` name becomes the cluster name concatenated with the worker name.

---
