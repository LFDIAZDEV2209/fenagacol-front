import { listTerritory, saveTerritory } from "../_territory";
export const GET = (req: Request) => listTerritory(req, "municipalities");
export const POST = (req: Request) => saveTerritory(req, "municipalities");
