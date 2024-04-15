const express = require("express")
const { open } = require("sqlite")
const sqlite3 = require("sqlite3")
const path = require("path")
const { v4: uuidV4 } = require("uuid")
const cors = require("cors")

const products = require("./products.js")


const app = express()

app.use(express.json())

app.use(cors({
    origin: "*",
    methods: ["GET", "PUT", "POST", "DELETE"]
}))


const PORT = process.env.PORT || 3001

const dbPath = path.join(__dirname, "tinn_trim.db")

let db = null

const create_nessessary_tables = async () => {
    console.log('Creating nessessary tables if not exists');

    await db.run(`
        CREATE TABLE IF NOT EXISTS product (
            id TEXT PRIMARY KEY NOT NULL,
            img_url TEXT,
            name TEXT,
            curr_price INT,
            mrp INT,
            category TEXT
        );
    `)

    await db.run(`DELETE FROM product`)

    const promises = products.map(async each => {
        const { id, name, img_url, curr_price, mrp, category } = each

        const query = `
        INSERT INTO product 
        (id, img_url, name, curr_price, mrp, category)
        VALUES
        (?, ?, ?, ?, ?, ?)
        `

        return await db.run(query, [uuidV4(), img_url, name, curr_price, mrp, category])
    })

    await Promise.all(promises)
}

const initializeDBAndStartServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })

        // await create_nessessary_tables()
        app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`))
    }
    catch (err) {
        console.log(err.message)
        process.exit(1)
    }
}

initializeDBAndStartServer()


app.get("/products", async (req, res) => {
    const dbResponse = await db.all("select * from product")
    res.send(dbResponse)
})