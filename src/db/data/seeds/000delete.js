exports.seed = async function(knex) {
    await knex('favorite').del();
    await knex('granduser').del();
  };
  