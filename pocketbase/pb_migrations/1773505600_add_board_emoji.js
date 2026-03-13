/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const boards = app.findCollectionByNameOrId("boards")

  boards.fields.add(
    new TextField({
      name: "emoji",
      max: 8,
    }),
  )

  return app.save(boards)
}, (app) => {
  const boards = app.findCollectionByNameOrId("boards")

  boards.fields.removeByName("emoji")

  return app.save(boards)
})
