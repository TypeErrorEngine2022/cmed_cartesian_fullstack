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

// POST /column: Add a new column
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

// POST /row: Add a new row
app.post("/row", async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Formula name required" });

  const criteriaRepository = AppDataSource.getRepository(Criteria);
  const formulaRepository = AppDataSource.getRepository(Formula);
  const attributeRepository = AppDataSource.getRepository(Attribute);

  const row = new Formula();
  row.name = name;
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

// PUT /cell: Update a cell value
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

// PUT /annotation: Update a row's annotation
app.put("/annotation", async (req: Request, res: Response) => {
  const { row_id, annotation } = req.body;

  const formulaRepository = AppDataSource.getRepository(Formula);

  const row = await formulaRepository.findOne({ where: { name: row_id } });

  if (!row) return res.status(404).json({ error: "Row not found" });

  row.annotation = annotation;
  await formulaRepository.save(row);

  res.json({ message: "Annotation updated" });
});

// DELETE /column: Delete a column and its associated attributes
app.delete("/column/:column_name", async (req: Request, res: Response) => {
  const { column_name } = req.params;

  const criteriaRepository = AppDataSource.getRepository(Criteria);
  const attributeRepository = AppDataSource.getRepository(Attribute);

  // Find the column (criteria)
  const column = await criteriaRepository.findOne({
    where: { name: column_name },
  });

  if (!column) {
    return res.status(404).json({ error: "Column not found" });
  }

  try {
    // First, delete all attributes associated with this column
    await attributeRepository.delete({ criteria_id: column.id });

    // Then delete the column itself
    await criteriaRepository.remove(column);

    res.json({ message: "Column deleted successfully" });
  } catch (error) {
    console.error("Error deleting column:", error);
    res.status(500).json({ error: "Failed to delete column" });
  }
});

// Export table data
app.get("/export", async (req: Request, res: Response) => {
  try {
    const criteriaRepository = AppDataSource.getRepository(Criteria);
    const formulaRepository = AppDataSource.getRepository(Formula);

    const columns = await criteriaRepository.find();
    const rows = await formulaRepository.find({ relations: ["attributes"] });

    const tableData = {
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

    res.json({
      data: tableData,
      timestamp: new Date().toISOString(),
      version: "1.0",
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    res.status(500).json({ error: "Failed to export data" });
  }
});

// Import table data
app.post("/import", async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    if (!data || !data.columns || !data.rows) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const criteriaRepository = AppDataSource.getRepository(Criteria);
    const formulaRepository = AppDataSource.getRepository(Formula);
    const attributeRepository = AppDataSource.getRepository(Attribute);

    // Get existing columns and rows
    const existingColumns = await criteriaRepository.find();
    const existingRows = await formulaRepository.find();

    // Process columns - add new ones and keep track of all columns
    const columnMap = new Map();

    // First add existing columns to the map
    for (const column of existingColumns) {
      columnMap.set(column.name, column);
    }

    // Process imported columns - add new ones or use existing ones
    for (const columnName of data.columns) {
      // Check if column already exists
      const existingColumn = existingColumns.find((c) => c.name === columnName);

      if (existingColumn) {
        // Column already exists, use it
        columnMap.set(columnName, existingColumn);
      } else {
        // Create new column
        const newColumn = new Criteria();
        newColumn.name = columnName;
        await criteriaRepository.save(newColumn);
        columnMap.set(columnName, newColumn);
      }
    }

    // Process rows and their attributes
    for (const rowData of data.rows) {
      let row: Formula;

      // Check if the row already exists
      const existingRow = await formulaRepository.findOne({
        where: { name: rowData.name },
      });

      if (existingRow) {
        // Update existing row
        existingRow.annotation = rowData.annotation || existingRow.annotation;
        row = await formulaRepository.save(existingRow);
      } else {
        // Create new row
        const newRow = new Formula();
        newRow.name = rowData.name;
        newRow.annotation = rowData.annotation || "";
        row = await formulaRepository.save(newRow);
      }

      // Process attributes for this row
      for (const [columnName, value] of Object.entries(rowData.attributes)) {
        const column = columnMap.get(columnName);
        if (column) {
          // Check if attribute already exists
          const existingAttr = await attributeRepository.findOne({
            where: {
              formula_id: row.id,
              criteria_id: column.id,
            },
          });

          if (existingAttr) {
            // Update existing attribute
            existingAttr.value = value as string;
            await attributeRepository.save(existingAttr);
          } else {
            // Create new attribute
            const newAttr = new Attribute();
            newAttr.formula_id = row.id;
            newAttr.criteria_id = column.id;
            newAttr.value = value as string;
            await attributeRepository.save(newAttr);
          }
        }
      }
    }

    res.json({ message: "Data imported successfully" });
  } catch (error) {
    console.error("Error importing data:", error);
    res.status(500).json({ error: "Failed to import data" });
  }
});
