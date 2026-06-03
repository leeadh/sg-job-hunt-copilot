import { NextRequest, NextResponse } from "next/server";
import { SALARY_BENCHMARKS } from "@/data/salary-benchmarks";

export async function GET(req: NextRequest) {
  const field = req.nextUrl.searchParams.get("field");

  if (field) {
    const normalized = field.toLowerCase();
    const results = SALARY_BENCHMARKS.filter(b =>
      b.field.toLowerCase().includes(normalized)
    );
    return NextResponse.json(results);
  }

  const fields = [...new Set(SALARY_BENCHMARKS.map(b => b.field))].sort();
  return NextResponse.json({ fields, total: SALARY_BENCHMARKS.length });
}
