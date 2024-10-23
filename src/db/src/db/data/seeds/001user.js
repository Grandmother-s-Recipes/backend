const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  await knex('user').del();

  const hashedPassword1 = await bcrypt.hash('password123', 10);
  const hashedPassword2 = await bcrypt.hash('password456', 10);

  await knex('user').insert([
    { username: 'Jackson', password: hashedPassword1},
    { username: 'Daniel', password: hashedPassword2}
  ]);
};