import "dotenv/config";
import express, { Application, Request, Response } from "express";

const app: Application = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", (req: Request, resp: Response): Response => {
  return resp.status(200);
});

try {
  app.listen(port, (): void => {
    console.log(`Express is running on ${port}!`);
  });
} catch (e) {
  console.log(
    `Error starting up express on port ${port}! ${(e as Error).message}`
  );
}
