// Construct a schema, using GraphQL schema language
const {AsyncNedb} = require('nedb-async');

const {buildSchema} = require("graphql");

const schema = buildSchema(`
  type Query {
    collectionNames: [String!]!
    collection(name: String!): Collection!
    inventory: [Inventory!]!
  }
  
  type Collection {
    name: String!
    inventory: [Inventory!]!
  }
  
  type Inventory {
    _id: String!
    name: String!
    collection: String
  }
  
  input InventoryInput {
    name: String
  }
  
  type CollectionMutation {
    addInventoryItem(_id: String!): Boolean!
    removeInventoryItem(_id: String!): Boolean!
  }

  type Mutation {
    createInventoryItem(item: InventoryInput!): Inventory!
    updateInventoryItem(_id: String!, item: InventoryInput!): Boolean!
    deleteInventoryItem(_id: String!): Boolean!
    mutateCollection(name: String!): CollectionMutation!
  }
`);

const db = new AsyncNedb({filename: 'db/shopifyInventory.db', autoload: true});

// The root provides a resolver function for each API endpoint
const resolvers = {
    inventory: async () => {
        return await db.asyncFind({});
    },
    createInventoryItem: async ({item}) => {
        return await db.asyncInsert(item);
    },
    updateInventoryItem: async ({_id, item}) => {
        return (await db.asyncUpdate({_id}, item)) > 0;
    },
    deleteInventoryItem: async ({_id}) => {
        return (await db.asyncRemove({_id})) > 0;
    },
    collection: ({name}) => ({
        name: name,
        inventory: db.asyncFind({collection: name}),
    }),
    collectionNames: async () => {
        return (await db.asyncFind({}, {collection: 1})).filter(o => o.collection).map(o => o.collection);
    },
    mutateCollection: ({name}) => ({
        addInventoryItem: async ({_id}) => {
            return (await db.asyncUpdate({_id}, {$set: {collection: name}})) > 0;
        },
        removeInventoryItem: async ({_id}) => {
            return (await db.asyncUpdate({_id}, {$unset: {collection: true}})) > 0;
        }
    })
};

module.exports = {schema, resolvers};