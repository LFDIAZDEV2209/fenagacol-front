import { listTerritory, saveTerritory } from "../_territory";
export const GET = (req: Request) => listTerritory(req, "departments");
export const POST = (req: Request) => saveTerritory(req, "departments");
