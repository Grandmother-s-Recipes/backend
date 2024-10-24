require("dotenv").config({ path: "./.env"});

module.exports = {

        client: "postgresql",
        connection: process.env.DATABASE_URL || {
            user: process.env.POSTGRES_USER,
            database: process.env.POSTGRES_DB,
            password: process.env.POSTGRES_PW
        },
        migrations: {
            directory: "./src/db/data/migrations"
        },
        seeds: {
            directory: "./src/db/data/seeds"
        }
    }

//     production: {
//         client: "pg",
//         connection: process.env.DATABASE_URL,
//         migrations: {
//             directory: "./src/db/data/migrations"
//         },
//         seeds: {
//             directory: "./src/db/data/seeds"
//         }
//     }
// }