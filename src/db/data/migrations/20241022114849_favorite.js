/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("favorite", (table) => {
        table.increments('id').primary();
        table.string('recipe_id');
        table.string('region').notNullable();
        table.integer('user_id')
            .unsigned()
            .references('id')
            .inTable('granduser')
            .onDelete('CASCADE'); // foreign key
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("favorite");
};
