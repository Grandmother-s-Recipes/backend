/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("granduser", (table) => {
        table.increments('id').primary();
        table.string('username').unique().notNullable();
        table.string('password', 60).notNullable(); // length of 60 should be suitable for bcrypt
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("granduser");
};
