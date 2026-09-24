const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputDir = path.resolve(process.argv[2] || path.join(__dirname, "..", "dist"));
const expoCommand = process.platform === "win32" ? "npx.cmd" : "npx";

execFileSync(expoCommand, ["expo", "export", "--platform", "web", "--output-dir", outputDir], {
    cwd: path.join(__dirname, ".."),
    shell: process.platform === "win32",
    stdio: "inherit"
});

const indexPath = path.join(outputDir, "index.html");
const indexHtml = fs.readFileSync(indexPath, "utf8");
const runtimeScript = '<script src="/runtime-config.js"></script>';

if (!indexHtml.includes(runtimeScript)) {
    const bundleScript = /<script src="\/_expo\/static\/js\/web\/[^\"]+" defer><\/script>/;
    if (!bundleScript.test(indexHtml)) {
        throw new Error(`Bundle web não encontrado em ${indexPath}`);
    }
    fs.writeFileSync(indexPath, indexHtml.replace(bundleScript, `${runtimeScript}\n  $&`));
}