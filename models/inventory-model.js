const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
* Function to get inventory item by ID
* ************************** */
async function getInventoryItemById(invId) {
  try {
    const query = "SELECT * FROM public.inventory WHERE inv_id = $1";
    const result = await pool.query(query, [invId]);
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching inventory item by ID:", error);
    throw error;
  }
}

/* ***************************
* add a new classification to the database
* ************************** */
async function addClassification(classification_name) {
  try {
    const query = "INSERT INTO classification (classification_name) VALUES ($1)";
    await pool.query(query, [classification_name]);
  } catch (error) {
    console.error("Error adding classification:", error);
    throw error;
  }
}

/* ***************************
* add new inventory to the database
* ************************** */
async function addInventory(classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color) {
  try {
    const query = 'INSERT INTO inventory (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
    await pool.query(query, [classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color]);
  } catch (error) {
    console.error("Error adding vehicle:", error);
    throw error;
  }
};


module.exports = {
  getInventoryItemById: async (inv_id) => {
    const sql = `SELECT * FROM inventory WHERE inv_id = $1`;
    const data = await pool.query(sql, [inv_id]);
    return data.rows[0];
  },
};

/* ***************************
* Function to delete inventory item
* ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1';
    const data = await pool.query(sql, [inv_id]);
    return data;
  } catch (error) {
    throw new Error("Delete Inventory Error");
  }
}


module.exports = {getClassifications, getInventoryByClassificationId, getInventoryItemById, addClassification, addInventory, deleteInventoryItem,};

