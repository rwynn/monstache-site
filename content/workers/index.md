---
title: Workers
weight: 60
---

You can run multiple monstache processes and distribute the work between them.  First configure
the names of all the workers in a shared config.toml file.

```toml
workers = ["Tom", "Dick", "Harry"]
```

In this case we have 3 workers.  Now we can start 3 monstache processes and give each one of the worker
names.

	monstache -f config.toml -worker Tom
	monstache -f config.toml -worker Dick
	monstache -f config.toml -worker Harry

monstache will hash the id of each document using consistent hashing so that each id is handled by only
one of the available workers.

---
