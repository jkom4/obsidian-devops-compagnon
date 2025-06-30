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
					markdown += `## 🔧 Service: \`${serviceName}\`\n`;

					if (typeof serviceDef === "object") {
						const def = serviceDef as Record<string, any>;

						if (def.image) {
							markdown += `- **Image**: \`${def.image}\`\n`;
							markdown += `  > This image will be used to run the service container.\n`;
						} else {
							markdown += `- **Image**: \`Not specified\`\n`;
							markdown += `  > No image defined. The service cannot start without an image.\n`;
						}

						if (def.ports) {
							const portInfo = Array.isArray(def.ports)
								? def.ports.map((p: string) => `\`${p}\``).join(', ')
								: `\`${def.ports}\``;
							markdown += `- **Ports**: ${portInfo}\n`;
							markdown += `  > Maps container ports to host machine. Format: \`host:container\`.\n`;
						}

						if (def.volumes) {
							const volumeInfo = Array.isArray(def.volumes)
								? def.volumes.map((v: string) => `\`${v}\``).join(', ')
								: `\`${def.volumes}\``;
							markdown += `- **Volumes**: ${volumeInfo}\n`;
							markdown += `  > Mounts host directories or files into the container.\n`;
						}
					}
				}
			}

			const outputPath = `Parsed/Docker/${file.basename}.md`;
			await this.ensureFolderExists("Parsed/Docker");
			const existing = this.app.vault.getAbstractFileByPath(outputPath);
			if (existing instanceof TFile) {
				await this.app.vault.modify(existing, markdown);
			} else {
				await this.app.vault.create(outputPath, markdown);
			}
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
