import { App, TFile } from 'obsidian';
import { load as parseYaml } from 'js-yaml';

export class DockerParser {
	app: App;
	settings: any;

	constructor(app: App, settings: any) {
		this.app = app;
		this.settings = settings;
	}

	async parseFile(file: TFile) {
		const content = await this.app.vault.read(file);

		try {
			const data = parseYaml(content) as any;

			let markdown = `# 🐳 Docker Compose Summary\n\n`;
			markdown += `**File :** \`${file.path}\`\n\n`;

			if (!data.services) {
				markdown += `⚠️ No services detected in this file.\n`;
			} else {
				for (const [serviceName, serviceDef] of Object.entries(data.services)) {
					markdown += `## Service: \`${serviceName}\`\n`;
					markdown += `- **Image**: \`${serviceDef['image'] || ' not specified'}\`\n`;
					if (serviceDef['ports']) {
						markdown += `- **Ports**: \`${serviceDef['ports'].join(', ')}\`\n`;
					}
					if (serviceDef['volumes']) {
						markdown += `- **Volumes**: \`${serviceDef['volumes'].join(', ')}\`\n`;
					}
					markdown += '\n';
				}
			}

			const outputPath = `Parsed/Docker/${file.basename}.md`;
			await this.ensureFolderExists("Parsed/Docker");
			await this.app.vault.create(outputPath, markdown);
			console.log(`✅ Docker file parsed and saved to: ${outputPath}`);

		} catch (error) {
			console.error(' Error during Docker parsing:', error);
		}
	}

	private async ensureFolderExists(folderPath: string) {
		const folder = this.app.vault.getAbstractFileByPath(folderPath);
		if (!folder) {
			await this.app.vault.createFolder(folderPath);
		}
	}
}
