/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("manifests")

  collection.fields.add(
    new TextField({
      name: "title",
      required: true,
      max: 200,
    }),
    new FileField({
      name: "image",
      maxSelect: 1,
      maxSize: 5242880,
      mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      thumbs: [],
      protected: false,
    }),
    new TextField({
      name: "notes",
      max: 5000,
    }),
    new TextField({
      name: "category",
      max: 100,
    }),
    new SelectField({
      name: "status",
      required: true,
      maxSelect: 1,
      values: ["dreaming", "planning", "inspiration", "achieved"],
    }),
    new DateField({
      name: "achievedAt",
    }),
  )

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("manifests")

  collection.fields.removeByName("title")
  collection.fields.removeByName("image")
  collection.fields.removeByName("notes")
  collection.fields.removeByName("category")
  collection.fields.removeByName("status")
  collection.fields.removeByName("achievedAt")

  return app.save(collection)
})
