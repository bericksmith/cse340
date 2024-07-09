const pool = require("../database/");

module.exports = {
  addReview: async (inv_id, account_id, review_text, review_date) => {
    const sql = `INSERT INTO reviews (inv_id, account_id, review_text, review_date)
                 VALUES ($1, $2, $3, $4) RETURNING *`;
    const data = await pool.query(sql, [inv_id, account_id, review_text, review_date]);
    return data.rows[0];
  },
  
  getReviewsByInventoryId: async (inv_id) => {
    const sql = `
      SELECT r.*, a.account_firstname, a.account_lastname
      FROM reviews r
      JOIN account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
    `;
    const data = await pool.query(sql, [inv_id]);
    return data.rows;
  }
};
