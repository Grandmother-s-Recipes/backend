/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('favorite').del()
  await knex('favorite').insert([
    {recipe_id: '1', user_id: '1'},
  ]);
};
