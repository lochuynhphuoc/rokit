import { MongoClient } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export type ToolStatus = "available" | "unavailable";

export type Tool = {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  status: ToolStatus;
  order: number;
};

let cachedClient: MongoClient | null = null;

function getWebsiteIcon(url: string) {
  try {
    const website = new URL(url);
    const hostname = website.hostname.toLowerCase();

    const knownIcons: Record<string, string> = {
      "rocheck.vercel.app": "https://rocheck.vercel.app/favicon.png",
      "rolinkresolver.vercel.app": "https://rolinkresolver.vercel.app/icon.png",
    };

    if (knownIcons[hostname]) {
      return knownIcons[hostname];
    }

    return `${website.origin}/favicon.ico`;
  } catch {
    return "/vercel.svg";
  }
}

async function getClient() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }

  return cachedClient;
}

function normalizeTool(
  raw: Partial<Tool> | undefined,
  fallbackId?: string,
  fallbackOrder = 0
): Tool {
  const id = String(raw?.id || fallbackId || "tool");

  return {
    id,
    name: String(raw?.name || "New Tool"),
    description: String(raw?.description || ""),
    url: String(raw?.url || "#"),
    icon: getWebsiteIcon(String(raw?.url || "")),
    status: raw?.status === "unavailable" ? "unavailable" : "available",
    order:
      typeof raw?.order === "number" && Number.isFinite(raw.order)
        ? raw.order
        : fallbackOrder,
  };
}

async function readToolsFromDb(): Promise<Tool[]> {
  const client = await getClient();
  const collection = client.db("rokit").collection("tools");

  const docs = await collection.find({}).toArray();

  if (!docs.length) {
    return [];
  }

  const tools = docs.map((doc, index) =>
    normalizeTool(
      doc as Partial<Tool>,
      String(doc._id || doc.id || `tool-${index}`),
      index
    )
  );

  tools.sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order;
    }

    return a.name.localeCompare(b.name);
  });

  return tools;
}

export async function GET() {
  try {
    const tools = await readToolsFromDb();

    return NextResponse.json({ tools });
  } catch (error) {
    console.error("GET /api/tools error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        tools: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const pass = String(body.pass || "");

  if (pass !== (process.env.ADMIN_PASS || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await getClient();
    const collection = client.db("rokit").collection("tools");
    const action = String(body.action || "list");

    if (action === "list") {
      const tools = await readToolsFromDb();

      return NextResponse.json({ tools });
    }

    if (action === "add") {
      const currentTools = await readToolsFromDb();

      const tool = normalizeTool(
        body.tool,
        `tool-${Date.now()}`,
        currentTools.length
      );

      tool.order = currentTools.length;

      await collection.updateOne(
        { id: tool.id },
        { $set: tool },
        { upsert: true }
      );

      const tools = await readToolsFromDb();

      return NextResponse.json({
        success: true,
        tools,
      });
    }

    if (action === "update") {
      const tool = normalizeTool(
        body.tool,
        String(body.tool?.id || "tool"),
        0
      );

      const existingTool = await collection.findOne({ id: tool.id });

      if (existingTool && typeof existingTool.order === "number") {
        tool.order = existingTool.order;
      }

      await collection.updateOne(
        { id: tool.id },
        { $set: tool },
        { upsert: true }
      );

      const tools = await readToolsFromDb();

      return NextResponse.json({
        success: true,
        tools,
      });
    }

    if (action === "reorder") {
      const orders = Array.isArray(body.orders) ? body.orders : [];

      for (const item of orders) {
        if (!item || !item.id) {
          continue;
        }

        await collection.updateOne(
          { id: String(item.id) },
          {
            $set: {
              order: Number(item.order),
            },
          }
        );
      }

      const tools = await readToolsFromDb();

      return NextResponse.json({
        success: true,
        tools,
      });
    }

    if (action === "delete") {
      const id = String(body.id || "");

      if (id) {
        await collection.deleteOne({ id });
      }

      const remainingTools = await readToolsFromDb();

      await Promise.all(
        remainingTools.map((tool, index) =>
          collection.updateOne(
            { id: tool.id },
            {
              $set: {
                order: index,
              },
            }
          )
        )
      );

      const tools = await readToolsFromDb();

      return NextResponse.json({
        success: true,
        tools,
      });
    }

    const tools = await readToolsFromDb();

    return NextResponse.json({ tools });
  } catch (error) {
    console.error("POST /api/tools error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        tools: [],
      },
      { status: 500 }
    );
  }
}