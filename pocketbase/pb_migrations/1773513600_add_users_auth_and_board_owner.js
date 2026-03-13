/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  let users

  try {
    users = app.findCollectionByNameOrId("users")
  } catch {
    users = new Collection("auth", "users")
  }

  users.name = "users"
  users.listRule = "id = @request.auth.id"
  users.viewRule = "id = @request.auth.id"
  users.createRule = ""
  users.updateRule = "id = @request.auth.id"
  users.deleteRule = "id = @request.auth.id"
  users.authRule = ""
  users.manageRule = "id = @request.auth.id"

  if (!users.fields.getByName("name")) {
    users.fields.add(
      new TextField({
        name: "name",
        max: 120,
      }),
    )
  }

  app.save(users)

  const boards = app.findCollectionByNameOrId("boards")

  if (!boards.fields.getByName("owner")) {
    boards.fields.add(
      new RelationField({
        name: "owner",
        collectionId: users.id,
        maxSelect: 1,
        required: true,
      }),
    )
  }

  boards.listRule = "owner = @request.auth.id"
  boards.viewRule = "owner = @request.auth.id"
  boards.createRule = "@request.auth.id != \"\" && owner = @request.auth.id"
  boards.updateRule = "owner = @request.auth.id"
  boards.deleteRule = "owner = @request.auth.id"

  app.save(boards)

  const manifests = app.findCollectionByNameOrId("manifests")
  manifests.listRule = "@request.auth.id != \"\" && board.owner = @request.auth.id"
  manifests.viewRule = "@request.auth.id != \"\" && board.owner = @request.auth.id"
  manifests.createRule = "@request.auth.id != \"\" && board.owner = @request.auth.id"
  manifests.updateRule = "@request.auth.id != \"\" && board.owner = @request.auth.id"
  manifests.deleteRule = "@request.auth.id != \"\" && board.owner = @request.auth.id"

  return app.save(manifests)
}, (app) => {
  const manifests = app.findCollectionByNameOrId("manifests")
  manifests.listRule = ""
  manifests.viewRule = ""
  manifests.createRule = ""
  manifests.updateRule = ""
  manifests.deleteRule = ""
  app.save(manifests)

  const boards = app.findCollectionByNameOrId("boards")
  boards.fields.removeByName("owner")
  boards.listRule = ""
  boards.viewRule = ""
  boards.createRule = ""
  boards.updateRule = ""
  boards.deleteRule = ""
  app.save(boards)

  try {
    const users = app.findCollectionByNameOrId("users")
    return app.delete(users)
  } catch {
    return null
  }
})
