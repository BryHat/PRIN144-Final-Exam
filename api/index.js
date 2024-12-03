const fs = require('fs')
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml')


const file  =  fs.readFileSync(process.cwd() + '/swagger.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css"
const express = require('express')
const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
	customCss:
		'.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
	customCssUrl: CSS_URL,
}));

const bodyParser = require("body-parser");
const { Pool } = require("pg");
require('dotenv').config()

const PORT = 3000;

// PostgreSQL connection setup
const pool = new Pool({
  connectionString: "postgres://default:DCw12ZImBzfx@ep-flat-hill-a4bjhxpn-pooler.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require?sslmode=require",
})

pool.connect((err) => {
  if (err) {
    console.error("Failed to connect to the database:", err.message);
  } else {
    console.log("Database connection successful!");
  }
});

// Middleware
app.use(bodyParser.json());

// Routes

// Get All Employees
app.get("/api/employees", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM employees");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Specific Employee by ID
app.get("/api/employees/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM employees WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a New Employee
app.post("  ", async (req, res) => {
  const { first_name, last_name, position, department, is_working_from_home } = req.body;

  if (!first_name || !last_name || !position || !department || is_working_from_home === undefined) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO employees (first_name, last_name, position, department, is_working_from_home) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [first_name, last_name, position, department, is_working_from_home]
    );
    res.status(201).json({ id: result.rows[0].id, message: "Employee created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an Employee
app.put("/api/employees/:id", async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, position, department, is_working_from_home } = req.body;

  if (!first_name || !last_name || !position || !department || is_working_from_home === undefined) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const result = await pool.query(
      "UPDATE employees SET first_name = $1, last_name = $2, position = $3, department = $4, is_working_from_home = $5 WHERE id = $6 RETURNING *",
      [first_name, last_name, position, department, is_working_from_home, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an Employee
app.delete("/api/employees/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM employees WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(204).send(); // No Content
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
