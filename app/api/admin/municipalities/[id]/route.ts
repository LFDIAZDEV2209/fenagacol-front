import { deleteTerritory, saveTerritory } from "../../_territory";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(req: Request, ctx: Context) {
  return saveTerritory(req, "municipalities", (await ctx.params).id);
}
export async function DELETE(_req: Request, ctx: Context) {
  return deleteTerritory("municipalities", (await ctx.params).id);
}
