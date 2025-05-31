import express from "express";
import { Request, Response } from "express";
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { Criteria } from "./entity/Criteria";
import { Formula } from "./entity/Formula";
import { Attribute } from "./entity/Attribute";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded());

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log("Database connection initialized");

    // Start the server after database is initialized
    app.listen(PORT, () => console.log("Server running on port 3001"));
  })
  .catch((error) =>
    console.log("Error during database initialization:", error),
  );

// GET /table: Retrieve table data
app.get("/table", async (req: Request, res: Response) => {
  const criteriaRepository = AppDataSource.getRepository(Criteria);
  const formulaRepository = AppDataSource.getRepository(Formula);

  const columns = await criteriaRepository.find();
  const rows = await formulaRepository.find({ relations: ["attributes"] });

  const table = {
    columns: columns.map((c: Criteria) => c.name),
    rows: rows.map((row: Formula) => ({
      name: row.name,
      annotation: row.annotation,
      attributes: Object.fromEntries(
        row.attributes.map((attr: Attribute) => [
          columns.find((c: Criteria) => c.id === attr.criteria_id)?.name,
          attr.value,
        ]),
      ),
    })),
  };
  res.json(table);
});

// POST /add_column: Add a new column
app.post("/column", async (req: Request, res: Response) => {
  const { column_name } = req.body;
  if (!column_name)
    return res.status(400).json({ error: "Criteria name required" });

  const criteriaRepository = AppDataSource.getRepository(Criteria);
  const formulaRepository = AppDataSource.getRepository(Formula);
  const attributeRepository = AppDataSource.getRepository(Attribute);

  const column = new Criteria();
  column.name = column_name;
  await criteriaRepository.save(column);

  const rows = await formulaRepository.find();
  for (const row of rows) {
    const attr = new Attribute();
    attr.formula_id = row.id;
    attr.criteria_id = column.id;
    attr.value = "NA";
    await attributeRepository.save(attr);
  }
  res.json({ message: "Criteria added" });
});

// POST /add_row: Add a new row
app.post("/add_row", async (req: Request, res: Response) => {
  const { name, annotation } = req.body;
  if (!name) return res.status(400).json({ error: "Formula name required" });

  const criteriaRepository = AppDataSource.getRepository(Criteria);
  const formulaRepository = AppDataSource.getRepository(Formula);
  const attributeRepository = AppDataSource.getRepository(Attribute);

  const row = new Formula();
  row.name = name;
  row.annotation = annotation || "";
  await formulaRepository.save(row);

  const columns = await criteriaRepository.find();
  for (const col of columns) {
    const attr = new Attribute();
    attr.formula_id = row.id;
    attr.criteria_id = col.id;
    attr.value = "NA";
    await attributeRepository.save(attr);
  }
  res.json({ message: "Formula added" });
});

// PUT /update_cell: Update a cell value
app.put("/cell", async (req: Request, res: Response) => {
  const { row_id, column_name, value } = req.body;

  const criteriaRepository = AppDataSource.getRepository(Criteria);
  const formulaRepository = AppDataSource.getRepository(Formula);
  const attributeRepository = AppDataSource.getRepository(Attribute);

  const row = await formulaRepository.findOne({ where: { name: row_id } });
  const column = await criteriaRepository.findOne({
    where: { name: column_name },
  });

  if (!row || !column)
    return res.status(404).json({ error: "Formula or column not found" });

  const attr = await attributeRepository.findOne({
    where: { formula_id: row.id, criteria_id: column.id },
  });

  if (attr) {
    attr.value = value;
    await attributeRepository.save(attr);
    res.json({ message: "Cell updated" });
  } else {
    // Create new attribute if it doesn't exist
    const newAttr = new Attribute();
    newAttr.formula_id = row.id;
    newAttr.criteria_id = column.id;
    newAttr.value = value;
    await attributeRepository.save(newAttr);
    res.json({ message: "Cell created and updated" });
  }
});
