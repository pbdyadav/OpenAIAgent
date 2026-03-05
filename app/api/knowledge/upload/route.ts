export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import pdf from "pdf-parse-fixed";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const companyId = formData.get("companyId") as string;

        if (!file || !companyId) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        const supabase = await createClient();
        let content = "";

        if (file.type === "application/pdf") {
            const buffer = Buffer.from(await file.arrayBuffer());
            const data = await pdf(buffer);
            content = data.text;
        } else {
            content = await file.text();
        }

        await supabase.from("knowledge_documents").insert({
            company_id: companyId,
            file_name: file.name,
            content: content,
            file_type: file.type || "text/plain",
            file_size: file.size,
            processed: true,
        });

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error("UPLOAD ERROR:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}