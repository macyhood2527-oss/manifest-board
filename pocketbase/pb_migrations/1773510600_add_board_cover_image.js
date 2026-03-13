/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const boards = app.findCollectionByNameOrId("boards")

  boards.fields.add(
    new FileField({
      name: "coverImage",
      maxSelect: 1,
      maxSize: 5242880,
      mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
      thumbs: ["480x320"],
    }),
  )

  return app.save(boards)
}, (app) => {
  const boards = app.findCollectionByNameOrId("boards")

  boards.fields.removeByName("coverImage")

  return app.save(boards)
})
