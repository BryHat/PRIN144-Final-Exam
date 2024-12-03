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
app.get("/employees", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM employees");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Specific Employee by ID
app.get("/employees/:id", async (req, res) => {
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
app.post("/employees", async (req, res) => {
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
app.put("/employees/:id", async (req, res) => {
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
app.delete("/employees/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM employees WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(204).send('Good'); // No Content
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PRIN144-Final-Exam</title>
          <style>
              body {
                  margin: 0;
                  padding: 0;
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background: linear-gradient(45deg, #141e30, #243b55);
                  color: #fff;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  overflow: hidden;
              }
              .container {
                  text-align: center;
                  background: #fff;
                  color: #333;
                  padding: 2rem;
                  border-radius: 15px;
                  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
                  max-width: 500px;
                  width: 90%;
                  position: relative;
                  border: 6px solid transparent;
                  animation: glowing 2s infinite;
              }
              h1 {
                  margin: 0;
                  font-size: 1.8rem;
                  font-weight: bold;
              }
              p {
                  margin-top: 0.5rem;
                  font-size: 1rem;
                  color: #555;
              }
              @keyframes glowing {
                  0% {
                      border-color: #ff4d4d;
                      box-shadow: 0 0 10px #ff4d4d, 0 0 20px #ff4d4d, 0 0 30px #ff4d4d;
                  }
                  25% {
                      border-color: #4d94ff;
                      box-shadow: 0 0 10px #4d94ff, 0 0 20px #4d94ff, 0 0 30px #4d94ff;
                  }
                  50% {
                      border-color: #47ff4d;
                      box-shadow: 0 0 10px #47ff4d, 0 0 20px #47ff4d, 0 0 30px #47ff4d;
                  }
                  75% {
                      border-color: #ffa64d;
                      box-shadow: 0 0 10px #ffa64d, 0 0 20px #ffa64d, 0 0 30px #ffa64d;
                  }
                  100% {
                      border-color: #ff4d4d;
                      box-shadow: 0 0 10px #ff4d4d, 0 0 20px #ff4d4d, 0 0 30px #ff4d4d;
                  }
              }
              @media (max-width: 768px) {
                  h1 {
                      font-size: 1.5rem;
                  }
                  p {
                      font-size: 0.9rem;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>PRIN144-Final-Exam</h1>
              <p>Created by Bryan Dela Cruz</p>
          </div>
      </body>
      </html>
  `;
  res.send(html);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
