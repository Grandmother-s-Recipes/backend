const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  await knex('granduser').del();

  const hashedPassword1 = await bcrypt.hash('password', 10);
  const hashedPassword2 = await bcrypt.hash('password', 10);
  const hashedPassword3 = await bcrypt.hash('password', 10);

  await knex('user').insert([
    {username: 'laurence', password: hashedPassword1},
    {username: 'jason', password: hashedPassword2},
    {username: 'vicente', password: hashedPassword3}
  ]);
};