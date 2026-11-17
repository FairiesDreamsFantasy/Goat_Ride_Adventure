import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route to download the SOURCE code
  app.get("/api/download-source", (req, res) => {
    try {
      const zip = new AdmZip();
      const rootDir = process.cwd();
      const folderName = "Goat_Ride_Adventure";
      
      const items = fs.readdirSync(rootDir);
      
      items.forEach(item => {
        const fullPath = path.join(rootDir, item);
        const stats = fs.statSync(fullPath);
        
        if (['node_modules', 'dist', '.git', '.env', '.env.local'].includes(item)) {
          return;
        }
        
        if (stats.isDirectory()) {
          zip.addLocalFolder(fullPath, path.join(folderName, item));
        } else {
          zip.addLocalFile(fullPath, folderName);
        }
      });

      const buffer = zip.toBuffer();
      
      res.set({
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=${folderName}.zip`,
        "Content-Length": buffer.length,
      });
      
      res.send(buffer);
    } catch (error) {
      res.status(500).send(`Failed to generate source zip: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  // API Route to BUILD and download the PRODUCTION version
  app.get("/api/download-production", async (req, res) => {
    try {
      await execPromise("npx vite build");
      
      const zip = new AdmZip();
      const distPath = path.join(process.cwd(), 'dist');
      const folderName = "Goat_Ride_Adventure";

      if (!fs.existsSync(distPath)) {
        throw new Error("Build failed: dist folder not found");
      }

      zip.addLocalFolder(distPath, folderName);

      const readmePath = path.join(process.cwd(), 'README.md');
      if (fs.existsSync(readmePath)) {
        zip.addLocalFile(readmePath, folderName);
      }

      const buffer = zip.toBuffer();
      
      res.set({
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=${folderName}.zip`,
        "Content-Length": buffer.length,
      });
      
      res.send(buffer);
    } catch (error) {
      res.status(500).send(`Failed to generate production build: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
