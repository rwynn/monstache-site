---
title: Namespaces
weight: 21
---

When a document is inserted, updated, or deleted in mongodb a document is appended to the oplog representing the event.  This document has a field `ns` which is the namespace.  For inserts, updates, and deletes the namespace is the database name and collection name of the document changed joined by a dot. E.g. for `use test; db.foo.insert({hello: "world"});` the namespace for the event in the oplog would be `test.foo`.

In addition to inserts, updates, and deletes monstache also supports database and collection drops.  When a database or collection is dropped in mongodb an event is appended to the oplog.  Like the other types of changes this event has a field `ns` representing the namespace.  However, for drops the namespace is the database name and the string `$cmd` joined by a dot.  E.g. for `use test; db.foo.drop()` the namespace for the event in the oplog would be `test.$cmd`.  

When configuring namespaces in monstache you will need to account for both cases.  Specifically, be careful if you have configured `dropped-databases|dropped-collections=true` AND you also have a `namespace-regex` set.  If your namespace regex does not take into account the `db.$cmd` namespace the event may be filtered and the elasticsearch index not deleted on a drop.


