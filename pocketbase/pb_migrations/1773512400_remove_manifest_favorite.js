/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const manifests = app.findCollectionByNameOrId("manifests")

  manifests.fields.removeByName("favorite")

  return app.save(manifests)
}, (app) => {
  const manifests = app.findCollectionByNameOrId("manifests")

  manifests.fields.add(
    new BoolField({
      name: "favorite",
      required: false,
    }),
  )

  return app.save(manifests)
})
