exports.seed = async function(knex) {
  await knex('favorite').del();

  await knex('favorite').insert([
    { user_id: 1, recipe_id: 'spaghetti_bolognese', region: 'Emilia-Romagna' },
    { user_id: 2, recipe_id: 'carbonara', region: 'Lazio' }
  ]);
};


