// Construct a schema, using GraphQL schema language
const {AsyncNedb} = require('nedb-async');

const {buildSchema} = require("graphql");

const schema = buildSchema(`
  """ Available query options """
  type Query {
    """ Fetch a list of all inventory items """
    inventory: [Inventory!]!

    """ Fetch a list of all collection names """
    collectionNames: [String!]!

    """ Fetch all inventory items in the given collection """
    collection(name: String!): InventoryCollection!
  }

  """ Information about the current inventory of a particular item """
  type Inventory {
    """ A globally unique identifier for every inventory item """
    _id: String!
    name: String!
    """The quantity of the item in stock"""
    quantityInStock: Float!
    """ The name of the collection that the item may or may not belong to. """
    collection: String
  }

  """ A named collection of inventory items """
  type InventoryCollection {
    name: String!
    inventory: [Inventory!]!
  }

  """Modify the items in the collection"""
  type InventoryCollectionMutation {
    """Add an item with the given ID to this collection. Returns true only if the item was absent from the collection"""
    addInventoryItem(_id: String!): Boolean!
    """Add an item with the given ID to this collection. Returns true only if the item was present in the collection"""
    removeInventoryItem(_id: String!): Boolean!
  }

  input InventoryInput {
    name: String!
    quantityInStock: Float!
    collection: String
  }

  type Mutation {
    """ Create the given inventory item """
    createInventoryItem(item: InventoryInput!): Inventory!
    """ Update the inventory item corresponding to the given ID. Returns false if the ID was not found. """
    updateInventoryItem(_id: String!, item: InventoryInput!): Boolean!
    """ Delete the inventory item corresponding to the given ID. Returns false if the ID was not found. """
    deleteInventoryItem(_id: String!): Boolean!
    """ Mutate the collection corresponding to the given name """
    inventoryCollection(name: String!): InventoryCollectionMutation!
  }
`);

const db = new AsyncNedb({filename: 'db/shopifyInventory.db', autoload: true});

// The root provides a resolver function for each API endpoint
const resolvers = {
    inventory: async () => await db.asyncFind({}),
    createInventoryItem: async ({item}) => await db.asyncInsert(item), // This is secure because GraphQL sanitizes input
    updateInventoryItem: async ({_id, item}) => (await db.asyncUpdate({_id}, item)) > 0,
    deleteInventoryItem: async ({_id}) => (await db.asyncRemove({_id})) > 0,
    collection: ({name}) => ({name, inventory: db.asyncFind({collection: name}),}),
    collectionNames: async () =>
        (await db.asyncFind({}, {collection: 1}))
            .filter(o => o.collection)
            .map(o => o.collection),
    inventoryCollection: ({name}) => ({
        addInventoryItem: async ({_id}) => (await db.asyncUpdate({_id}, {$set: {collection: name}})) > 0,
        removeInventoryItem: async ({_id}) => (await db.asyncUpdate({_id}, {$unset: {collection: true}})) > 0
    })
};

module.exports = {schema, resolvers};
