const express = require("express");

const db = require("../data/dbConfig.js");

const server = express();

server.use(express.json());

server.get('/api/accounts', ({query: {limit, sortby, sortdir='desc'}}, res) => {
  let query = db.select('*')
    .from('accounts');

  if (limit !== undefined) {
    limit = Number(limit);
    if (isNaN(limit)) return res.status(400).json({message: 'Limit must be a valid integer'});
    query = query.limit(limit);
  }

  if (!['asc', 'desc'].includes(sortdir.toLowerCase()))
    return res.status(400).json({message: 'sortdir must be asc or desc'});

  if (sortby !== undefined) query = query.orderBy(sortby, sortdir);

  query.then(accounts => res.status(200).json(accounts))
    .catch(() => res.status(500).json({message: 'Failed to get accounts information.'}))
});

server.post('/api/accounts', ({body: {name, budget}}, res) =>
  db.insert({name, budget})
    .into('accounts')
    .then(([id]) =>
      db('accounts')
        .select('*')
        .where({id})
        .first()
        .then(account => res.status(201).json(account))
    )
    .catch(() => res.status(500).json({message: 'Error creating account'}))
);

server.get('/api/accounts/:id', ({params: {id}}, res) =>
  db('accounts')
    .select('*')
    .where({id})
    .first()
    .then(account => {
      if (!account) return res.status(404).json({message: 'Account not found'});

      return res.status(200).json(account);
    })
    .catch(() => res.status(500).json({message: 'Error getting account information'}))
);

server.delete('/api/accounts/:id', ({params: {id}}, res) =>
  db('accounts')
    .where({id})
    .del()
    .then(count => {
      if (count === 0) return res.status(404).json({message: 'Account not found'});

      res.status(200).json({message: 'Account deleted'});
    })
    .catch(() => res.status(500).json({message: 'Error deleting account'}))
);

server.put('/api/accounts/:id', ({params: {id}, body: {name, budget}}, res) =>
  db('accounts')
    .where({id})
    .update({name, budget})
    .then(() =>
      db('accounts')
        .select('*')
        .where({id})
        .first()
        .then(account => res.status(200).json(account))
    )
    .catch(() => res.status(500).json({message: 'Error creating account'}))
);

module.exports = server;
