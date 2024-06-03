# Adding a new entity

> :warning: **Under construction**: This document is a work in progress. More detail to be added later.

Below are the basic set of files to add/edit when adding a new entity to the project.
Additional changes may be required based on the specific requirements of the entity.

- libs/models/src/lib/prm/foo.model.ts
- libs/models/src/lib/prm/entity.model.ts
- libs/models/src/lib/prm/index.ts
- libs/db/migrations/xxx.ts
- libs/db/seeds/xxx/xxx.ts
- libs/prm-engine/src/lib/prm/stores/foo.store.ts
- libs/prm-engine/src/lib/prm/stores/foo.store.integration.test.ts
- libs/prm-engine/src/lib/prm/stores/index.ts
- libs/prm-engine/src/lib/prm/services/foo.service.ts
- libs/prm-engine/src/lib/prm/services/foo.service.test.ts
- libs/prm-engine/src/lib/prm/services/index.ts
- libs/clients/src/lib/prm/foo.client.ts
- libs/clients/src/lib/prm/prm.client.test.ts
- libs/clients/src/lib/prm/index.ts
- libs/prm-components/src/lib/config/foo.ts
- libs/prm-components/src/lib/config/index.ts
