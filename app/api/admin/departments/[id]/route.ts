import { deleteTerritory, saveTerritory } from "../../_territory";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(req: Request, ctx: Context) {
  return saveTerritory(req, "departments", (await ctx.params).id);
}
export async function DELETE(_req: Request, ctx: Context) {
  return deleteTerritory("departments", (await ctx.params).id);
}
