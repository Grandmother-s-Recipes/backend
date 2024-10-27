exports.seed = async function(knex) {
  await knex('favorite').del();

  await knex('favorite').insert([
    { user_id: 1, recipe_id: 'Pizza Via Veneto', region: 'VENETO' },
    { user_id: 2, recipe_id: 'Piedmontese Peppers', region: 'PIEDMONT' }
  ]);
};


