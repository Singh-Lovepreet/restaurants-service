const e = require('express');
const { updateLocale } = require('moment');
const sql = require('sql-template-strings');
const db = require('./db');
module.exports = {
    async create({_db,query, values }) {
      try {
             
        return await _db?_db.query(query,values): db.query(query,values);
  
      } catch (error) {
        throw new Error(error);
      }
    },
    async find({ query, values }) {
        try {
               
          const {rows} = await db.query(query,values);
    
          return rows;
        } catch (error) {
            throw new Error(error)
        }
  },
  async transaction(callback) {
      
  const client = await db.connect();
    try {
      await client.query('BEGIN')
      console.log('Transcation start....')
      try {
        await callback(client)
        await client.query('COMMIT')
        console.log('Transaction end')
      } catch (e) {
        await client.query('ROLLBACK')
        throw new Error(e);
      }
    } finally {
      client.release()
    }
  },
  async update({_db, query, values }) {
    try {
                  
      return await _db?_db.query(query,values): db.query(query,values);
      
   } catch (error) {
    
    throw new Error(error);
    }
  }
  };
   