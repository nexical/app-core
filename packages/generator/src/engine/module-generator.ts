import { Project, SourceFile } from "ts-morph";
import path from "node:path";
import fs from "node:fs";
import { Formatter } from "../utils/formatter";

export abstract class ModuleGenerator {
    protected project: Project;
    protected modulePath: string;
    protected moduleName: string;
    protected generatedFiles: Set<string> = new Set();

    constructor(modulePath: string) {
        this.modulePath = path.resolve(modulePath);
        this.moduleName = path.basename(this.modulePath);
        this.project = new Project({
            // tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
            // skipAddingFilesFromTsConfig: true
            compilerOptions: {
                target: 99, // ESNext
                module: 99, // ESNext
                moduleResolution: 2, // Node
                esModuleInterop: true,
                skipLibCheck: true,
                strict: false
            }
        });
    }

    abstract run(): Promise<void>;

    protected getOrCreateFile(filePath: string): SourceFile {
        const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(this.modulePath, filePath);
        const dir = path.dirname(absolutePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        let file = this.project.getSourceFile(absolutePath);
        if (file && !this.generatedFiles.has(file.getFilePath())) {
            console.log(`[ModuleGenerator] [CACHE_EVICT] ${absolutePath}`);
            this.project.removeSourceFile(file);
            file = undefined;
        }

        if (fs.existsSync(absolutePath)) {
            console.log(`[ModuleGenerator] [LOAD] ${absolutePath}`);
            file = this.project.addSourceFileAtPath(absolutePath);
        } else {
            console.log(`[ModuleGenerator] [CREATE] ${absolutePath}`);
            file = this.project.createSourceFile(absolutePath, "", { overwrite: true });
        }

        const finalizedPath = file.getFilePath();
        console.log(`[ModuleGenerator] [ADD_SET] ${finalizedPath}`);
        this.generatedFiles.add(finalizedPath);
        return file;
    }

    protected cleanup(targetDir: string, pattern: RegExp): void {
        const absoluteDir = path.isAbsolute(targetDir) ? targetDir : path.join(this.modulePath, targetDir);
        if (!fs.existsSync(absoluteDir)) return;

        const files = fs.readdirSync(absoluteDir);
        for (const file of files) {
            const fullPath = path.join(absoluteDir, file);
            if (fs.lstatSync(fullPath).isDirectory()) {
                this.cleanup(fullPath, pattern);
                continue;
            }
            if (pattern.test(file)) {
                const inSet = this.generatedFiles.has(fullPath);

                // Header-based Safe Cleanup
                let shouldDelete = false;
                if (!inSet) {
                    const content = fs.readFileSync(fullPath, 'utf-8');
                    // Check for generated header
                    if (content.includes('// GENERATED CODE - DO NOT MODIFY')) {
                        shouldDelete = true;
                    } else {
                        console.log(`[ModuleGenerator] [PRESERVE_MANUAL] ${fullPath}`);
                    }
                }

                if (shouldDelete) {
                    console.log(`[ModuleGenerator] [DELETE] ${fullPath}`);
                    fs.unlinkSync(fullPath);
                }
            }
        }
    }

    protected async saveAll(): Promise<void> {
        console.log(`[ModuleGenerator] [SAVE_ALL] Total project files: ${this.project.getSourceFiles().length}`);

        for (const file of this.project.getSourceFiles()) {
            const filePath = file.getFilePath();
            const inSet = this.generatedFiles.has(filePath);
            const forgotten = (file as any).wasForgotten?.() || false;

            console.log(`[ModuleGenerator] [PROJECT_FILE] ${filePath} | IN_SET: ${inSet} | FORGOTTEN: ${forgotten}`);

            if (inSet) {
                console.log(`[ModuleGenerator] [SAVE] ${filePath}`);

                // Get the text from ts-morph
                const content = file.getFullText();

                // Format the content
                const formatted = await Formatter.format(content, filePath);

                // Write to disk manually
                fs.writeFileSync(filePath, formatted);
            } else {
                console.log(`[ModuleGenerator] [SAVE_SKIP] ${filePath}`);
            }
        }

        // Also check if any files in set are NOT in project
        for (const setPath of this.generatedFiles) {
            if (!this.project.getSourceFile(setPath)) {
                console.log(`[ModuleGenerator] [MISSING_FROM_PROJECT] ${setPath}`);
            }
        }
    }
}
