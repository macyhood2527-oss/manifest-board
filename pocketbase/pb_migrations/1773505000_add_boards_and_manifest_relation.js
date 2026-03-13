/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const boards = new Collection({
    createRule: "",
    deleteRule: "",
    fields: [
      {
        autogeneratePattern: "[a-z0-9]{15}",
        hidden: false,
        id: "text3208210256",
        max: 15,
        min: 15,
        name: "id",
        pattern: "^[a-z0-9]+$",
        presentable: false,
        primaryKey: true,
        required: true,
        system: true,
        type: "text",
      },
      {
        hidden: false,
        id: "autodate2990389176",
        name: "created",
        onCreate: true,
        onUpdate: false,
        presentable: false,
        system: false,
        type: "autodate",
      },
      {
        hidden: false,
        id: "autodate3332085495",
        name: "updated",
        onCreate: true,
        onUpdate: true,
        presentable: false,
        system: false,
        type: "autodate",
      },
    ],
    id: "pbc_731255402",
    indexes: [],
    listRule: "",
    name: "boards",
    system: false,
    type: "base",
    updateRule: "",
    viewRule: "",
  })

  app.save(boards)

  boards.fields.add(
    new TextField({
      name: "name",
      required: true,
      max: 120,
    }),
    new TextField({
      name: "description",
      max: 500,
    }),
    new FileField({
      name: "coverImage",
      maxSelect: 1,
      maxSize: 5242880,
      mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      thumbs: [],
      protected: false,
    }),
    new TextField({
      name: "theme",
      max: 80,
    }),
    new NumberField({
      name: "sortOrder",
      onlyInt: true,
    }),
  )

  app.save(boards)

  const manifests = app.findCollectionByNameOrId("manifests")
  manifests.fields.add(
    new RelationField({
      name: "board",
      collectionId: boards.id,
      maxSelect: 1,
    }),
  )

  return app.save(manifests)
}, (app) => {
  const manifests = app.findCollectionByNameOrId("manifests")
  manifests.fields.removeByName("board")
  app.save(manifests)

  const boards = app.findCollectionByNameOrId("boards")
  return app.delete(boards)
})
