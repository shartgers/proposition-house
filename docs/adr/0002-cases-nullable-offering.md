# Cases have a nullable Offering FK — deletion orphans rather than cascades

A Case's link to an Offering is nullable. Deleting an Offering orphans its Cases rather than deleting them or blocking the deletion. This is intentional: allocating the 99 seeded Cases to Offerings is a primary workflow, so Cases exist independently of any Offering. Cascading deletes would silently destroy accumulated evidence; blocking deletion would make Offering management unnecessarily rigid.
