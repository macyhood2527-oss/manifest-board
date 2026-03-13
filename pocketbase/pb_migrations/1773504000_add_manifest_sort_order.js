/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("manifests")

  collection.fields.add(
    new NumberField({
      name: "sortOrder",
      onlyInt: true,
    }),
  )

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("manifests")

  collection.fields.removeByName("sortOrder")

  return app.save(collection)
})
