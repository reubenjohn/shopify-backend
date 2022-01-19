# shopify-backend

## Setup

1. Open a terminal/command prompt and clone this repository:  
   `git clone https://github.com/reubenjohn/shopify-backend.git`
2. Install node.js (tested on node **v14** and **v17**, should work on others too)  
   [How to install nodejs](https://nodejs.dev/learn/how-to-install-nodejs)
3. Change directory to the project directory:  
   `cd shopify-backend`
4. Install dependencies using the node package manager (npm):  
   `npm install`
5. Launch the application:  
   `npm run start`

## Usage
The application comes with the industry standard GraphiQL web page that you can access at:  
http://localhost:4000/graphql

![GraphiQL](screenshots/graphiql-docs.png)

**Steps:**
1. We've provided some sample queries you can execute below. We recommend executing them in order.
2. Simply paste them into the left side text box one at a time and click the play button (or Ctrl+Enter) to execute the query.
3. You will 

**Sample queries:**

    # Initially the inventory list is empty:
    { inventory { _id } }

    # Let's start by creating 3 inventories
    mutation {
      nike1: createInventoryItem(item: { name: "Nike" quantityInStock: 10 }) { _id }
      reebok1: createInventoryItem(item: { name: "Reebok" quantityInStock: 5 }) { _id }
      adidas1: createInventoryItem(item: { name: "Adidas" quantityInStock: 15 }) { _id }
    }

    # We now see that the inventory list has the 3 new entries
    { inventory { _id, name, quantityInStock} }
    
    # Let's decrease the stock of adidas by 1.
    # DON'T FORGET TO UPDATE THE _id to match your adidas's inventory _id
    mutation { updateInventoryItem(_id: "eaOvVlSYQBXAftnz", item: { name: "Adidas" quantityInStock: 14 } ) }
    
    # The stock for adidas should now be 14.
    { inventory { name, quantityInStock } }
    
    # Delete adidas from the inventory list
    # DON'T FORGET TO UPDATE THE _id to match your adidas's inventory _id
    mutation { deleteInventoryItem(_id: "eaOvVlSYQBXAftnz") }

    # The inventory list should no longer contain adidas
    { inventory { name } }
    
    # Let's create a collection called "sale" and add nike to it
    # DON'T FORGET TO UPDATE THE _id to match your nike's inventory _id
    mutation { inventoryCollection(name: "sale") { addInventoryItem(_id: "FDssWTopU0pk5jl6") } }
    
    # We now see that there is 1 collection called "sale"
    { collectionNames }
    
    # Let's query the names of all items in the "sale" collection
    { collection(name:"sale") { name inventory { name } } }
    
    # Remove nike from the "sale" collection
    # DON'T FORGET TO UPDATE THE _id to match your nike's inventory _id
    mutation { inventoryCollection(name: "sale") { removeInventoryItem(_id: "FDssWTopU0pk5jl6") } }
    
    # The "sale" collection got automatically deleted. Querying the "sale" shows that it's empty.
    { collectionNames collection(name:"sale") { name inventory { name } } }
