import { Project, SourceFile } from 'ts-morph';

export class TestProject {
    project: Project;

    constructor() {
        this.project = new Project({
            useInMemoryFileSystem: true,
            skipAddingFilesFromTsConfig: true,
        });
    }

    createSourceFile(fileName: string, content: string): SourceFile {
        return this.project.createSourceFile(fileName, content);
    }

    getSourceFile(fileName: string): SourceFile | undefined {
        return this.project.getSourceFile(fileName);
    }
}

export function createTestProject() {
    return new TestProject();
}
