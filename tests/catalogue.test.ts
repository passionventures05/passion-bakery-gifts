import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
// @ts-ignore plain ESM helper without types
import { CATEGORIES, TYPES, DEFAULT_DESCRIPTION, buildCatalogue, parseSize, validateProduct } from "../scripts/products-lib.mjs";
import { FILTER_OPTIONS } from "@/lib/products";

const good = {
  name: "Test Gift", category: "Jar Candles", basePrice: 699, baseQuantity: "500gm",
  availableQuantities: ["2kg", "500gm", "1kg"], description: "", available: true,
};

describe("categories stay in sync", () => {
  it("every category belongs to exactly one product type", () => {
    for (const c of CATEGORIES) expect(TYPES.filter((t: { categories: string[] }) => t.categories.includes(c))).toHaveLength(1);
    expect(validateProduct({ ...good, category: "Bath Soaps" }).product.type).toBe("soaps");
  });
  it("script, website filter and CMS form all list the same categories", () => {
    expect(CATEGORIES).toEqual(FILTER_OPTIONS.map((o) => o.label));
    const yml = fs.readFileSync("public/admin/config.yml", "utf8");
    for (const c of CATEGORIES) expect(yml).toContain(`"${c}"`);
  });
});

describe("validateProduct", () => {
  it("accepts a good product and sorts its sizes", () => {
    const r = validateProduct(good);
    expect(r.errors).toEqual([]);
    expect(r.product.availableQuantities).toBe("500gm,1kg,2kg");
    expect(r.product.description).toBe(DEFAULT_DESCRIPTION);
  });
  it("explains what is wrong in plain words", () => {
    const r = validateProduct({ ...good, name: " ", basePrice: 0, category: "Pizza", availableQuantities: [] }, { file: "x.json" });
    expect(r.errors.join("\n")).toMatch(/needs a name/);
    expect(r.errors.join("\n")).toMatch(/price must be a number above 0/);
    expect(r.errors.join("\n")).toMatch(/not one of the allowed categories/);
    expect(r.errors.join("\n")).toMatch(/at least one size/);
  });
  it("rejects mixing weights and pieces", () => {
    expect(validateProduct({ ...good, availableQuantities: ["500gm", "3pc"] }).errors.join()).toMatch(/pieces but the base size/);
  });
  it("understands sizes", () => {
    expect(parseSize("1.5kg")).toEqual({ amount: 1500, unit: "g" });
    expect(parseSize("3pc")).toEqual({ amount: 3, unit: "pc" });
    expect(parseSize("big")).toBeNull();
  });
  it("warns (not fails) when the chosen photo is missing", () => {
    const r = validateProduct({ ...good, image: "/uploads/products/nope.jpg" });
    expect(r.errors).toEqual([]);
    expect(r.warnings.join()).toMatch(/not found/);
    expect(r.product.image).toBeUndefined();
  });
});

describe("buildCatalogue", () => {
  const make = (files: Record<string, object | string>) => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cat-"));
    for (const [f, v] of Object.entries(files)) fs.writeFileSync(path.join(dir, f), typeof v === "string" ? v : JSON.stringify(v));
    return dir;
  };
  it("orders by position then name, and hides unavailable products", () => {
    const dir = make({
      "b.json": { ...good, name: "B Gift", order: 20 },
      "a.json": { ...good, name: "A Gift" },
      "c.json": { ...good, name: "C Gift", order: 10 },
      "h.json": { ...good, name: "Hidden", available: false },
    });
    const r = buildCatalogue(dir, "public");
    expect(r.errors).toEqual([]);
    expect(r.catalogue.map((p: { name: string }) => p.name)).toEqual(["C Gift", "B Gift", "A Gift"]);
  });
  it("rejects duplicate names and broken files", () => {
    const dir = make({ "a.json": good, "b.json": good, "c.json": "{ nope" });
    const r = buildCatalogue(dir, "public");
    expect(r.errors.join("\n")).toMatch(/both called "Test Gift"/);
    expect(r.errors.join("\n")).toMatch(/not valid JSON/);
  });
  it("the real content folder is valid", () => {
    const r = buildCatalogue("content/products", "public");
    expect(r.errors).toEqual([]);
    expect(r.catalogue.length).toBeGreaterThanOrEqual(12);
  });
});
