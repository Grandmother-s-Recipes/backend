const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // Cancella i dati esistenti
  await knex('users').del();

  // Hash delle password
  const hashedPassword1 = await bcrypt.hash('password123', 10);
  const hashedPassword2 = await bcrypt.hash('password456', 10);

  // Inserisci gli utenti
  await knex('users').insert([
    { username: 'Jackson', password: hashedPassword1},
    { username: 'Daniel', password: hashedPassword2}
  ]);
};

